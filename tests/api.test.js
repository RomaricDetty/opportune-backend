const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const request = require('supertest');

require('dotenv').config();
const TEST_DB = `${process.env.DB_NAME}_test`;
process.env.DB_NAME = TEST_DB;
process.env.NODE_ENV = 'test';
process.env.UPLOADS_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'uploads-test-'));
delete process.env.SMTP_HOST;

const connection = () =>
    mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || undefined,
    });

let app;
let models;
let tokens;
let refs;
const PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64',
);

const as = (role) => ({ Authorization: `Bearer ${tokens[role]}` });

before(async () => {
    const db = await connection();
    await db.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
    await db.query(`CREATE DATABASE \`${TEST_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await db.end();

    app = require('../src/server');
    models = require('../src/models');
    await models.sequelize.sync({ force: true });
    const { getJwtSecret } = require('../src/config/jwt');

    tokens = {};
    for (const role of ['admin', 'catalogue', 'commandes']) {
        const account = await models.Admin.create({ login: `test-${role}`, password: 'secret-123', role });
        tokens[role] = jwt.sign({ id: account.id, role: 'admin' }, getJwtSecret());
    }
    const rayon = await models.SiteCategory.create({ libelle: 'Supermarché' });
    const category = await models.Category.create({ libelle: 'Boissons', idSiteCategory: rayon.id });
    const marque = await models.Marque.create({ libelle: 'Volvic' });
    const client = await models.Client.create({
        nom: 'Test', prenom: 'Client', email: 'client@test.ci', telephone: '0102030405', password: 'secret-123',
    });
    refs = { rayon, category, marque, client };
});

after(async () => {
    await models.sequelize.close();
    const db = await connection();
    await db.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
    await db.end();
    fs.rmSync(process.env.UPLOADS_DIR, { recursive: true, force: true });
});

/** Crée un article directement en base. */
const product = (fields = {}) =>
    models.Produit.create({
        libelle: 'Eau 1L',
        prix: 1000,
        quantite_minimale: 1,
        quantite_stock: 10,
        idMarque: refs.marque.id,
        idCategory: refs.category.id,
        ...fields,
    });

test('écritures du catalogue refusées sans connexion', async () => {
    const item = await product();
    const calls = [
        request(app).delete(`/api/products/${item.id}`),
        request(app).put(`/api/products/${item.id}/stock`).send({ quantite_stock: 1, operation: 'set' }),
        request(app).post(`/api/products/${item.id}/restore`),
        request(app).post('/api/products/bulk').send({ ids: [item.id], action: 'delete' }),
        request(app).post('/api/products/import').send({ rows: [] }),
        request(app).delete(`/api/categories/${refs.category.id}`),
        request(app).delete(`/api/site-categories/${refs.rayon.id}`),
        request(app).post('/api/brands').send({ libelle: 'X' }),
        request(app).get('/api/admin/dashboard/logs'),
    ];
    for (const call of calls) assert.equal((await call).status, 401);
});

test('les rôles limitent les droits', async () => {
    const orders = () => request(app).get('/api/admin/orders');
    assert.equal((await orders().set(as('catalogue'))).status, 403);
    assert.equal((await orders().set(as('commandes'))).status, 200);

    const brand = (libelle) => request(app).post('/api/brands').field('libelle', libelle);
    assert.equal((await brand('Refusée').set(as('commandes'))).status, 403);
    assert.equal((await brand('Acceptée').set(as('catalogue'))).status, 201);

    const admins = () => request(app).get('/api/admins');
    assert.equal((await admins().set(as('catalogue'))).status, 403);
    assert.equal((await admins().set(as('admin'))).status, 200);
});

test('un admin ne peut pas se retirer ses droits', async () => {
    const me = await models.Admin.findOne({ where: { login: 'test-admin' } });
    const response = await request(app).put(`/api/admins/${me.id}`).set(as('admin')).send({ role: 'catalogue' });
    assert.equal(response.status, 400);
});

test('un article désactivé disparaît du site mais reste visible du back-office', async () => {
    const hidden = await product({ libelle: 'Caché', isActive: false });
    assert.equal((await request(app).get(`/api/products/${hidden.id}`)).status, 404);

    const list = await request(app).get('/api/products');
    assert.ok(!list.body.data.some((item) => item.id === hidden.id));

    const forced = await request(app).get('/api/products?isActive=false');
    assert.ok(!forced.body.data.some((item) => item.id === hidden.id));

    const home = await request(app).get('/api/products/home');
    assert.ok(!home.body.data.flatMap((group) => group.produits).some((item) => item.id === hidden.id));

    const admin = await request(app).get('/api/admin/products').set(as('admin'));
    assert.ok(admin.body.data.some((item) => item.id === hidden.id));
    assert.equal((await request(app).get(`/api/admin/products/${hidden.id}`).set(as('admin'))).status, 200);
});

test('la réduction saisie au dashboard est enregistrée', async () => {
    const send = (req) =>
        req.set(as('admin'))
            .field('libelle', 'Promo')
            .field('prix', '1000')
            .field('quantite_minimale', '1')
            .field('quantite_stock', '5')
            .field('idMarque', refs.marque.id)
            .field('idCategory', refs.category.id);
    const created = await send(request(app).post('/api/products')).field('reduction', '15');
    assert.equal(created.status, 201);
    assert.equal(Number(created.body.data.remise), 15);

    const updated = await send(request(app).put(`/api/products/${created.body.data.id}`)).field('reduction', '20');
    assert.equal(updated.status, 200);
    assert.equal(Number(updated.body.data.remise), 20);
});

test('annuler une commande rend le stock, la réactiver le reprend', async () => {
    const item = await product({ quantite_stock: 5 });
    const order = await models.Order.create({
        idClient: refs.client.id,
        montantTotal: 3000,
        adresseLivraison: 'A',
        villeLivraison: 'Abidjan',
        telephoneLivraison: '01',
    });
    await models.OrderItem.create({
        idOrder: order.id, idProduit: item.id, libelle: item.libelle, prixUnitaire: 1000, quantite: 3, sousTotal: 3000,
    });
    const setStatus = (statut) =>
        request(app).put(`/api/admin/orders/${order.id}/statut`).set(as('commandes')).send({ statut });
    const stock = async () => (await item.reload()).quantite_stock;

    assert.equal((await setStatus('cancelled')).status, 200);
    assert.equal(await stock(), 8);
    assert.equal((await setStatus('cancelled')).status, 200);
    assert.equal(await stock(), 8, 'annuler deux fois ne rend le stock qu’une fois');

    assert.equal((await setStatus('confirmed')).status, 200);
    assert.equal(await stock(), 5);
});

test('la réactivation est refusée si le stock manque', async () => {
    const item = await product({ quantite_stock: 0 });
    const order = await models.Order.create({
        idClient: refs.client.id, montantTotal: 2000, adresseLivraison: 'A', villeLivraison: 'B', telephoneLivraison: '01',
        statut: 'cancelled',
    });
    await models.OrderItem.create({
        idOrder: order.id, idProduit: item.id, libelle: item.libelle, prixUnitaire: 1000, quantite: 2, sousTotal: 2000,
    });
    const response = await request(app)
        .put(`/api/admin/orders/${order.id}/statut`).set(as('admin')).send({ statut: 'confirmed' });
    assert.equal(response.status, 400);
    await order.reload();
    assert.equal(order.statut, 'cancelled');
});

test('actions en masse : catégorie, remise, prix et suppression', async () => {
    const other = await models.Category.create({ libelle: 'Jus', idSiteCategory: refs.rayon.id });
    const items = [await product({ prix: 1000 }), await product({ prix: 2000 })];
    const ids = items.map((item) => item.id);
    const bulk = (body) => request(app).post('/api/admin/products/bulk').set(as('catalogue')).send(body);

    const moved = await bulk({ ids, changes: { idCategory: other.id, remise: 10, prixPercent: 10 } });
    assert.equal(moved.status, 200);
    assert.equal(moved.body.data.count, 2);
    await items[1].reload();
    assert.equal(items[1].idCategory, other.id);
    assert.equal(Number(items[1].remise), 10);
    assert.equal(Number(items[1].prix), 2200);

    assert.equal((await bulk({ ids, changes: { remise: 150 } })).status, 400);
    assert.equal((await bulk({ ids, changes: {} })).status, 400);
    assert.equal((await bulk({ ids: [], changes: { remise: 1 } })).status, 400);
    assert.equal((await bulk({ ids, changes: { prixPercent: '1); DROP TABLE produits; --' } })).status, 400);

    assert.equal((await bulk({ ids, action: 'delete' })).status, 200);
    assert.equal(await models.Produit.count({ where: { id: ids } }), 0);
});

test('import : vérification, tout ou rien, création puis mise à jour', async () => {
    const send = (rows, dryRun = false) =>
        request(app).post('/api/admin/products/import').set(as('catalogue')).send({ rows, dryRun });
    const good = { libelle: 'Coca 33cl', reference: 'IMP-1', rayon: 'supermarché', categorie: 'boissons', marque: 'VOLVIC', prix: '1 200,50', stock: '4' };

    const preview = await send([good], true);
    assert.equal(preview.body.data.created, 1);
    assert.equal(preview.body.data.imported, false);
    assert.equal(await models.Produit.count({ where: { reference: 'IMP-1' } }), 0);

    const bad = { ...good, reference: 'IMP-2', marque: 'Inconnue', prix: 'abc' };
    const refused = await send([good, bad]);
    assert.equal(refused.body.data.imported, false);
    assert.deepEqual(refused.body.data.errors.map((error) => error.line), [3, 3]);
    assert.equal(await models.Produit.count({ where: { reference: 'IMP-1' } }), 0, 'rien n’est importé');

    assert.equal((await send([good])).body.data.created, 1);
    const created = await models.Produit.findOne({ where: { reference: 'IMP-1' } });
    assert.equal(Number(created.prix), 1201);

    const again = await send([{ ...good, stock: 9 }]);
    assert.equal(again.body.data.updated, 1);
    await created.reload();
    assert.equal(created.quantite_stock, 9);

    const dup = await send([good, good]);
    assert.match(dup.body.data.errors[0].message, /double/);
    assert.equal((await send([])).status, 400);
});

test('les images sont stockées en fichiers et servies en URL complète', async () => {
    const created = await request(app)
        .post('/api/brands').set(as('admin')).field('libelle', 'Logo Test')
        .attach('logo', PNG, { filename: 'l.png', contentType: 'image/png' });
    assert.equal(created.status, 201);
    assert.match(created.body.data.logo, /^http:\/\/.+\/uploads\/images\/.+\.png$/);

    const stored = await models.Marque.findByPk(created.body.data.id);
    assert.match(stored.logo, /^\/uploads\/images\//, 'la base garde un chemin relatif');

    const file = await request(app).get(stored.logo);
    assert.equal(file.status, 200);
    assert.equal(file.headers['content-type'], 'image/png');
    assert.match(file.headers['content-security-policy'], /sandbox/);
});

test('modifier un article garde ses images secondaires sous forme de chemin', async () => {
    const created = await request(app).post('/api/products').set(as('admin'))
        .field('libelle', 'Galerie').field('prix', '10').field('quantite_minimale', '1').field('quantite_stock', '1')
        .field('idMarque', refs.marque.id).field('idCategory', refs.category.id)
        .attach('images', PNG, { filename: 'a.png', contentType: 'image/png' });
    const absolute = created.body.data.images[0];
    assert.match(absolute, /^http/);

    const updated = await request(app).put(`/api/products/${created.body.data.id}`).set(as('admin'))
        .field('libelle', 'Galerie').field('prix', '10').field('quantite_minimale', '1').field('quantite_stock', '1')
        .field('idMarque', refs.marque.id).field('idCategory', refs.category.id)
        .field('keepImages', JSON.stringify([absolute]));
    assert.equal(updated.status, 200);
    const stored = await models.Produit.findByPk(created.body.data.id);
    assert.match(stored.images[0], /^\/uploads\/images\//);
});

test('publicité : l’image reste exploitable par le site', async () => {
    const created = await request(app).post('/api/publicites').set(as('catalogue'))
        .field('libelle', 'Pub').field('idCategory', refs.category.id).field('emplacement', 'product_side')
        .attach('images', PNG, { filename: 'p.png', contentType: 'image/png' });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.emplacement, 'product_side');
    assert.match(JSON.parse(created.body.data.images)[0], /^http.+\/uploads\/images\//);
});

test('le tableau de bord signale ce qu’il faut corriger', async () => {
    await models.Category.create({ libelle: 'Orpheline' });
    const { body } = await request(app).get('/api/admin/dashboard/health').set(as('catalogue'));
    const noRayon = body.data.find((issue) => issue.key === 'noRayon');
    assert.ok(noRayon.count >= 1);
    assert.ok(noRayon.examples.includes('Orpheline'));

    const counters = await request(app).get('/api/admin/dashboard/counters').set(as('commandes'));
    assert.equal(counters.status, 200);
    assert.ok(counters.body.data.orders >= 0);
});

test('l’historique note les modifications sans conserver le corps', async () => {
    await request(app).post('/api/brands').set(as('catalogue')).field('libelle', 'Tracée');
    let logs;
    for (let attempt = 0; attempt < 20; attempt += 1) {
        logs = await models.AdminLog.findAll({ where: { label: 'Tracée' } });
        if (logs.length) break;
        await new Promise((resolve) => setImmediate(resolve));
    }
    assert.equal(logs.length, 1);
    assert.equal(logs[0].adminLogin, 'test-catalogue');
    assert.equal(logs[0].path, '/api/brands');

    await request(app).post('/api/admins').set(as('admin')).send({ login: 'nouveau', password: 'motdepasse-secret' });
    const all = await request(app).get('/api/admin/dashboard/logs').set(as('admin'));
    assert.equal(all.status, 200);
    assert.ok(!JSON.stringify(all.body).includes('motdepasse-secret'));
    assert.equal((await request(app).get('/api/admin/dashboard/logs').set(as('catalogue'))).status, 403);
});

test('le corps d’une création d’admin ne renvoie pas le mot de passe', async () => {
    const response = await request(app).post('/api/admins').set(as('admin'))
        .send({ login: 'sans-fuite', password: 'motdepasse-secret', role: 'commandes' });
    assert.equal(response.status, 201);
    assert.equal(response.body.data.password, undefined);
});
