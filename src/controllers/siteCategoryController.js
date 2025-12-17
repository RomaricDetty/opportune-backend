const { SiteCategory, Category, Marque } = require('../models');
const { Op } = require('sequelize');

/**
 * Controller pour la gestion des catégories principales du site
 */
class SiteCategoryController {
    /**
     * Créer une nouvelle catégorie
     * POST /api/site-categories
     */
    static async create(req, res) {
        try {
            const { libelle, description, isActive } = req.body;

            // Vérifier si la catégorie existe déjà
            const existingCategory = await SiteCategory.findOne({
                where: { libelle }
            });

            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Une catégorie avec ce libellé existe déjà'
                });
            }

            // Créer la catégorie
            const siteCategory = await SiteCategory.create({
                libelle,
                description,
                isActive: isActive !== undefined ? isActive : true
            });

            return res.status(201).json({
                success: true,
                message: 'Catégorie créée avec succès',
                data: siteCategory
            });
        } catch (error) {
            console.error('Erreur création SiteCategory:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de la catégorie',
                error: error.message
            });
        }
    }

    /**
     * Récupérer toutes les catégories
     * GET /api/site-categories
     */
    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                isActive,
                includeDeleted = false
            } = req.query;

            const offset = (page - 1) * limit;
            const where = {};

            // Filtre par recherche
            if (search) {
                where[Op.or] = [
                    { libelle: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ];
            }

            // Filtre par statut actif
            if (isActive !== undefined) {
                where.isActive = isActive === 'true';
            }

            // Options de requête
            const options = {
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: Category,
                        as: 'categories', // Correction ici: remplace 'categoriesElectromenager' par 'categories'
                        attributes: ['id', 'libelle']
                    },
                    {
                        model: Marque,
                        as: 'marques',
                        attributes: ['id', 'libelle']
                    }
                ]
            };

            // Inclure les éléments supprimés si demandé
            if (includeDeleted === 'true') {
                options.paranoid = false;
            }

            const { count, rows } = await SiteCategory.findAndCountAll(options);

            return res.status(200).json({
                success: true,
                data: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            console.error('Erreur récupération SiteCategories:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des catégories',
                error: error.message
            });
        }
    }

    /**
     * Récupérer les catégories d'électroménager organisées par type (Gros/Petit)
     * GET /api/site-categories/electromenagers/organized
     */
    static async getElectromenagersOrganized(req, res) {
        try {
            // Récupérer la catégorie principale "Electromenagers"
            const electromenagersCategory = await SiteCategory.findOne({
                where: { libelle: 'Electromenagers' }
            });

            if (!electromenagersCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Catégorie Electromenagers non trouvée'
                });
            }

            // Récupérer toutes les catégories d'électroménager
            const allCategories = await Category.findAll({
                where: {
                    idSiteCategory: electromenagersCategory.id,
                    isActive: true
                },
                attributes: ['id', 'libelle', 'description', 'isActive'],
                order: [['libelle', 'ASC']]
            });

            // Définir les listes de sous-catégories pour chaque type
            const grosElectroSubcategories = [
                'Cave à vin',
                'Chauffe-eau',
                'Climatisation',
                'Congélateurs',
                'Cuisine',
                'Fours',
                'Hottes',
                'Lave-linge',
                'Lave-linge séchant',
                'Lave-vaisselle',
                'Micro-ondes',
                'Plaques de cuisson',
                'Réfrigérateurs',
                'Sèche-linge'
            ];

            const petitElectroSubcategories = [
                'Aspirateurs',
                'Autocuiseurs',
                'Blenders',
                'Bouilloires',
                'Cafetières',
                'Centrifugeuses',
                'Fers à repasser',
                'Friteuses',
                'Grille-pain',
                'Machines à café',
                'Mixeurs',
                'Planchas',
                'Robots de cuisine',
                'Sèche-cheveux'
            ];

            // Organiser les catégories
            const grosElectro = allCategories.find(cat => cat.libelle === 'Gros électroménager');
            const petitElectro = allCategories.find(cat => cat.libelle === 'Petit électroménager');

            const organized = {
                grosElectromenager: {
                    category: grosElectro ? {
                        id: grosElectro.id,
                        libelle: grosElectro.libelle,
                        description: grosElectro.description
                    } : null,
                    subcategories: allCategories.filter(cat => 
                        grosElectroSubcategories.includes(cat.libelle)
                    )
                },
                petitElectromenager: {
                    category: petitElectro ? {
                        id: petitElectro.id,
                        libelle: petitElectro.libelle,
                        description: petitElectro.description
                    } : null,
                    subcategories: allCategories.filter(cat => 
                        petitElectroSubcategories.includes(cat.libelle)
                    )
                }
            };

            return res.status(200).json({
                success: true,
                data: organized
            });
        } catch (error) {
            console.error('Erreur récupération catégories organisées:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des catégories organisées',
                error: error.message
            });
        }
    }

    /**
     * Récupérer une catégorie par ID
     * GET /api/site-categories/:id
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const { includeDeleted = false, organized = false } = req.query;

            const options = {
                where: { id },
                include: [
                    {
                        model: Category,
                        as: 'categories',
                        attributes: ['id', 'libelle', 'description', 'isActive'],
                        where: { isActive: true },
                        required: false
                    },
                    {
                        model: Marque,
                        as: 'marques',
                        attributes: ['id', 'libelle', 'description', 'logo', 'isActive']
                    }
                ]
            };

            if (includeDeleted === 'true') {
                options.paranoid = false;
            }

            const siteCategory = await SiteCategory.findOne(options);

            if (!siteCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Catégorie non trouvée'
                });
            }

            // Si c'est Electromenagers et que organized=true, organiser les catégories
            if (siteCategory.libelle === 'Electromenagers' && organized === 'true') {
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

                const categories = siteCategory.categories || [];
                const grosElectro = categories.find(cat => cat.libelle === 'Gros électroménager');
                const petitElectro = categories.find(cat => cat.libelle === 'Petit électroménager');

                const organizedCategories = {
                    grosElectromenager: {
                        category: grosElectro || null,
                        subcategories: categories.filter(cat => 
                            grosElectroSubcategories.includes(cat.libelle)
                        )
                    },
                    petitElectromenager: {
                        category: petitElectro || null,
                        subcategories: categories.filter(cat => 
                            petitElectroSubcategories.includes(cat.libelle)
                        )
                    }
                };

                return res.status(200).json({
                    success: true,
                    data: {
                        ...siteCategory.toJSON(),
                        organizedCategories
                    }
                });
            }

            return res.status(200).json({
                success: true,
                data: siteCategory
            });
        } catch (error) {
            console.error('Erreur récupération SiteCategory:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération de la catégorie',
                error: error.message
            });
        }
    }

    /**
     * Mettre à jour une catégorie
     * PUT /api/site-categories/:id
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { libelle, description, isActive } = req.body;

            const siteCategory = await SiteCategory.findByPk(id);

            if (!siteCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Catégorie non trouvée'
                });
            }

            // Vérifier si le nouveau libellé existe déjà (sauf pour la catégorie actuelle)
            if (libelle && libelle !== siteCategory.libelle) {
                const existingCategory = await SiteCategory.findOne({
                    where: {
                        libelle,
                        id: { [Op.ne]: id }
                    }
                });

                if (existingCategory) {
                    return res.status(400).json({
                        success: false,
                        message: 'Une catégorie avec ce libellé existe déjà'
                    });
                }
            }

            // Mettre à jour
            await siteCategory.update({
                libelle: libelle || siteCategory.libelle,
                description: description !== undefined ? description : siteCategory.description,
                isActive: isActive !== undefined ? isActive : siteCategory.isActive
            });

            return res.status(200).json({
                success: true,
                message: 'Catégorie mise à jour avec succès',
                data: siteCategory
            });
        } catch (error) {
            console.error('Erreur mise à jour SiteCategory:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de la catégorie',
                error: error.message
            });
        }
    }

    /**
     * Supprimer une catégorie (soft delete)
     * DELETE /api/site-categories/:id
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const { force = false } = req.query;

            const siteCategory = await SiteCategory.findByPk(id);

            if (!siteCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Catégorie non trouvée'
                });
            }

            // Vérifier s'il y a des éléments liés
            const categoriesCount = await Category.count({
                where: { idSiteCategory: id }
            });

            const marquesCount = await Marque.count({
                where: { idSiteCategory: id }
            });

            if (categoriesCount > 0 || marquesCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Impossible de supprimer cette catégorie. Elle contient ${categoriesCount} sous-catégorie(s) et ${marquesCount} marque(s).`,
                    details: {
                        categoriesElectromenager: categoriesCount,
                        marques: marquesCount
                    }
                });
            }

            // Supprimer (soft delete par défaut, hard delete si force=true)
            if (force === 'true') {
                await siteCategory.destroy({ force: true });
            } else {
                await siteCategory.destroy();
            }

            return res.status(200).json({
                success: true,
                message: force === 'true'
                    ? 'Catégorie supprimée définitivement'
                    : 'Catégorie désactivée avec succès'
            });
        } catch (error) {
            console.error('Erreur suppression SiteCategory:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de la catégorie',
                error: error.message
            });
        }
    }

    /**
     * Restaurer une catégorie supprimée (soft delete)
     * POST /api/site-categories/:id/restore
     */
    static async restore(req, res) {
        try {
            const { id } = req.params;

            const siteCategory = await SiteCategory.findOne({
                where: { id },
                paranoid: false
            });

            if (!siteCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Catégorie non trouvée'
                });
            }

            if (!siteCategory.deletedAt) {
                return res.status(400).json({
                    success: false,
                    message: 'Cette catégorie n\'est pas supprimée'
                });
            }

            await siteCategory.restore();

            return res.status(200).json({
                success: true,
                message: 'Catégorie restaurée avec succès',
                data: siteCategory
            });
        } catch (error) {
            console.error('Erreur restauration SiteCategory:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la restauration de la catégorie',
                error: error.message
            });
        }
    }

    /**
     * Obtenir les statistiques d'une catégorie
     * GET /api/site-categories/:id/stats
     */
    static async getStats(req, res) {
        try {
            const { id } = req.params;

            const siteCategory = await SiteCategory.findByPk(id);

            if (!siteCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Catégorie non trouvée'
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
                data: {
                    category: siteCategory,
                    stats
                }
            });
        } catch (error) {
            console.error('Erreur statistiques SiteCategory:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des statistiques',
                error: error.message
            });
        }
    }
}

module.exports = SiteCategoryController;