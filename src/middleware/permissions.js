/** Droits de chaque rôle du back-office. */
const ROLE_PERMISSIONS = {
    admin: ['catalog', 'orders', 'admins'],
    catalogue: ['catalog'],
    commandes: ['orders'],
};

const ROLES = Object.keys(ROLE_PERMISSIONS);

/**
 * Droits d'un rôle.
 * @param {string} role
 * @returns {string[]}
 */
const permissionsOf = (role) => ROLE_PERMISSIONS[role] || [];

/**
 * Exige un droit ; à placer après le middleware d'authentification.
 * @param {string} permission
 */
const requirePermission = (permission) => (req, res, next) => {
    if (permissionsOf(req.admin?.role).includes(permission)) return next();
    return res.status(403).json({
        success: false,
        message: 'Votre rôle ne permet pas cette action',
    });
};

module.exports = { ROLES, permissionsOf, requirePermission };
