const { Marque, SiteCategory, Produit } = require('../models');
const { Op } = require('sequelize');

/**
 * Controller pour la gestion des marques
 */
class MarqueController {
    /**
     * Récupérer toutes les marques
     * GET /api/marques/getAll
     */
    static async getAll(req, res) {
        try {
            const { idSiteCategory, isActive } = req.query;
            const where = {};
            
            if (idSiteCategory) where.idSiteCategory = idSiteCategory;
            if (isActive !== undefined) where.isActive = isActive === 'true';

            const marques = await Marque.findAll({
                where,
                include: [{
                    model: SiteCategory,
                    as: 'siteCategory',
                    attributes: ['id', 'libelle']
                }],
                order: [['libelle', 'ASC']]
            });

            return res.status(200).json({
                success: true,
                data: marques
            });
        } catch (error) {
            console.error('Erreur récupération Marques:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des marques'
            });
        }
    }

    /**
     * Récupérer une marque par ID
     * GET /api/marques/getById/:id
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const marque = await Marque.findByPk(id, {
                include: [
                    {
                        model: SiteCategory,
                        as: 'siteCategory',
                        attributes: ['id', 'libelle']
                    },
                    {
                        model: Produit,
                        as: 'produits',
                        attributes: ['id', 'libelle', 'prix', 'isActive', 'isAvailable']
                    }
                ]
            });

            if (!marque) {
                return res.status(404).json({
                    success: false,
                    message: 'Marque non trouvée'
                });
            }

            return res.status(200).json({
                success: true,
                data: marque
            });
        } catch (error) {
            console.error('Erreur récupération Marque:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération de la marque'
            });
        }
    }

    /**
     * Créer une nouvelle marque
     * POST /api/marques/create
     */
    static async create(req, res) {
        try {
            const { libelle, description, logo, idSiteCategory, isActive } = req.body;

            // Vérifier si la marque existe déjà pour cette catégorie
            const existingMarque = await Marque.findOne({
                where: {
                    libelle,
                    idSiteCategory
                }
            });

            if (existingMarque) {
                return res.status(409).json({
                    success: false,
                    message: 'Une marque avec ce libellé existe déjà pour cette catégorie'
                });
            }

            // Vérifier que la catégorie principale existe
            const siteCategory = await SiteCategory.findByPk(idSiteCategory);
            if (!siteCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Catégorie principale non trouvée'
                });
            }

            const marque = await Marque.create({
                libelle,
                description,
                logo,
                idSiteCategory,
                isActive: isActive !== undefined ? isActive : true
            });

            return res.status(201).json({
                success: true,
                message: 'Marque créée avec succès',
                data: marque
            });
        } catch (error) {
            console.error('Erreur création Marque:', error);
            
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({
                    success: false,
                    message: 'Une marque avec ce libellé existe déjà pour cette catégorie'
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de la marque'
            });
        }
    }

    /**
     * Mettre à jour une marque
     * PUT /api/marques/update/:id
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { libelle, description, logo, idSiteCategory, isActive } = req.body;

            const marque = await Marque.findByPk(id);
            if (!marque) {
                return res.status(404).json({
                    success: false,
                    message: 'Marque non trouvée'
                });
            }

            // Vérifier si le nouveau libellé existe déjà pour cette catégorie
            if (libelle && libelle !== marque.libelle) {
                const existingMarque = await Marque.findOne({
                    where: {
                        libelle,
                        idSiteCategory: idSiteCategory || marque.idSiteCategory,
                        id: { [Op.ne]: id }
                    }
                });

                if (existingMarque) {
                    return res.status(409).json({
                        success: false,
                        message: 'Une marque avec ce libellé existe déjà pour cette catégorie'
                    });
                }
            }

            // Vérifier que la catégorie principale existe si elle est modifiée
            if (idSiteCategory && idSiteCategory !== marque.idSiteCategory) {
                const siteCategory = await SiteCategory.findByPk(idSiteCategory);
                if (!siteCategory) {
                    return res.status(404).json({
                        success: false,
                        message: 'Catégorie principale non trouvée'
                    });
                }
            }

            await marque.update({
                libelle,
                description,
                logo,
                idSiteCategory,
                isActive
            });

            return res.status(200).json({
                success: true,
                message: 'Marque mise à jour avec succès',
                data: marque
            });
        } catch (error) {
            console.error('Erreur mise à jour Marque:', error);
            
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({
                    success: false,
                    message: 'Une marque avec ce libellé existe déjà pour cette catégorie'
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de la marque'
            });
        }
    }

    /**
     * Supprimer une marque (soft delete)
     * DELETE /api/marques/delete/:id
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const marque = await Marque.findByPk(id);
            
            if (!marque) {
                return res.status(404).json({
                    success: false,
                    message: 'Marque non trouvée'
                });
            }

            // Vérifier si la marque a des produits associés
            const produitsCount = await Produit.count({
                where: { idMarque: id }
            });

            if (produitsCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Impossible de supprimer la marque car elle est associée à ${produitsCount} produit(s)`
                });
            }

            await marque.destroy();
            return res.status(200).json({
                success: true,
                message: 'Marque supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur suppression Marque:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de la marque'
            });
        }
    }

    /**
     * Restaurer une marque supprimée
     * POST /api/marques/restore/:id
     */
    static async restore(req, res) {
        try {
            const { id } = req.params;
            const marque = await Marque.findByPk(id, { paranoid: false });
            
            if (!marque) {
                return res.status(404).json({
                    success: false,
                    message: 'Marque non trouvée'
                });
            }

            if (!marque.deletedAt) {
                return res.status(400).json({
                    success: false,
                    message: 'La marque n\'a pas été supprimée'
                });
            }

            await marque.restore();
            return res.status(200).json({
                success: true,
                message: 'Marque restaurée avec succès'
            });
        } catch (error) {
            console.error('Erreur restauration Marque:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la restauration de la marque'
            });
        }
    }

    /**
     * Obtenir les statistiques d'une marque
     * GET /api/marques/getStats/:id
     */
    static async getStats(req, res) {
        try {
            const { id } = req.params;
            const marque = await Marque.findByPk(id);
            
            if (!marque) {
                return res.status(404).json({
                    success: false,
                    message: 'Marque non trouvée'
                });
            }

            const stats = {
                totalProduits: await Produit.count({
                    where: { idMarque: id }
                }),
                produitsActifs: await Produit.count({
                    where: { idMarque: id, isActive: true }
                }),
                produitsDisponibles: await Produit.count({
                    where: { idMarque: id, isActive: true, isAvailable: true }
                }),
                produitsEnStock: await Produit.count({
                    where: { 
                        idMarque: id, 
                        quantite_stock: { [Op.gt]: 0 }
                    }
                })
            };

            return res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Erreur statistiques Marque:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des statistiques'
            });
        }
    }
}

module.exports = MarqueController;



