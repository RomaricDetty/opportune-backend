const { sequelize, Produit, Marque, Category, SiteCategory } = require('../models');

const MAX_ROWS = 2000;

/** @param {unknown} value */
const text = (value) => (value === undefined || value === null ? '' : String(value).trim());

/** Clé de comparaison : ignore la casse et les espaces en trop. */
const key = (value) => text(value).toLowerCase().replace(/\s+/g, ' ');

/**
 * Lit un nombre saisi dans un tableur (« 1 200,50 »).
 * @param {unknown} value
 * @returns {number|null} null si vide, NaN si invalide
 */
function parseNumber(value) {
    const raw = text(value).replace(/[\s  ]/g, '').replace(',', '.');
    return raw === '' ? null : Number(raw);
}

/**
 * Valide une ligne et la traduit en champs produit.
 * @param {Record<string, unknown>} row
 * @param {{ categories: object[], marques: Map<string, object> }} refs
 * @returns {{ errors: string[], values: object, reference: string }}
 */
function readRow(row, { categories, marques }) {
    const errors = [];
    const libelle = text(row.libelle);
    if (libelle.length < 2 || libelle.length > 200) errors.push('Nom requis (2 à 200 caractères)');

    const marque = marques.get(key(row.marque));
    if (!marque) errors.push(`Marque introuvable : « ${text(row.marque)} »`);

    const rayon = key(row.rayon);
    const matches = categories.filter(
        (category) =>
            key(category.libelle) === key(row.categorie) &&
            (!rayon || key(category.siteCategory?.libelle) === rayon),
    );
    if (matches.length === 0) {
        errors.push(`Catégorie introuvable : « ${text(row.categorie)} »${rayon ? ` dans le rayon « ${text(row.rayon)} »` : ''}`);
    } else if (matches.length > 1) {
        errors.push(`Catégorie « ${text(row.categorie)} » présente dans plusieurs rayons : précisez le rayon`);
    }

    const prix = parseNumber(row.prix);
    if (prix === null || Number.isNaN(prix) || prix < 0) errors.push('Prix invalide');

    const stock = parseNumber(row.stock);
    if (stock === null || !Number.isInteger(stock) || stock < 0) errors.push('Stock invalide (entier positif)');

    const remise = parseNumber(row.remise) ?? 0;
    if (Number.isNaN(remise) || remise < 0 || remise > 100) errors.push('Remise invalide (0 à 100)');

    const minimum = parseNumber(row.quantite_minimale) ?? 1;
    if (!Number.isInteger(minimum) || minimum < 1) errors.push('Quantité minimale invalide');

    const image = text(row.image);
    if (image && !/^https?:\/\//i.test(image)) errors.push('Image : indiquez une adresse http(s)');

    const reference = text(row.reference);
    const values = {
        libelle,
        idMarque: marque?.id,
        idCategory: matches[0]?.id,
        // Le franc CFA n'a pas de centimes.
        prix: Math.round(prix),
        quantite_stock: stock,
        remise,
        quantite_minimale: minimum,
        ...(text(row.description) ? { description: text(row.description) } : {}),
        ...(image ? { imagePrincipale: image } : {}),
    };
    return { errors, values, reference };
}

/**
 * Importe des articles en « tout ou rien » : une seule ligne en erreur bloque l'import.
 * Une référence déjà connue met à jour l'article ; sinon l'article est créé.
 * @param {Record<string, unknown>[]} rows
 * @param {{ dryRun?: boolean }} [options]
 * @returns {Promise<{ total: number, created: number, updated: number, errors: { line: number, message: string }[], imported: boolean }>}
 */
async function importProducts(rows, { dryRun = false } = {}) {
    if (!Array.isArray(rows) || rows.length === 0) {
        throw Object.assign(new Error('Le fichier ne contient aucune ligne'), { status: 400 });
    }
    if (rows.length > MAX_ROWS) {
        throw Object.assign(new Error(`Maximum ${MAX_ROWS} lignes par import`), { status: 400 });
    }

    const [categories, marqueList] = await Promise.all([
        Category.findAll({
            attributes: ['id', 'libelle'],
            include: [{ model: SiteCategory, as: 'siteCategory', attributes: ['libelle'] }],
        }),
        Marque.findAll({ attributes: ['id', 'libelle'] }),
    ]);
    const marques = new Map(marqueList.map((marque) => [key(marque.libelle), marque]));

    const references = rows.map((row) => text(row.reference)).filter(Boolean);
    const existing = await Produit.findAll({
        where: { reference: references },
        attributes: ['id', 'reference'],
        paranoid: false,
    });
    const existingByReference = new Map(existing.map((produit) => [key(produit.reference), produit]));

    const errors = [];
    const seen = new Set();
    const parsed = rows.map((row, index) => {
        // Ligne 1 du fichier = en-têtes.
        const line = index + 2;
        const result = readRow(row, { categories, marques });
        const referenceKey = key(result.reference);
        if (referenceKey && seen.has(referenceKey)) result.errors.push(`Référence en double : « ${result.reference} »`);
        if (referenceKey) seen.add(referenceKey);
        const target = existingByReference.get(referenceKey);
        if (target?.deletedAt) result.errors.push(`Référence d'un article supprimé : « ${result.reference} »`);
        result.errors.forEach((message) => errors.push({ line, message }));
        return { ...result, target };
    });

    const updated = parsed.filter((row) => row.target).length;
    const summary = { total: rows.length, created: rows.length - updated, updated, errors };
    if (dryRun || errors.length > 0) return { ...summary, imported: false };

    await sequelize.transaction(async (transaction) => {
        for (const { values, reference, target } of parsed) {
            if (target) {
                await target.update(values, { transaction });
            } else {
                await Produit.create(
                    { ...values, ...(reference ? { reference } : {}), isActive: true, isAvailable: true },
                    { transaction },
                );
            }
        }
    });
    return { ...summary, imported: true };
}

module.exports = { importProducts };
