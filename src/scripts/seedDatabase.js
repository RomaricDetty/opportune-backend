require('dotenv').config();
const {
    sequelize,
    SiteCategory,
    Category,
    Marque,
    Produit,
    Admin,
    Client,
    Publicite,
    Order,
    OrderItem,
    Wishlist,
    DemandeDevisItems,
    DemandeDevis,
} = require('../models');
const seedData = require('./seedData');

/**
 * Vide les données métier (ordre FK) pour un re-seed.
 * @param {import('sequelize').Transaction} transaction
 */
async function clearCatalogData(transaction) {
    const opts = { where: {}, transaction, force: true };
    await DemandeDevisItems.destroy(opts);
    await DemandeDevis.destroy(opts);
    await OrderItem.destroy(opts);
    await Order.destroy(opts);
    await Wishlist.destroy(opts);
    await Publicite.destroy(opts);
    await Produit.destroy(opts);
    await Marque.destroy(opts);
    await Category.destroy(opts);
    await SiteCategory.destroy(opts);
    await Client.destroy(opts);
    await Admin.destroy(opts);
}

/**
 * Indexe une liste par libellé.
 * @param {Array<{ libelle: string }>} list
 * @returns {Record<string, object>}
 */
function byLibelle(list) {
    return Object.fromEntries(list.map((item) => [item.libelle, item]));
}

/**
 * Remplit la base avec le snapshot local (admins, catégories, marques, articles).
 * Compatible migrations : ne recrée pas les tables.
 * Usage : `npm run db:seed` | `npm run db:seed -- --force`
 */
const seedDatabase = async () => {
    const force = process.argv.includes('--force') || process.env.SEED_FORCE === '1';

    try {
        console.log('Démarrage du seeding (snapshot local)...');
        await sequelize.authenticate();

        const adminCount = await Admin.count({ paranoid: false });
        if (adminCount > 0 && !force) {
            console.log(
                'Base déjà peuplée (admin présent). Relancez avec --force pour écraser les données.',
            );
            if (require.main === module) process.exit(0);
            return { skipped: true };
        }

        const transaction = await sequelize.transaction();

        try {
            if (adminCount > 0 && force) {
                console.log('Mode --force : suppression des données existantes...');
                await clearCatalogData(transaction);
            }

            // Admins / clients : hashes déjà bcrypt → hooks désactivés
            await Admin.bulkCreate(
                seedData.admins.map((a) => ({
                    login: a.login,
                    password: a.passwordHash,
                    nom: a.nom,
                    prenom: a.prenom,
                    email: a.email,
                    isActive: a.isActive,
                })),
                { transaction, hooks: false },
            );

            const clients = await Client.bulkCreate(
                seedData.clients.map((c) => ({
                    email: c.email,
                    password: c.passwordHash,
                    nom: c.nom,
                    prenom: c.prenom,
                    telephone: c.telephone,
                    adresse: c.adresse,
                    ville: c.ville,
                    isActive: c.isActive,
                })),
                { transaction, hooks: false, returning: true },
            );

            const siteCats = await SiteCategory.bulkCreate(
                seedData.siteCategories.map((s) => ({
                    libelle: s.libelle,
                    description: s.description,
                    isActive: s.isActive,
                })),
                { transaction, returning: true },
            );
            const siteMap = byLibelle(siteCats);

            const categories = await Category.bulkCreate(
                seedData.categories.map((c) => ({
                    libelle: c.libelle,
                    description: c.description,
                    idSiteCategory: siteMap[c.siteCategory]?.id || null,
                    isActive: c.isActive,
                })),
                { transaction, returning: true },
            );
            const catMap = byLibelle(categories);

            const marques = await Marque.bulkCreate(
                seedData.marques.map((m) => ({
                    libelle: m.libelle,
                    description: m.description,
                    logo: m.logo,
                    idSiteCategory: siteMap[m.siteCategory]?.id || null,
                    isActive: m.isActive,
                })),
                { transaction, returning: true },
            );
            const marqueMap = byLibelle(marques);

            const produits = await Produit.bulkCreate(
                seedData.produits.map((p) => ({
                    libelle: p.libelle,
                    description: p.description,
                    prix: p.prix,
                    remise: p.remise,
                    quantite_stock: p.quantite_stock,
                    quantite_minimale: p.quantite_minimale,
                    devise: p.devise,
                    idMarque: marqueMap[p.marque]?.id,
                    idCategory: catMap[p.category]?.id,
                    caracteristiques: p.caracteristiques,
                    featured: p.featured,
                    isActive: p.isActive,
                    isAvailable: p.isAvailable,
                    imagePrincipale: p.imagePrincipale,
                    images: p.images,
                    reference: p.reference,
                })),
                { transaction, returning: true },
            );
            const produitMap = byLibelle(produits);

            await Publicite.bulkCreate(
                seedData.publicites.map((p) => ({
                    libelle: p.libelle,
                    description: p.description,
                    images: JSON.stringify(p.images || []),
                    isActive: p.isActive,
                    idCategory: p.category ? catMap[p.category]?.id : null,
                    idProduit: p.produit ? produitMap[p.produit]?.id : null,
                    emplacement: p.emplacement || 'hero',
                })),
                { transaction },
            );

            await transaction.commit();

            console.log('\n✅ Seeding terminé (données locales)');
            console.log('────────────────────────────');
            console.log(`Admins          : ${seedData.admins.map((a) => a.login).join(', ')}`);
            console.log(`Clients         : ${clients.length}`);
            console.log(`Site catégories : ${siteCats.length}`);
            console.log(`Catégories      : ${categories.length}`);
            console.log(`Marques         : ${marques.length}`);
            console.log(`Produits        : ${produits.length}`);
            console.log(`Publicités      : ${seedData.publicites.length}`);
            console.log('────────────────────────────');

            if (require.main === module) process.exit(0);
            return { skipped: false };
        } catch (innerError) {
            await transaction.rollback();
            throw innerError;
        }
    } catch (error) {
        console.error('Erreur lors du seeding:', error);
        if (require.main === module) process.exit(1);
        throw error;
    }
};

module.exports = seedDatabase;
if (require.main === module) seedDatabase();
