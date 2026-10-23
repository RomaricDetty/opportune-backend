/** Clés des URL réseaux sociaux stockées en base. */
const SOCIAL_FIELDS = [
    'facebookUrl',
    'instagramUrl',
    'tiktokUrl',
    'youtubeUrl',
    'twitterUrl',
    'linkedinUrl',
]

const SOCIAL_LABELS = {
    facebookUrl: 'Facebook',
    instagramUrl: 'Instagram',
    tiktokUrl: 'TikTok',
    youtubeUrl: 'YouTube',
    twitterUrl: 'X (Twitter)',
    linkedinUrl: 'LinkedIn',
}

const SOCIAL_HOSTS = {
    facebookUrl: ['facebook.com', 'fb.com', 'fb.me'],
    instagramUrl: ['instagram.com'],
    tiktokUrl: ['tiktok.com'],
    youtubeUrl: ['youtube.com', 'youtu.be'],
    twitterUrl: ['twitter.com', 'x.com'],
    linkedinUrl: ['linkedin.com'],
}

/**
 * Vérifie qu’un hostname appartient au domaine autorisé.
 * @param {string} hostname
 * @param {string[]} allowed
 * @returns {boolean}
 */
function hostMatches(hostname, allowed) {
    const host = String(hostname || '')
        .toLowerCase()
        .replace(/\.$/, '')
    return allowed.some((domain) => host === domain || host.endsWith(`.${domain}`))
}

/**
 * Normalise et valide une URL de réseau social (vide → null).
 * @param {unknown} value
 * @param {string} field
 * @returns {string|null}
 */
function normalizeSocialUrl(value, field) {
    const raw = String(value || '').trim()
    if (!raw) return null

    let parsed
    try {
        parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
    } catch {
        throw new Error(`Le lien ${SOCIAL_LABELS[field] || 'réseau'} n’est pas une URL valide.`)
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error(`Le lien ${SOCIAL_LABELS[field]} doit commencer par http:// ou https://.`)
    }
    if (parsed.username || parsed.password) {
        throw new Error(`Le lien ${SOCIAL_LABELS[field]} n’est pas autorisé.`)
    }
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
        throw new Error(`Le lien ${SOCIAL_LABELS[field]} n’est pas une URL valide.`)
    }

    const allowed = SOCIAL_HOSTS[field] || []
    if (allowed.length && !hostMatches(parsed.hostname, allowed)) {
        throw new Error(
            `Le lien ${SOCIAL_LABELS[field]} doit pointer vers ${allowed[0]}.`,
        )
    }

    return parsed.href.slice(0, 500)
}

/**
 * Extrait les mises à jour de liens sociaux depuis le body.
 * @param {Record<string, unknown>} body
 * @returns {{ updates: Record<string, string|null>, errors: string[] }}
 */
function pickSocialUpdates(body = {}) {
    const updates = {}
    const errors = []
    for (const field of SOCIAL_FIELDS) {
        if (body[field] === undefined) continue
        try {
            updates[field] = normalizeSocialUrl(body[field], field)
        } catch (error) {
            errors.push(error.message)
        }
    }
    return { updates, errors }
}

/**
 * Construit l'objet public des réseaux (clé courte → URL valide ou null).
 * @param {Record<string, unknown>} settings
 * @returns {Record<string, string|null>}
 */
function toPublicSocials(settings) {
    const socials = {}
    for (const field of SOCIAL_FIELDS) {
        const key = field.replace(/Url$/, '')
        try {
            socials[key] = normalizeSocialUrl(settings[field], field)
        } catch {
            socials[key] = null
        }
    }
    return socials
}

module.exports = {
    SOCIAL_FIELDS,
    normalizeSocialUrl,
    pickSocialUpdates,
    toPublicSocials,
}
