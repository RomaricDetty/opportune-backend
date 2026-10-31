const { Marque, SiteCategory, Produit } = require('../models');
const { Op } = require('sequelize');
const ImageHandler = require('../utils/imageHandler');

const DUPLICATE_MESSAGE = 'Une marque porte déjà ce nom';

/**
 * Vérifie qu'un rayon facultatif existe.
 * @param {string|null|undefined} idSiteCategory
 * @returns {Promise<boolean>} true si le rayon est absent ou existant
 */
const rayonIsValid = async (idSiteCategory) =>
    !idSiteCategory || Boolean(await SiteCategory.findByPk(idSiteCategory));

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
                order: [['createdAt', 'DESC']]
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
                        attributes: ['id', 'libelle', 'prix', 'isActive', 'isAvailable'],
                        separate: true,
                        order: [['createdAt', 'DESC']]
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

            const existingMarque = await Marque.findOne({ where: { libelle } });
            if (existingMarque) {
                return res.status(409).json({
                    success: false,
                    message: DUPLICATE_MESSAGE
                });
            }

            if (!(await rayonIsValid(idSiteCategory))) {
                return res.status(404).json({
                    success: false,
                    message: 'Rayon non trouvé'
                });
            }

            const marque = await Marque.create({
                libelle,
                description,
                logo: req.file
                    ? ImageHandler.processMainImage(req.file.buffer, req.file.mimetype)
                    : logo,
                idSiteCategory: idSiteCategory || null,
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
                    message: DUPLICATE_MESSAGE
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
            const { libelle, description, logo, idSiteCategory, isActive, removeLogo } = req.body;

            const marque = await Marque.findByPk(id);
            if (!marque) {
                return res.status(404).json({
                    success: false,
                    message: 'Marque non trouvée'
                });
            }

            if (libelle && libelle !== marque.libelle) {
                const existingMarque = await Marque.findOne({
                    where: {
                        libelle,
                        id: { [Op.ne]: id }
                    }
                });

                if (existingMarque) {
                    return res.status(409).json({
                        success: false,
                        message: DUPLICATE_MESSAGE
                    });
                }
            }

            if (!(await rayonIsValid(idSiteCategory))) {
                return res.status(404).json({
                    success: false,
                    message: 'Rayon non trouvé'
                });
            }

            // Seuls les champs reçus sont modifiés : le formulaire n'envoie ni rayon ni logo inchangé.
            const updates = {};
            if (libelle !== undefined) updates.libelle = libelle;
            if (description !== undefined) updates.description = description;
            if (isActive !== undefined) updates.isActive = isActive;
            if (idSiteCategory !== undefined) updates.idSiteCategory = idSiteCategory || null;

            if (req.file) {
                updates.logo = ImageHandler.processMainImage(req.file.buffer, req.file.mimetype);
            } else if (removeLogo === true || removeLogo === 'true') {
                updates.logo = null;
            } else if (logo !== undefined) {
                updates.logo = logo;
            }

            await marque.update(updates);

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
                    message: DUPLICATE_MESSAGE
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



