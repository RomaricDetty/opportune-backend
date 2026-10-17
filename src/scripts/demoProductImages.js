/**
 * URLs d’images démo thématiques (Unsplash) — IDs vérifiés HTTP 200.
 * Tailles réduites (w≈560, q=65) pour un chargement plus léger.
 */

/**
 * Construit une URL Unsplash optimisée.
 * @param {string} id - ex. photo-1511707171634-5f897ff02aa9
 * @param {number} [w=560]
 * @returns {string}
 */
const u = (id, w = 560) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${w}&q=65`

/** @type {Record<string, string[]>} */
const BY_LABEL = {
    'Samsung Galaxy A36 - 256 Go': [
        u('photo-1610945415295-d9bbf067e59c'),
        u('photo-1592899677977-9c10ca588bbd'),
        u('photo-1511707171634-5f897ff02aa9'),
        u('photo-1580910051074-3eb694886505'),
    ],
    'Samsung Galaxy S25 Ultra - 256 Go': [
        u('photo-1610945265064-0e34e5519bbf'),
        u('photo-1598327105666-5b89351aff97'),
        u('photo-1605236453806-6ff36851218e'),
        u('photo-1565849904461-04a58ad377e0'),
    ],
    'iPhone 16 - 128 Go': [
        u('photo-1695048133142-1a20484d2569'),
        u('photo-1510557880182-3d4d3cba35a5'),
        u('photo-1546868871-7041f2a55e12'),
        u('photo-1525547719571-a2d4ac8945e2'),
    ],
    'Hisense TV 65" QLED Connectée': [
        u('photo-1593784991095-a205069470b6'),
        u('photo-1461151304267-38535e780c79'),
        u('photo-1571415060716-baff5f717c37'),
        u('photo-1601944177325-f8867652837f'),
    ],
    'TCL TV QLED 65" Google TV': [
        u('photo-1461151304267-38535e780c79'),
        u('photo-1593784991095-a205069470b6'),
        u('photo-1571415060716-baff5f717c37'),
        u('photo-1601944177325-f8867652837f'),
    ],
    'TCL Barre de son 220W Dolby Atmos': [
        u('photo-1546435770-a3e426bf472b'),
        u('photo-1608043152269-423dbba4e7e1'),
        u('photo-1558089687-f282ffcbc126'),
        u('photo-1505740420928-5e560c06d30e'),
    ],
    'Nasco Congélateur Horizontal 99L': [
        u('photo-1571175443880-49e1d25b2bc5'),
        u('photo-1584568694244-14fbdf83bd30'),
        u('photo-1626806787461-102c1bfaaea1'),
        u('photo-1556912173-46c336c7fd55'),
    ],
    'Midea Gazinière 5 feux Inox': [
        u('photo-1556909114-f6e7ad7d3136'),
        u('photo-1556910103-1c02745aae4d'),
        u('photo-1556911220-e15b29be8c8f'),
        u('photo-1574269909862-7e1d70bb8078'),
    ],
    'Hisense Friteuse à air 4.2L': [
        u('photo-1585515320310-259814833e62'),
        u('photo-1556911220-e15b29be8c8f'),
        u('photo-1574269909862-7e1d70bb8078'),
        u('photo-1556910103-1c02745aae4d'),
    ],
    'Câble USB-C Fast Charge 1.5m': [
        u('photo-1625948515291-69613efd103f'),
        u('photo-1583394838336-acd977736f90'),
        u('photo-1601524909162-ae8725290836'),
        u('photo-1621768216002-5ac171876625'),
    ],
}

const FALLBACK = [
    u('photo-1498049794561-7780e7231661'),
    u('photo-1468495244123-6c6c332eeece'),
    u('photo-1519389950473-47ba0277781c'),
    u('photo-1526170375885-4d8ecf77b99f'),
]

const PROMO_BANNERS = [
    u('photo-1511707171634-5f897ff02aa9', 960),
    u('photo-1593784991095-a205069470b6', 960),
]

/**
 * Images produit (principale + secondaires).
 * @param {string} libelle
 * @returns {{ imagePrincipale: string, images: string[] }}
 */
function imagesForProduct(libelle) {
    const list = BY_LABEL[libelle] || FALLBACK
    return {
        imagePrincipale: list[0],
        images: list.slice(1),
    }
}

/**
 * Image bannière promo.
 * @param {number} index
 * @returns {string}
 */
function promoBanner(index = 0) {
    return PROMO_BANNERS[index % PROMO_BANNERS.length]
}

module.exports = { imagesForProduct, promoBanner, BY_LABEL }
