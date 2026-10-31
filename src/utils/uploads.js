const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/** Dossier des fichiers envoyés : à placer sur un volume persistant en production. */
const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || 'uploads');
const PUBLIC_PREFIX = '/uploads/';

const EXTENSIONS = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
};

/**
 * Enregistre une image sur disque.
 * @param {Buffer} buffer Contenu de l'image
 * @param {string} mimeType Type MIME normalisé
 * @returns {string} Chemin public à stocker en base (`/uploads/images/...`)
 */
function saveImage(buffer, mimeType) {
    const directory = path.join(UPLOADS_DIR, 'images');
    fs.mkdirSync(directory, { recursive: true });
    const name = `${crypto.randomUUID()}.${EXTENSIONS[mimeType] || 'jpg'}`;
    fs.writeFileSync(path.join(directory, name), buffer);
    return `${PUBLIC_PREFIX}images/${name}`;
}

/**
 * Ramène une URL d'image renvoyée par l'API à sa forme stockée en base.
 * @param {unknown} value URL absolue, chemin ou base64
 * @returns {unknown}
 */
function toStoredImage(value) {
    if (typeof value !== 'string') return value;
    const match = value.match(/^https?:\/\/[^/]+(\/uploads\/.+)$/);
    return match ? match[1] : value;
}

/**
 * Rend absolues les URLs d'images des réponses JSON : le site et le dashboard
 * sont sur d'autres origines que l'API.
 * PUBLIC_API_URL est à définir derrière un proxy HTTPS.
 */
function absoluteUploads(req, res, next) {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        const base = (process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
        const rewritten = JSON.parse(JSON.stringify(body ?? null), (key, value) => {
            if (typeof value !== 'string') return value;
            if (value.startsWith(PUBLIC_PREFIX)) return `${base}${value}`;
            // Publicite.images est un tableau JSON stocké en texte.
            if (value.startsWith('[') && value.includes(`"${PUBLIC_PREFIX}`)) {
                return value.split(`"${PUBLIC_PREFIX}`).join(`"${base}${PUBLIC_PREFIX}`);
            }
            return value;
        });
        return originalJson(rewritten);
    };
    next();
}

module.exports = { UPLOADS_DIR, saveImage, toStoredImage, absoluteUploads };
