const { AdminLog } = require('../models');

/**
 * Journalise, une fois la réponse envoyée, les modifications réussies d'un admin.
 * Le corps de la requête n'est pas conservé (mots de passe, données clients).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function trackAdminAction(req, res) {
    if (req.auditTracked || req.method === 'GET') return;
    req.auditTracked = true;
    res.once('finish', () => {
        if (res.statusCode >= 400) return;
        AdminLog.create({
            idAdmin: req.admin.id,
            adminLogin: req.admin.login,
            method: req.method,
            path: req.originalUrl.split('?')[0].slice(0, 255),
            label: typeof req.body?.libelle === 'string' ? req.body.libelle.slice(0, 200) : null,
        }).catch((error) => console.error('Erreur journal admin:', error.message));
    });
}

module.exports = { trackAdminAction };
