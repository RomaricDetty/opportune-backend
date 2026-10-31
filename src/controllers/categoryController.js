const { Category, SiteCategory, Marque, Produit } = require('../models');
const { Op } = require('sequelize');

const DUPLICATE_MESSAGE = 'Cette catégorie existe déjà dans ce rayon (éventuellement supprimée)';

class CategoryController {
    /**
     * Récupérer toutes les catégories
     * GET /api/categories
     */
    static async getAll(req, res) {
        const where = {};
        try {
            const categories = await Category.findAll({
                where,
                include: [
                    {
                        model: SiteCategory,
                        as: 'siteCategory',
                        attributes: ['id', 'libelle']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
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
            const category = await Category.findByPk(id, {
                include: [
                    {
                        model: SiteCategory,
                        as: 'siteCategory',
                        attributes: ['id', 'libelle']
                    }
                ]
            });
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
            const { libelle, description, isActive, idSiteCategory } = req.body;
            const normalizedIdSiteCategory =
                idSiteCategory && String(idSiteCategory).trim() !== '' ? idSiteCategory.trim() : null;
            if (normalizedIdSiteCategory) {
                const siteCategory = await SiteCategory.findByPk(normalizedIdSiteCategory);
                if (!siteCategory) {
                    return res.status(404).json({
                        success: false,
                        message: 'Catégorie principale (site) non trouvée'
                    });
                }
            }
            const category = await Category.create({
                libelle,
                description,
                isActive,
                idSiteCategory: normalizedIdSiteCategory
            });
            return res.status(201).json({
                success: true,
                message: 'Catégorie créée avec succès',
                data: category
            });
        } catch (error) {
            console.error('Erreur création Category:', error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({
                    success: false,
                    message: DUPLICATE_MESSAGE
                });
            }
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
            const { libelle, description, isActive, idSiteCategory } = req.body;
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    id : id,
                    message: 'Catégorie non trouvée'
                });
            }
            let nextIdSiteCategory = category.idSiteCategory;
            if (idSiteCategory !== undefined) {
                const trimmed =
                    idSiteCategory && String(idSiteCategory).trim() !== '' ? idSiteCategory.trim() : null;
                if (trimmed) {
                    const siteCategory = await SiteCategory.findByPk(trimmed);
                    if (!siteCategory) {
                        return res.status(404).json({
                            success: false,
                            message: 'Catégorie principale (site) non trouvée'
                        });
                    }
                }
                nextIdSiteCategory = trimmed;
            }
            await category.update({
                libelle,
                description,
                isActive,
                idSiteCategory: nextIdSiteCategory
            });
            return res.status(200).json({
                success: true,
                message: 'Catégorie mise à jour avec succès',
                data: category
            });
        } catch (error) {
            console.error('Erreur mise à jour Category:', error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({
                    success: false,
                    message: DUPLICATE_MESSAGE
                });
            }
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
            const produitsCount = await Produit.count({ where: { idCategory: id } });
            if (produitsCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Impossible de supprimer cette catégorie : elle contient ${produitsCount} article(s). Déplacez-les d'abord.`
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

}

module.exports = CategoryController;