const { SiteCategory, Category, Marque } = require('../models');
const { Admin } = require('../models');

/**
 * Script pour peupler la base de données avec des données initiales
 */
const seedDatabase = async () => {
    try {
        console.log('Démarrage du seeding...');

        // 1. Créer les catégories principales du site
        const categories = [
            { libelle: 'Electromenagers', description: 'Appareils électroménagers pour la maison' },
            { libelle: 'Telephones', description: 'Smartphones et accessoires' },
            { libelle: 'Mobiliers', description: 'Meubles et articles d\'ameublement' },
            { libelle: 'Accessoires', description: 'Accessoires divers pour tous vos besoins' }
        ];

        const createdCategories = {};

        for (const cat of categories) {
            const [category] = await SiteCategory.findOrCreate({
                where: { libelle: cat.libelle },
                defaults: cat
            });
            createdCategories[cat.libelle] = category;
            console.log(`Catégorie créée: ${cat.libelle}`);
        }

        // 2. Créer les catégories principales Gros électroménager et Petit électroménager
        /**
         * Créer la catégorie "Gros électroménager"
         */
        const [grosElectro] = await Category.findOrCreate({
            where: {
                libelle: 'Gros électroménager',
                idSiteCategory: createdCategories['Electromenagers'].id
            },
            defaults: {
                libelle: 'Gros électroménager',
                description: 'Appareils électroménagers de grande taille',
                idSiteCategory: createdCategories['Electromenagers'].id
            }
        });
        console.log(`Catégorie créée: Gros électroménager`);

        /**
         * Créer la catégorie "Petit électroménager"
         */
        const [petitElectro] = await Category.findOrCreate({
            where: {
                libelle: 'Petit électroménager',
                idSiteCategory: createdCategories['Electromenagers'].id
            },
            defaults: {
                libelle: 'Petit électroménager',
                description: 'Appareils électroménagers de petite taille',
                idSiteCategory: createdCategories['Electromenagers'].id
            }
        });
        console.log(`Catégorie créée: Petit électroménager`);

        // 3. Créer les sous-catégories pour Gros électroménager
        const grosElectroCategories = [
            { libelle: 'Cave à vin', description: 'Caves à vin et réfrigérateurs à vin' },
            { libelle: 'Chauffe-eau', description: 'Chauffe-eau électriques et à gaz' },
            { libelle: 'Climatisation', description: 'Climatiseurs et systèmes de climatisation' },
            { libelle: 'Congélateurs', description: 'Congélateurs et armoires de congélation' },
            { libelle: 'Cuisine', description: 'Équipements de cuisine intégrés' },
            { libelle: 'Fours', description: 'Fours électriques et à gaz' },
            { libelle: 'Hottes', description: 'Hottes aspirantes et extracteurs' },
            { libelle: 'Lave-linge', description: 'Machines à laver le linge' },
            { libelle: 'Lave-linge séchant', description: 'Lave-linge avec fonction séchage' },
            { libelle: 'Lave-vaisselle', description: 'Lave-vaisselle et accessoires' },
            { libelle: 'Micro-ondes', description: 'Fours à micro-ondes' },
            { libelle: 'Plaques de cuisson', description: 'Plaques de cuisson et tables de cuisson' },
            { libelle: 'Réfrigérateurs', description: 'Réfrigérateurs et combinés' },
            { libelle: 'Sèche-linge', description: 'Sèche-linge et accessoires' }
        ];

        for (const cat of grosElectroCategories) {
            await Category.findOrCreate({
                where: {
                    libelle: cat.libelle,
                    idSiteCategory: createdCategories['Electromenagers'].id
                },
                defaults: {
                    ...cat,
                    idSiteCategory: createdCategories['Electromenagers'].id
                }
            });
            console.log(`Sous-catégorie créée: ${cat.libelle} (Gros électroménager)`);
        }

        // 4. Créer les sous-catégories pour Petit électroménager
        const petitElectroCategories = [
            { libelle: 'Aspirateurs', description: 'Aspirateurs et nettoyeurs' },
            { libelle: 'Autocuiseurs', description: 'Autocuiseurs et cocottes-minute' },
            { libelle: 'Blenders', description: 'Blenders et mixeurs plongeants' },
            { libelle: 'Bouilloires', description: 'Bouilloires électriques' },
            { libelle: 'Cafetières', description: 'Cafetières et machines à café filtre' },
            { libelle: 'Centrifugeuses', description: 'Centrifugeuses et extracteurs de jus' },
            { libelle: 'Fers à repasser', description: 'Fers à repasser et centrales vapeur' },
            { libelle: 'Friteuses', description: 'Friteuses et friteuses sans huile' },
            { libelle: 'Grille-pain', description: 'Grille-pain et toasters' },
            { libelle: 'Machines à café', description: 'Machines à café expresso et capsules' },
            { libelle: 'Mixeurs', description: 'Mixeurs et batteurs' },
            { libelle: 'Planchas', description: 'Planchas et plaques de cuisson portables' },
            { libelle: 'Robots de cuisine', description: 'Robots de cuisine multifonctions' },
            { libelle: 'Sèche-cheveux', description: 'Sèche-cheveux et accessoires' }
        ];

        for (const cat of petitElectroCategories) {
            await Category.findOrCreate({
                where: {
                    libelle: cat.libelle,
                    idSiteCategory: createdCategories['Electromenagers'].id
                },
                defaults: {
                    ...cat,
                    idSiteCategory: createdCategories['Electromenagers'].id
                }
            });
            console.log(`Sous-catégorie créée: ${cat.libelle} (Petit électroménager)`);
        }

        // 5. Créer des marques pour Electromenagers
        const marquesElectro = [
            { libelle: 'Samsung', description: 'Leader mondial de l\'électronique' },
            { libelle: 'LG', description: 'Innovation dans l\'électroménager' },
            { libelle: 'Whirlpool', description: 'Spécialiste des appareils ménagers' },
            { libelle: 'Bosch', description: 'Qualité allemande' },
            { libelle: 'Electrolux', description: 'Électroménager suédois' },
            { libelle: 'Bajaj', description: 'Électroménager indien de qualité' },
            { libelle: 'Dualit', description: 'Grille-pain et petits électroménagers premium' },
            { libelle: 'Frigidaire', description: 'Réfrigérateurs et électroménager américain' },
            { libelle: 'Hitachi Appliances', description: 'Technologie japonaise pour la maison' },
            { libelle: 'Magimix', description: 'Robots de cuisine et petits électroménagers français' },
            { libelle: 'Miele', description: 'Électroménager premium allemand' },
            { libelle: 'Ninja', description: 'Petits électroménagers innovants' },
            { libelle: 'Philips', description: 'Innovation néerlandaise en électroménager' },
            { libelle: 'Rowenta', description: 'Fers à repasser et soin du linge' },
            { libelle: 'Smeg', description: 'Design italien et électroménager rétro' }
        ];

        for (const marque of marquesElectro) {
            try {
                const [marqueInstance, created] = await Marque.findOrCreate({
                    where: {
                        libelle: marque.libelle,
                        idSiteCategory: createdCategories['Electromenagers'].id
                    },
                    defaults: {
                        ...marque,
                        idSiteCategory: createdCategories['Electromenagers'].id
                    }
                });
                if (created) {
                    console.log(`Marque créée: ${marque.libelle}`);
                } else {
                    console.log(`Marque déjà existante: ${marque.libelle}`);
                }
            } catch (error) {
                console.error(`Erreur lors de la création de la marque ${marque.libelle}:`, error.message);
            }
        }

        // 6. Créer des marques pour Telephones
        const marquesPhones = [
            { libelle: 'Apple', description: 'iPhone et produits Apple' },
            { libelle: 'Samsung', description: 'Galaxy et smartphones Samsung' },
            { libelle: 'Huawei', description: 'Smartphones et technologies chinoises' },
            { libelle: 'Xiaomi', description: 'Smartphones abordables et performants' },
            { libelle: 'Tecno', description: 'Smartphones pour l\'Afrique' },
            { libelle: 'Infinix', description: 'Téléphones intelligents abordables' },
            { libelle: 'Oppo', description: 'Smartphones avec technologie de charge rapide' }
        ];

        for (const marque of marquesPhones) {
            try {
                const [marqueInstance, created] = await Marque.findOrCreate({
                    where: {
                        libelle: marque.libelle,
                        idSiteCategory: createdCategories['Telephones'].id
                    },
                    defaults: {
                        ...marque,
                        idSiteCategory: createdCategories['Telephones'].id
                    }
                });
                if (created) {
                    console.log(`Marque créée: ${marque.libelle}`);
                } else {
                    console.log(`Marque déjà existante: ${marque.libelle}`);
                }
            } catch (error) {
                console.error(`Erreur lors de la création de la marque ${marque.libelle}:`, error.message);
            }
        }

        // 7. Créer des marques pour Mobiliers
        const marquesMobilier = [
            { libelle: 'IKEA', description: 'Meubles scandinaves' },
            { libelle: 'Conforama', description: 'Meubles et décoration' },
            { libelle: 'But', description: 'Ameublement et électroménager' },
            { libelle: 'HomeStyle', description: 'Meubles et décoration moderne' },
            { libelle: 'Maisons du Monde', description: 'Décoration et mobilier tendance' },
            { libelle: 'OfficePro', description: 'Mobilier de bureau professionnel' },
            { libelle: 'WoodCraft', description: 'Meubles en bois artisanal' },
            { libelle: 'ArtDecor', description: 'Décoration artistique et design' },
            { libelle: 'DecoHome', description: 'Accessoires de décoration pour la maison' },
            { libelle: 'LightStyle', description: 'Éclairage et luminaires design' },
            { libelle: 'TextileHome', description: 'Textiles et linge de maison' }
        ];

        for (const marque of marquesMobilier) {
            try {
                const [marqueInstance, created] = await Marque.findOrCreate({
                    where: {
                        libelle: marque.libelle,
                        idSiteCategory: createdCategories['Mobiliers'].id
                    },
                    defaults: {
                        ...marque,
                        idSiteCategory: createdCategories['Mobiliers'].id
                    }
                });
                if (created) {
                    console.log(`Marque créée: ${marque.libelle}`);
                } else {
                    console.log(`Marque déjà existante: ${marque.libelle}`);
                }
            } catch (error) {
                console.error(`Erreur lors de la création de la marque ${marque.libelle}:`, error.message);
            }
        }

        // 8. Créer des marques pour Accessoires
        const marquesAccessoires = [
            { libelle: 'ArtDecor', description: 'Accessoires de décoration artistique' },
            { libelle: 'DecoHome', description: 'Accessoires de décoration pour la maison' },
            { libelle: 'LightStyle', description: 'Accessoires d\'éclairage' },
            { libelle: 'TextileHome', description: 'Accessoires textiles' }
        ];

        for (const marque of marquesAccessoires) {
            try {
                const [marqueInstance, created] = await Marque.findOrCreate({
                    where: {
                        libelle: marque.libelle,
                        idSiteCategory: createdCategories['Accessoires'].id
                    },
                    defaults: {
                        ...marque,
                        idSiteCategory: createdCategories['Accessoires'].id
                    }
                });
                if (created) {
                    console.log(`Marque créée: ${marque.libelle}`);
                } else {
                    console.log(`Marque déjà existante: ${marque.libelle}`);
                }
            } catch (error) {
                console.error(`Erreur lors de la création de la marque ${marque.libelle}:`, error.message);
            }
        }

        // 8. Créer des administrateurs par défaut
        const admins = [
            {
                login: 'opporune_yao',
                password: '1ts@fuckingPwd!',
                nom: 'Yao',
                prenom: 'Opportune Adjo',
                email: 'opportuneyao@gmail.com',
                isActive: true
            },
            {
                login: 'romdja',
                password: 'Secure@123',
                nom: 'Detty',
                prenom: 'Romaric',
                email: 'romaricdetty@gmail.com',
                isActive: true
            }
        ];

        for (const adminData of admins) {
            try {
                const [admin, created] = await Admin.findOrCreate({
                    where: { login: adminData.login },
                    defaults: adminData
                });
                if (created) {
                    console.log(`Administrateur créé: ${adminData.login}`);
                } else {
                    console.log(`Administrateur déjà existant: ${adminData.login}`);
                }
            } catch (error) {
                console.error(`Erreur lors de la création de l'administrateur ${adminData.login}:`, error.message);
            }
        }

        console.log('\nSeeding terminé avec succès !');
        // Ne pas appeler process.exit() si appelé depuis le serveur
        if (require.main === module) {
            process.exit(0);
        }
    } catch (error) {
        console.error('Erreur lors du seeding:', error);
        // Ne pas appeler process.exit() si appelé depuis le serveur
        if (require.main === module) {
            process.exit(1);
        } else {
            throw error; // Propager l'erreur si appelé depuis le serveur
        }
    }
};

// Exporter la fonction pour pouvoir l'utiliser dans server.js
module.exports = seedDatabase;

// Exécuter le script uniquement si appelé directement
if (require.main === module) {
    seedDatabase();
}