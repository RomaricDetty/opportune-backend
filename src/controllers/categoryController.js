const { Category, SiteCategory, Marque } = require('../models');
const { Op } = require('sequelize');

class CategoryController {
    /**
     * Récupérer toutes les catégories
     * GET /api/categories
     */
    static async getAll(req, res) {
        try {
            const categories = await Category.findAll();
            return res.status(200).json({
                success: true,
                data: categories
                });
        } catch (error) {
            console.error('Erreur récupération Categories:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des catégories'
            });
        }
    }
    
    /**
     * Récupérer une catégorie par ID
     * GET /api/categories/:id
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Catégorie non trouvée'
                });
            }
            return res.status(200).json({
                success: true,
                data: category
            });
        } catch (error) {
            console.error('Erreur récupération Category:', error);
                return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération de la catégorie'
            });
        }
    }
    /**
     * Créer une nouvelle catégorie
     * POST /api/categories
     */
    static async create(req, res) {
        try {
            const { libelle, description, isActive } = req.body;
            const category = await Category.create({ libelle, description, isActive });
            return res.status(201).json({
                success: true,
                message: 'Catégorie créée avec succès',
                data: category
            });
        } catch (error) {
            console.error('Erreur création Category:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de la catégorie'
            });
        }
    }
    /**
     * Mettre à jour une catégorie
     * PUT /api/categories/:id
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { libelle, description, isActive } = req.body;
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Catégorie non trouvée'
                });
            }
            await category.update({ libelle, description, isActive });
            return res.status(200).json({
                success: true,
                message: 'Catégorie mise à jour avec succès',
                data: category
            });
        } catch (error) {
            console.error('Erreur mise à jour Category:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de la catégorie'
            });
        }
    }
    /**
     * Supprimer une catégorie
     * DELETE /api/categories/:id
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Catégorie non trouvée'
                });
            }
            await category.destroy();
            return res.status(200).json({
                success: true,
                message: 'Catégorie supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur suppression Category:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de la catégorie'
            });
        }
    }
    /**
     * Restaurer une catégorie
     * POST /api/categories/:id/restore
     */
    static async restore(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Catégorie non trouvée'
                });
            }
            await category.restore();
            return res.status(200).json({
                success: true,
                message: 'Catégorie restaurée avec succès'
            });
        } catch (error) {
            console.error('Erreur restauration Category:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la restauration de la catégorie'
            });
        }
    }
    /**
     * Obtenir les statistiques d'une catégorie
     * GET /api/categories/:id/stats
     */ 
    static async getStats(req, res) {
        try {
            const { id } = req.params;
            const siteCategory = await SiteCategory.findByPk(id);
            if (!siteCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Catégorie principale non trouvée'
                });
            }
            const stats = {
                totalCategories: await Category.count({
                    where: { idSiteCategory: id }
                }),
                totalMarques: await Marque.count({
                    where: { idSiteCategory: id }
                }),
                activeCategories: await Category.count({
                    where: { idSiteCategory: id, isActive: true }
                }),
                activeMarques: await Marque.count({
                    where: { idSiteCategory: id, isActive: true }
                })
            };
            return res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Erreur statistiques SiteCategory:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des statistiques',
            });
        }
    }

    /**
     * Récupérer les catégories d'électroménager
     * GET /api/categories/getElectroCategory
     * @param {*} req 
     * @param {*} res 
     */
    static async getElectroCategory(req, res) {
        try {
            // Récupérer la catégorie principale "Electromenagers"
            const siteCategory = await SiteCategory.findOne({
                where: { libelle: 'Electromenagers' }
            });

            if (!siteCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Catégorie principale Electromenagers non trouvée'
                });
            }

            // Récupérer toutes les catégories d'électroménager
            const categories = await Category.findAll({
                where: { idSiteCategory: siteCategory.id },
                include: [
                    {
                        model: SiteCategory,
                        as: 'siteCategory',
                        attributes: ['id', 'libelle']
                    }
                ]
            });

            // Définir les listes de sous-catégories
            const grosElectroSubcategories = [
                'Cave à vin', 'Chauffe-eau', 'Climatisation', 'Congélateurs',
                'Cuisine', 'Fours', 'Hottes', 'Lave-linge', 'Lave-linge séchant',
                'Lave-vaisselle', 'Micro-ondes', 'Plaques de cuisson',
                'Réfrigérateurs', 'Sèche-linge'
            ];

            const petitElectroSubcategories = [
                'Aspirateurs', 'Autocuiseurs', 'Blenders', 'Bouilloires',
                'Cafetières', 'Centrifugeuses', 'Fers à repasser', 'Friteuses',
                'Grille-pain', 'Machines à café', 'Mixeurs', 'Planchas',
                'Robots de cuisine', 'Sèche-cheveux'
            ];

            // Organiser les catégories
            const petitsElectromenagers = categories.filter(cat => 
                petitElectroSubcategories.includes(cat.libelle) || 
                cat.libelle === 'Petit électroménager'
            );

            const grosElectromenagers = categories.filter(cat => 
                grosElectroSubcategories.includes(cat.libelle) || 
                cat.libelle === 'Gros électroménager'
            );

            return res.status(200).json({
                success: true,
                data: {
                    petitsElectromenagers,
                    grosElectromenagers
                }
            });
        } catch (error) {
            console.error('Erreur récupération catégories électroménager:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des catégories électroménager',
            });
        }
    }

    /**
     * Créer une nouvelle sous-catégorie d'électroménager
     * Permet de créer une sous-catégorie pour les électroménagers en précisant si c'est un gros ou un petit électroménager
     * POST /api/categories/createElectroCategory
     * @param {Object} req.body - Données de la sous-catégorie
     * @param {string} req.body.libelle - Libellé de la sous-catégorie (ex: "Réfrigérateurs", "Aspirateurs")
     * @param {string} req.body.typeElectro - Type d'électroménager: "gros" ou "petit"
     * @param {string} [req.body.description] - Description optionnelle
     * @param {boolean} [req.body.isActive=true] - Statut actif de la catégorie
     * @param {*} res 
     */
    static async createElectroCategory(req, res) {
        try {
            const { libelle, typeElectro, description, isActive = true } = req.body;

            // Validation des champs requis
            if (!libelle || !typeElectro) {
                return res.status(400).json({
                    success: false,
                    message: 'Le libellé et le type d\'électroménager (gros/petit) sont requis'
                });
            }

            // Validation du type d'électroménager
            const typeElectroLower = typeElectro.toLowerCase();
            if (typeElectroLower !== 'gros' && typeElectroLower !== 'petit') {
                return res.status(400).json({
                    success: false,
                    message: 'Le type d\'électroménager doit être "gros" ou "petit"'
                });
            }

            // Récupérer la catégorie principale "Electromenagers"
            const siteCategory = await SiteCategory.findOne({
                where: { libelle: 'Electromenagers' }
            });

            if (!siteCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Catégorie principale Electromenagers non trouvée'
                });
            }

            // Vérifier si la catégorie existe déjà
            const existingCategory = await Category.findOne({
                where: {
                    libelle: libelle,
                    idSiteCategory: siteCategory.id
                }
            });

            if (existingCategory) {
                return res.status(409).json({
                    success: false,
                    message: 'Cette sous-catégorie existe déjà pour les électroménagers'
                });
            }

            // Créer la sous-catégorie
            const category = await Category.create({
                libelle,
                description: description || `Sous-catégorie ${typeElectroLower === 'gros' ? 'gros' : 'petit'} électroménager: ${libelle}`,
                isActive,
                idSiteCategory: siteCategory.id
            });

            return res.status(201).json({
                success: true,
                message: `Sous-catégorie ${typeElectroLower === 'gros' ? 'gros' : 'petit'} électroménager créée avec succès`,
                data: {
                    ...category.toJSON(),
                    typeElectro: typeElectroLower
                }
            });
        } catch (error) {
            console.error('Erreur création catégorie électroménager:', error);
            
            // Gestion des erreurs de contrainte unique
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({
                    success: false,
                    message: 'Cette sous-catégorie existe déjà'
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de la sous-catégorie électroménager',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = CategoryController;