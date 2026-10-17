/**
 * Secret JWT centralisé — refuse un secret par défaut en production.
 */
function getJwtSecret() {
    const secret = process.env.JWT_SECRET
    if (secret && secret.trim()) return secret.trim()

    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET doit être défini en production')
    }

    return 'dev-only-opportune-jwt-secret-change-me'
}

/**
 * Durée de vie des tokens.
 */
function getJwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN || '1d'
}

module.exports = { getJwtSecret, getJwtExpiresIn }
