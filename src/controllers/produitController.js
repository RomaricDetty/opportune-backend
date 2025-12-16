const { Produit, Marque, Category, SiteCategory } = require('../models');
const { Op } = require('sequelize');
const ImageHandler = require('../utils/imageHandler');

/**
 * Controller pour la gestion des produits
 */
class ProduitController {
    /**
     * Récupérer tous les produits
     * GET /api/produits/getAll
     */
    static async getAll(req, res) {
        try {
            const { idMarque, idCategory, isActive, isAvailable, minPrice, maxPrice } = req.query;
            const where = {};

            if (idMarque) where.idMarque = idMarque;
            if (idCategory) where.idCategory = idCategory;
            if (isActive !== undefined) where.isActive = isActive === 'true';
            if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';
            if (minPrice || maxPrice) {
                where.prix = {};
                if (minPrice) where.prix[Op.gte] = parseFloat(minPrice);
                if (maxPrice) where.prix[Op.lte] = parseFloat(maxPrice);
            }

            const produits = await Produit.findAll({
                where,
                include: [
                    {
                        model: Marque,
                        as: 'marque',
                        attributes: ['id', 'libelle', 'logo'],
                        include: [{
                            model: SiteCategory,
                            as: 'siteCategory',
                            attributes: ['id', 'libelle']
                        }]
                    },
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'libelle']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                data: produits
            });
        } catch (error) {
            console.error('Erreur récupération Produits:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des produits'
            });
        }
    }

    /**
     * Récupérer un produit par ID
     * GET /api/produits/getById/:id
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const produit = await Produit.findByPk(id, {
                include: [
                    {
                        model: Marque,
                        as: 'marque',
                        attributes: ['id', 'libelle', 'logo', 'description'],
                        include: [{
                            model: SiteCategory,
                            as: 'siteCategory',
                            attributes: ['id', 'libelle']
                        }]
                    },
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'libelle', 'description']
                    }
                ]
            });

            if (!produit) {
                return res.status(404).json({
                    success: false,
                    message: 'Produit non trouvé'
                });
            }

            return res.status(200).json({
                success: true,
                data: produit
            });
        } catch (error) {
            console.error('Erreur récupération Produit:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du produit'
            });
        }
    }

    /**
     * Créer un nouveau produit
     * POST /api/produits/create
     */
    static async create(req, res) {
        try {
            const {
                libelle,
                description,
                quantite_minimale,
                prix,
                quantite_stock,
                idMarque,
                idCategory,
                imagePrincipale,
                images,
                caracteristiques,
                reference,
                isActive,
                isAvailable
            } = req.body;

            // Vérifier que la marque existe
            const marque = await Marque.findByPk(idMarque);
            if (!marque) {
                return res.status(404).json({
                    success: false,
                    message: 'Marque non trouvée'
                });
            }

            // Vérifier que la catégorie existe si elle est fournie
            if (idCategory) {
                const category = await Category.findByPk(idCategory);
                if (!category) {
                    return res.status(404).json({
                        success: false,
                        message: 'Catégorie non trouvée'
                    });
                }
            }

            // Vérifier si la référence existe déjà
            if (reference) {
                const existingProduit = await Produit.findOne({
                    where: { reference }
                });
                if (existingProduit) {
                    return res.status(409).json({
                        success: false,
                        message: 'Un produit avec cette référence existe déjà'
                    });
                }
            }

            // Traiter les images (base64 ou fichiers)
            const processedMainImage = ImageHandler.processMainImage(imagePrincipale);
            const processedImages = ImageHandler.processImagesArray(images);

            // Valider les images base64 si présentes
            if (processedMainImage && ImageHandler.isBase64(processedMainImage)) {
                if (!ImageHandler.validateBase64(processedMainImage)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Format d\'image principale invalide. Utilisez base64 (jpeg, jpg, png, gif, webp)'
                    });
                }
            }

            // Valider chaque image du tableau
            for (const img of processedImages) {
                if (img && ImageHandler.isBase64(img)) {
                    if (!ImageHandler.validateBase64(img)) {
                        return res.status(400).json({
                            success: false,
                            message: 'Format d\'image invalide dans le tableau. Utilisez base64 (jpeg, jpg, png, gif, webp)'
                        });
                    }
                }
            }

            const produit = await Produit.create({
                libelle,
                description,
                quantite_minimale,
                prix,
                quantite_stock,
                idMarque,
                idCategory,
                imagePrincipale: processedMainImage,
                images: processedImages,
                caracteristiques: caracteristiques || {},
                reference,
                isActive: isActive !== undefined ? isActive : true,
                isAvailable: isAvailable !== undefined ? isAvailable : true
            });

            return res.status(201).json({
                success: true,
                message: 'Produit créé avec succès',
                data: produit
            });
        } catch (error) {
            console.error('Erreur création Produit:', error);
            
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({
                    success: false,
                    message: 'Un produit avec cette référence existe déjà'
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la création du produit'
            });
        }
    }

    /**
     * Mettre à jour un produit
     * PUT /api/produits/update/:id
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const {
                libelle,
                description,
                quantite_minimale,
                prix,
                quantite_stock,
                idMarque,
                idCategory,
                imagePrincipale,
                images,
                caracteristiques,
                reference,
                isActive,
                isAvailable
            } = req.body;

            const produit = await Produit.findByPk(id);
            if (!produit) {
                return res.status(404).json({
                    success: false,
                    message: 'Produit non trouvé'
                });
            }

            // Vérifier que la marque existe si elle est modifiée
            if (idMarque && idMarque !== produit.idMarque) {
                const marque = await Marque.findByPk(idMarque);
                if (!marque) {
                    return res.status(404).json({
                        success: false,
                        message: 'Marque non trouvée'
                    });
                }
            }

            // Vérifier que la catégorie existe si elle est modifiée
            if (idCategory !== undefined && idCategory !== produit.idCategory) {
                if (idCategory) {
                    const category = await Category.findByPk(idCategory);
                    if (!category) {
                        return res.status(404).json({
                            success: false,
                            message: 'Catégorie non trouvée'
                        });
                    }
                }
            }

            // Vérifier si la référence existe déjà pour un autre produit
            if (reference && reference !== produit.reference) {
                const existingProduit = await Produit.findOne({
                    where: { reference, id: { [Op.ne]: id } }
                });
                if (existingProduit) {
                    return res.status(409).json({
                        success: false,
                        message: 'Un produit avec cette référence existe déjà'
                    });
                }
            }

            // Traiter les images (base64 ou fichiers) si fournies
            let processedMainImage = imagePrincipale !== undefined 
                ? ImageHandler.processMainImage(imagePrincipale) 
                : produit.imagePrincipale;
            
            let processedImages = images !== undefined 
                ? ImageHandler.processImagesArray(images) 
                : produit.images;

            // Valider les images base64 si présentes
            if (processedMainImage && ImageHandler.isBase64(processedMainImage)) {
                if (!ImageHandler.validateBase64(processedMainImage)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Format d\'image principale invalide. Utilisez base64 (jpeg, jpg, png, gif, webp)'
                    });
                }
            }

            // Valider chaque image du tableau
            for (const img of processedImages) {
                if (img && ImageHandler.isBase64(img)) {
                    if (!ImageHandler.validateBase64(img)) {
                        return res.status(400).json({
                            success: false,
                            message: 'Format d\'image invalide dans le tableau. Utilisez base64 (jpeg, jpg, png, gif, webp)'
                        });
                    }
                }
            }

            await produit.update({
                libelle,
                description,
                quantite_minimale,
                prix,
                quantite_stock,
                idMarque,
                idCategory,
                imagePrincipale: processedMainImage,
                images: processedImages,
                caracteristiques,
                reference,
                isActive,
                isAvailable
            });

            return res.status(200).json({
                success: true,
                message: 'Produit mis à jour avec succès',
                data: produit
            });
        } catch (error) {
            console.error('Erreur mise à jour Produit:', error);
            
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({
                    success: false,
                    message: 'Un produit avec cette référence existe déjà'
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du produit'
            });
        }
    }

    /**
     * Supprimer un produit (soft delete)
     * DELETE /api/produits/delete/:id
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const produit = await Produit.findByPk(id);
            
            if (!produit) {
                return res.status(404).json({
                    success: false,
                    message: 'Produit non trouvé'
                });
            }

            await produit.destroy();
            return res.status(200).json({
                success: true,
                message: 'Produit supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur suppression Produit:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression du produit'
            });
        }
    }

    /**
     * Restaurer un produit supprimé
     * POST /api/produits/restore/:id
     */
    static async restore(req, res) {
        try {
            const { id } = req.params;
            const produit = await Produit.findByPk(id, { paranoid: false });
            
            if (!produit) {
                return res.status(404).json({
                    success: false,
                    message: 'Produit non trouvé'
                });
            }

            if (!produit.deletedAt) {
                return res.status(400).json({
                    success: false,
                    message: 'Le produit n\'a pas été supprimé'
                });
            }

            await produit.restore();
            return res.status(200).json({
                success: true,
                message: 'Produit restauré avec succès'
            });
        } catch (error) {
            console.error('Erreur restauration Produit:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la restauration du produit'
            });
        }
    }

    /**
     * Mettre à jour le stock d'un produit
     * PUT /api/produits/updateStock/:id
     */
    static async updateStock(req, res) {
        try {
            const { id } = req.params;
            const { quantite_stock, operation } = req.body; // operation: 'set', 'add', 'subtract'

            const produit = await Produit.findByPk(id);
            if (!produit) {
                return res.status(404).json({
                    success: false,
                    message: 'Produit non trouvé'
                });
            }

            let newStock = produit.quantite_stock;
            if (operation === 'set') {
                newStock = quantite_stock;
            } else if (operation === 'add') {
                newStock = produit.quantite_stock + quantite_stock;
            } else if (operation === 'subtract') {
                newStock = Math.max(0, produit.quantite_stock - quantite_stock);
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Opération invalide. Utilisez "set", "add" ou "subtract"'
                });
            }

            await produit.update({ quantite_stock: newStock });

            return res.status(200).json({
                success: true,
                message: 'Stock mis à jour avec succès',
                data: {
                    ancienStock: produit.quantite_stock,
                    nouveauStock: newStock
                }
            });
        } catch (error) {  
            console.error('Erreur mise à jour stock:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du stock'
            });
        }
    }
}

module.exports = ProduitController;
