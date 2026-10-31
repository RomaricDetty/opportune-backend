const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const ImageHandler = require('../utils/imageHandler');
const { saveImage } = require('../utils/uploads');

/** Sans --apply, le script ne fait que compter. */
const APPLY = process.argv.includes('--apply');

let converted = 0;
let bytes = 0;

/**
 * Écrit une image base64 sur disque.
 * @param {unknown} value
 * @returns {unknown} Le chemin du fichier, ou la valeur d'origine si ce n'est pas du base64
 */
function convert(value) {
    if (!ImageHandler.isBase64(value) || !ImageHandler.validateBase64(value)) return value;
    const buffer = Buffer.from(value.slice(value.indexOf(',') + 1), 'base64');
    converted += 1;
    bytes += value.length;
    if (!APPLY) return value;
    return saveImage(buffer, `image/${ImageHandler.getBase64MimeType(value)}`);
}

/**
 * Convertit une colonne contenant une image seule.
 * @param {string} table
 * @param {string} column
 */
async function migrateSingle(table, column) {
    const rows = await sequelize.query(
        `SELECT id, \`${column}\` AS value FROM \`${table}\` WHERE \`${column}\` LIKE 'data:image/%'`,
        { type: QueryTypes.SELECT },
    );
    for (const { id, value } of rows) {
        const next = convert(value);
        if (APPLY && next !== value) {
            await sequelize.query(`UPDATE \`${table}\` SET \`${column}\` = ? WHERE id = ?`, { replacements: [next, id] });
        }
    }
}

/**
 * Convertit une colonne contenant un tableau JSON d'images.
 * @param {string} table
 * @param {string} column
 */
async function migrateArray(table, column) {
    const rows = await sequelize.query(
        `SELECT id, \`${column}\` AS value FROM \`${table}\` WHERE \`${column}\` LIKE '%data:image/%'`,
        { type: QueryTypes.SELECT },
    );
    for (const { id, value } of rows) {
        let list = typeof value === 'string' ? JSON.parse(value) : value;
        // Colonne JSON renfermant parfois un tableau déjà encodé en texte.
        if (typeof list === 'string') list = JSON.parse(list);
        if (!Array.isArray(list)) continue;
        const next = list.map(convert);
        if (APPLY) {
            await sequelize.query(`UPDATE \`${table}\` SET \`${column}\` = ? WHERE id = ?`, {
                replacements: [JSON.stringify(next), id],
            });
        }
    }
}

const run = async () => {
    try {
        await migrateSingle('produits', 'imagePrincipale');
        await migrateArray('produits', 'images');
        await migrateSingle('marques', 'logo');
        await migrateSingle('site_settings', 'logo');
        await migrateArray('publicites', 'images');
        const size = (bytes / 1024 / 1024).toFixed(1);
        console.log(
            APPLY
                ? `${converted} image(s) déplacée(s) vers des fichiers (${size} Mo retirés de la base).`
                : `${converted} image(s) à déplacer (${size} Mo). Relancez avec --apply après une sauvegarde.`,
        );
    } catch (error) {
        console.error('Échec de la migration des images :', error.message);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

run();
