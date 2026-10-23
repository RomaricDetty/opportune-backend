/** Emplacements publicitaires du site. */
const AD_SLOTS = ['hero', 'home_mid', 'home_bottom']

const AD_SLOT_DEFAULT = 'hero'

/**
 * Valide et normalise un emplacement.
 * @param {string} [value]
 * @returns {string}
 */
function normalizeAdSlot(value) {
    const slot = String(value || '').trim()
    return AD_SLOTS.includes(slot) ? slot : AD_SLOT_DEFAULT
}

/**
 * Normalise une date d'expiration (chaîne vide / invalide → null).
 * @param {unknown} value
 * @returns {Date|null|undefined}
 */
function normalizeExpiration(value) {
    if (value === undefined) return undefined
    if (value === null || value === '' || value === 'Invalid date') return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}

module.exports = { AD_SLOTS, AD_SLOT_DEFAULT, normalizeAdSlot, normalizeExpiration }
