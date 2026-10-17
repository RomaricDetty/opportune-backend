const rateLimit = require('express-rate-limit')

/**
 * Limite les tentatives de login admin (bruteforce).
 */
const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
    },
})

/**
 * Limite les envois du formulaire contact.
 */
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Trop de messages envoyés. Réessayez plus tard.',
    },
})

/**
 * Limite générale API (anti-abus léger).
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Trop de requêtes. Réessayez plus tard.',
    },
})

module.exports = {
    adminLoginLimiter,
    contactLimiter,
    apiLimiter,
}
