require('dotenv').config();
const {
    sequelize,
    syncModels,
    SiteCategory,
    Category,
    Marque,
    Produit,
    Admin,
    Client,
    Publicite,
    Order,
    OrderItem,
    Wishlist
} = require('../models');
const { priceAfterDiscount } = require('../utils/formatPrice');
const { imagesForProduct, promoBanner } = require('./demoProductImages');

/**
 * Remplit la base avec des données de démo (prix en XOF).
 */
const seedDatabase = async () => {
    try {
        console.log('Démarrage du seeding...');

        await syncModels(true);
        console.log('Tables recréées');

        const transaction = await sequelize.transaction();

        try {
        await Admin.create({
            login: 'admin',
            password: 'admin123',
            nom: 'Admin',
            prenom: 'Opportune',
            email: 'admin@opportune.ci',
            isActive: true
        }, { transaction });

        const client = await Client.create({
            email: 'client@demo.ci',
            password: 'client123',
            nom: 'Kouassi',
            prenom: 'Aya',
            telephone: '+2250700000001',
            adresse: 'Cocody Angré',
            ville: 'Abidjan',
            isActive: true
        }, { transaction });

        const siteCats = await SiteCategory.bulkCreate([
            { libelle: 'Electromenagers', description: 'Cuisine et froid', isActive: true },
            { libelle: 'Smartphones', description: 'Téléphones et tablettes', isActive: true },
            { libelle: 'TV et Audio', description: 'Télévisions et son', isActive: true },
            { libelle: 'Accessoires', description: 'Accessoires high-tech', isActive: true }
        ], { transaction, returning: true });

        const [catElectro, catPhone, catTv, catAcc] = siteCats;

        const categories = await Category.bulkCreate([
            {
                libelle: 'Froid',
                description: 'Réfrigérateurs, congélateurs et appareils de conservation.',
                idSiteCategory: catElectro.id,
                isActive: true
            },
            {
                libelle: 'Cuisine',
                description: 'Gazinières, friteuses et petit électroménager de cuisine.',
                idSiteCategory: catElectro.id,
                isActive: true
            },
            {
                libelle: 'Android',
                description: 'Smartphones Android des grandes marques (Samsung, etc.).',
                idSiteCategory: catPhone.id,
                isActive: true
            },
            {
                libelle: 'iPhone',
                description: 'Gamme Apple iPhone, accessoires et modèles récents.',
                idSiteCategory: catPhone.id,
                isActive: true
            },
            {
                libelle: 'TV 4K',
                description: 'Télévisions 4K / QLED connectées pour le salon.',
                idSiteCategory: catTv.id,
                isActive: true
            },
            {
                libelle: 'Audio',
                description: 'Barres de son, enceintes et solutions home cinéma.',
                idSiteCategory: catTv.id,
                isActive: true
            },
            {
                libelle: 'Câbles',
                description: 'Câbles de charge, connectique et accessoires high-tech.',
                idSiteCategory: catAcc.id,
                isActive: true
            }
        ], { transaction, returning: true });

        const marques = await Marque.bulkCreate([
            { libelle: 'Samsung', idSiteCategory: catPhone.id, isActive: true },
            { libelle: 'Hisense', idSiteCategory: catTv.id, isActive: true },
            { libelle: 'TCL', idSiteCategory: catTv.id, isActive: true },
            { libelle: 'Nasco', idSiteCategory: catElectro.id, isActive: true },
            { libelle: 'Midea', idSiteCategory: catElectro.id, isActive: true },
            { libelle: 'Apple', idSiteCategory: catPhone.id, isActive: true }
        ], { transaction, returning: true });

        const byLabel = (list, label) => list.find((x) => x.libelle === label);

        const productsData = [
            {
                libelle: 'Samsung Galaxy A36 - 256 Go',
                description:
                    'Smartphone Android 5G conçu pour le quotidien. Écran AMOLED fluide, stockage 256 Go et autonomie confortable pour Abidjan comme en déplacement.',
                prix: 249900,
                remise: 5,
                quantite_stock: 25,
                idMarque: byLabel(marques, 'Samsung').id,
                idCategory: byLabel(categories, 'Android').id,
                caracteristiques: { stockage: '256 Go', ram: '8 Go', ecran: '6.7"' },
                featured: true,
                imageSeed: 101
            },
            {
                libelle: 'Samsung Galaxy S25 Ultra - 256 Go',
                description:
                    'Flagship Galaxy avec photo pro, Galaxy AI et performances haut de gamme. Idéal pour ceux qui veulent le meilleur de Samsung.',
                prix: 1249900,
                remise: 0,
                quantite_stock: 10,
                idMarque: byLabel(marques, 'Samsung').id,
                idCategory: byLabel(categories, 'Android').id,
                caracteristiques: { stockage: '256 Go', ram: '12 Go', reseau: '5G' },
                featured: true,
                imageSeed: 102
            },
            {
                libelle: 'iPhone 16 - 128 Go',
                description:
                    'iPhone dernière génération avec puce A18, photo améliorée et écosystème Apple. Un choix premium pour usage pro et perso.',
                prix: 899900,
                remise: 0,
                quantite_stock: 12,
                idMarque: byLabel(marques, 'Apple').id,
                idCategory: byLabel(categories, 'iPhone').id,
                caracteristiques: { stockage: '128 Go', ram: '8 Go' },
                featured: true,
                imageSeed: 103
            },
            {
                libelle: 'Hisense TV 65" QLED Connectée',
                description:
                    'TV QLED 65" 4K connectée pour un salon immersif. Couleurs vives, applications intégrées et design fin.',
                prix: 559900,
                remise: 10,
                quantite_stock: 8,
                idMarque: byLabel(marques, 'Hisense').id,
                idCategory: byLabel(categories, 'TV 4K').id,
                caracteristiques: { taille: '65"', resolution: '4K', smart: 'VIDAA' },
                featured: true,
                imageSeed: 201
            },
            {
                libelle: 'TCL TV QLED 65" Google TV',
                description:
                    'Télévision QLED 65" avec Google TV et assistant vocal. Accès rapide à vos apps préférées et image 4K nette.',
                prix: 459900,
                remise: 0,
                quantite_stock: 15,
                idMarque: byLabel(marques, 'TCL').id,
                idCategory: byLabel(categories, 'TV 4K').id,
                caracteristiques: { taille: '65"', resolution: '4K' },
                imageSeed: 202
            },
            {
                libelle: 'TCL Barre de son 220W Dolby Atmos',
                description:
                    'Barre de son 220W compatible Dolby Atmos pour un son cinéma à la maison. Simple à brancher sur votre TV.',
                prix: 99900,
                remise: 0,
                quantite_stock: 20,
                idMarque: byLabel(marques, 'TCL').id,
                idCategory: byLabel(categories, 'Audio').id,
                caracteristiques: { puissance: '220W', format: 'Dolby Atmos' },
                imageSeed: 203
            },
            {
                libelle: 'Nasco Congélateur Horizontal 99L',
                description:
                    'Congélateur horizontal 99L compact et économique. Parfait pour stocker vos denrées sans prendre trop de place.',
                prix: 89900,
                remise: 0,
                quantite_stock: 18,
                idMarque: byLabel(marques, 'Nasco').id,
                idCategory: byLabel(categories, 'Froid').id,
                caracteristiques: { capacite: '99L', type: 'Horizontal' },
                imageSeed: 301
            },
            {
                libelle: 'Midea Gazinière 5 feux Inox',
                description:
                    'Gazinière 5 feux format 90x60 en inox. Puissante et robuste pour une cuisine familiale ou semi-pro.',
                prix: 349900,
                remise: 8,
                quantite_stock: 6,
                idMarque: byLabel(marques, 'Midea').id,
                idCategory: byLabel(categories, 'Cuisine').id,
                caracteristiques: { feux: '5', format: '90x60' },
                featured: true,
                imageSeed: 302
            },
            {
                libelle: 'Hisense Friteuse à air 4.2L',
                description:
                    'Friteuse à air 4.2L digitale pour cuisiner avec peu ou sans huile. Programmes pratiques et nettoyage facile.',
                prix: 34900,
                remise: 0,
                quantite_stock: 40,
                idMarque: byLabel(marques, 'Hisense').id,
                idCategory: byLabel(categories, 'Cuisine').id,
                caracteristiques: { capacite: '4.2L', type: 'Air fryer' },
                imageSeed: 303
            },
            {
                libelle: 'Câble USB-C Fast Charge 1.5m',
                description:
                    'Câble USB-C 1,5 m compatible charge rapide. Solide, pratique pour téléphone et accessoires au quotidien.',
                prix: 4900,
                remise: 0,
                quantite_stock: 100,
                idMarque: byLabel(marques, 'Samsung').id,
                idCategory: byLabel(categories, 'Câbles').id,
                caracteristiques: { longueur: '1.5m', connecteur: 'USB-C' },
                imageSeed: 401
            }
        ];

        const produits = [];
        for (const raw of productsData) {
            const { imageSeed, ...rest } = raw;
            const imgs = imagesForProduct(rest.libelle);
            const produit = await Produit.create({
                ...rest,
                quantite_minimale: 1,
                devise: 'XOF',
                isActive: true,
                isAvailable: true,
                imagePrincipale: imgs.imagePrincipale,
                images: imgs.images
            }, { transaction });
            produits.push(produit);
        }

        await Publicite.bulkCreate([
            {
                libelle: 'Promo Smartphones',
                description: 'Jusqu\'à -10% sur une sélection Galaxy',
                images: JSON.stringify([promoBanner(0)]),
                isActive: true,
                idCategory: byLabel(categories, 'Android').id
            },
            {
                libelle: 'TV 4K en stock',
                description: 'Les meilleures TV connectées',
                images: JSON.stringify([promoBanner(1)]),
                isActive: true,
                idProduit: produits[3].id
            }
        ], { transaction });

        await Wishlist.create({
            idClient: client.id,
            idProduit: produits[0].id
        }, { transaction });

        const orderItemsSeed = [
            { produit: produits[0], quantite: 1 },
            { produit: produits[8], quantite: 2 }
        ];
        let montantTotal = 0;
        const preparedItems = orderItemsSeed.map(({ produit, quantite }) => {
            const prixUnitaire = priceAfterDiscount(produit.prix, produit.remise || 0);
            const sousTotal = prixUnitaire * quantite;
            montantTotal += sousTotal;
            return {
                idProduit: produit.id,
                libelle: produit.libelle,
                prixUnitaire,
                quantite,
                sousTotal
            };
        });

        const order = await Order.create({
            idClient: client.id,
            montantTotal,
            devise: 'XOF',
            modePaiement: 'cash_on_delivery',
            statut: 'pending',
            statutPaiement: 'unpaid',
            adresseLivraison: 'Cocody Angré',
            villeLivraison: 'Abidjan',
            telephoneLivraison: '+2250700000001',
            notes: 'Commande de démo'
        }, { transaction });

        for (const item of preparedItems) {
            await OrderItem.create({ idOrder: order.id, ...item }, { transaction });
        }

        await transaction.commit();

        console.log('\n✅ Seeding terminé');
        console.log('────────────────────────────');
        console.log('Admin    : login=admin / password=admin123');
        console.log('Client   : email=client@demo.ci / password=client123');
        console.log(`Produits : ${produits.length}`);
        console.log(`Commande : ${order.reference}`);
        console.log('────────────────────────────');

        if (require.main === module) process.exit(0);
        } catch (innerError) {
            await transaction.rollback();
            throw innerError;
        }
    } catch (error) {
        console.error('Erreur lors du seeding:', error);
        if (require.main === module) process.exit(1);
        throw error;
    }
};

module.exports = seedDatabase;
if (require.main === module) seedDatabase();
