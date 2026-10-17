/**
 * Formate un montant entier en XOF (FCFA).
 * @param {number|string|null|undefined} amount - Montant en FCFA
 * @returns {string} Exemple : "1 259 900 FCFA"
 */
function formatXof(amount) {
    const value = Number(amount) || 0;
    const formatted = Math.round(value)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formatted} FCFA`;
}

/**
 * Calcule le prix après remise (remise en pourcentage).
 * @param {number} prix - Prix de base en XOF
 * @param {number} [remise=0] - Remise en %
 * @returns {number} Prix final arrondi en XOF
 */
function priceAfterDiscount(prix, remise = 0) {
    const base = Number(prix) || 0;
    const discount = Math.min(Math.max(Number(remise) || 0, 0), 100);
    return Math.round(base * (1 - discount / 100));
}

module.exports = { formatXof, priceAfterDiscount };
