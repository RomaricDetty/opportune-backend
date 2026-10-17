require('dotenv').config();
const { Category, Produit, Publicite } = require('../models');
const { imagesForProduct, promoBanner } = require('./demoProductImages');

const categoryDescriptions = {
    Froid: 'Réfrigérateurs, congélateurs et appareils de conservation.',
    Cuisine: 'Gazinières, friteuses et petit électroménager de cuisine.',
    Android: 'Smartphones Android des grandes marques (Samsung, etc.).',
    iPhone: 'Gamme Apple iPhone, accessoires et modèles récents.',
    'TV 4K': 'Télévisions 4K / QLED connectées pour le salon.',
    Audio: 'Barres de son, enceintes et solutions home cinéma.',
    Câbles: 'Câbles de charge, connectique et accessoires high-tech.',
};

const productEnrichment = {
    'Samsung Galaxy A36 - 256 Go': {
        description:
            'Smartphone Android 5G conçu pour le quotidien. Écran AMOLED fluide, stockage 256 Go et autonomie confortable pour Abidjan comme en déplacement.',
    },
    'Samsung Galaxy S25 Ultra - 256 Go': {
        description:
            'Flagship Galaxy avec photo pro, Galaxy AI et performances haut de gamme. Idéal pour ceux qui veulent le meilleur de Samsung.',
    },
    'iPhone 16 - 128 Go': {
        description:
            'iPhone dernière génération avec puce A18, photo améliorée et écosystème Apple. Un choix premium pour usage pro et perso.',
    },
    'Hisense TV 65" QLED Connectée': {
        description:
            'TV QLED 65" 4K connectée pour un salon immersif. Couleurs vives, applications intégrées et design fin.',
    },
    'TCL TV QLED 65" Google TV': {
        description:
            'Télévision QLED 65" avec Google TV et assistant vocal. Accès rapide à vos apps préférées et image 4K nette.',
    },
    'TCL Barre de son 220W Dolby Atmos': {
        description:
            'Barre de son 220W compatible Dolby Atmos pour un son cinéma à la maison. Simple à brancher sur votre TV.',
    },
    'Nasco Congélateur Horizontal 99L': {
        description:
            'Congélateur horizontal 99L compact et économique. Parfait pour stocker vos denrées sans prendre trop de place.',
    },
    'Midea Gazinière 5 feux Inox': {
        description:
            'Gazinière 5 feux format 90x60 en inox. Puissante et robuste pour une cuisine familiale ou semi-pro.',
    },
    'Hisense Friteuse à air 4.2L': {
        description:
            'Friteuse à air 4.2L digitale pour cuisiner avec peu ou sans huile. Programmes pratiques et nettoyage facile.',
    },
    'Câble USB-C Fast Charge 1.5m': {
        description:
            'Câble USB-C 1,5 m compatible charge rapide. Solide, pratique pour téléphone et accessoires au quotidien.',
    },
};

/**
 * Enrichit catégories et articles existants (descriptions + images thématiques).
 */
async function enrichDemoContent() {
    try {
        console.log('Enrichissement des données de démo...');

        const categories = await Category.findAll();
        for (const cat of categories) {
            const description = categoryDescriptions[cat.libelle];
            if (description) {
                await cat.update({ description });
                console.log(`Catégorie: ${cat.libelle}`);
            }
        }

        const produits = await Produit.findAll();
        for (const produit of produits) {
            const enrichment = productEnrichment[produit.libelle] || {};
            const imgs = imagesForProduct(produit.libelle);
            await produit.update({
                ...(enrichment.description ? { description: enrichment.description } : {}),
                imagePrincipale: imgs.imagePrincipale,
                images: imgs.images,
            });
            console.log(`Article: ${produit.libelle}`);
        }

        const pubs = await Publicite.findAll({ order: [['createdAt', 'ASC']] });
        for (let i = 0; i < pubs.length; i++) {
            await pubs[i].update({
                images: JSON.stringify([promoBanner(i)]),
            });
            console.log(`Publicité: ${pubs[i].libelle}`);
        }

        console.log('✅ Enrichissement terminé');
        process.exit(0);
    } catch (error) {
        console.error('Erreur enrichissement:', error);
        process.exit(1);
    }
}

enrichDemoContent();
