const { Op } = require('sequelize');

const { Produit, Publicite, Category} = require('../models');

const ImageHandler = require('../utils/imageHandler');

/**
 * Controller pour la gestion des publicités
 */
class PubliciteController {

    /**
 * Récupérer toutes les publicités
 * GET /publicites
 * GET /publicites?grouped=true  → retourne publicites_categories et publicites_articles
 */
static async getAll(req, res) {
    try {
        const { isActive, idCategory, idProduit, search, grouped } = req.query;

        const where = {};

        if (isActive   !== undefined) where.isActive   = isActive === 'true';
        if (idCategory !== undefined) where.idCategory = idCategory;
        if (idProduit  !== undefined) where.idProduit  = idProduit;
        if (search) {
            where.libelle = { [Op.like]: `%${search}%` };
        }

        // Si ?grouped=true → on filtre les publicités non expirées
        if (grouped === 'true') {
            where[Op.or] = [
                { dateExpiration: null },
                { dateExpiration: { [Op.gt]: new Date() } }
            ];
        }

        const publicites = await Publicite.findAll({
            where,
            include: [
                { model: Category, as: 'category', attributes: ['id', 'libelle'] },
                { model: Produit,  as: 'produit',  attributes: ['id', 'libelle'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // ── Réponse groupée ──────────────────────────────────────────────────
        if (grouped === 'true') {
            const publicites_categories = publicites.filter(p => {
                console.log('idCategory:', p.dataValues.idCategory, '| idProduit:', p.dataValues.idProduit);
                return p.dataValues.idCategory !== null && p.dataValues.idCategory !== undefined;
            });

            const publicites_articles = publicites.filter(p => {
                return p.dataValues.idProduit !== null && p.dataValues.idProduit !== undefined;
            });

            return res.status(200).json({
                success: true,
                data: { publicites_categories, publicites_articles, debug:publicites }
            });
        }

        // ── Réponse liste simple ─────────────────────────────────────────────
        return res.status(200).json({ success: true, data: publicites });

    } catch (error) {
        console.error('Erreur getAll publicités :', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des publicités'
        });
    }
}

    

    /**
     * Récupérer une publicité par ID
     * GET /publicites/:id
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;

            const publicite = await Publicite.findByPk(id, {
                include: [
                    { model: Category, as: 'category', attributes: ['id', 'libelle'] },
                    { model: Produit,  as: 'produit',  attributes: ['id', 'libelle'] }
                ]
            });

            if (!publicite) {
                return res.status(404).json({
                    success: false,
                    message: 'Publicité non trouvée'
                });
            }

            await publicite.increment('nombreVues');

            return res.status(200).json({ success: true, data: publicite });
        } catch (error) {
            console.error('Erreur getById publicité :', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération de la publicité'
            });
        }
    }

    /**
     * Créer une publicité
     * POST /publicites
     */
    static async create(req, res) {
    try {
        const {
            libelle,
            description,
            dateExpiration,
            isActive,
            idCategory,
            idProduit
        } = req.body;

        // ─── Validation association ───────────────────────────────────────
        const hasCategory = idCategory !== null && idCategory !== undefined && idCategory.trim() !== '';
        const hasProduit  = idProduit  !== null && idProduit  !== undefined && idProduit.trim()  !== '';

        if (!hasCategory && !hasProduit) {
            return res.status(400).json({
                success: false,
                message: 'Une publicité doit être associée à une catégorie ou à un produit'
            });
        }
        if (hasCategory && hasProduit) {
            return res.status(400).json({
                success: false,
                message: 'Une publicité ne peut pas être associée à la fois à une catégorie et à un produit'
            });
        }

        // ─── Vérifier existence de la cible ──────────────────────────────
        if (hasCategory) {
            const category = await Category.findByPk(idCategory);
            if (!category) {
                return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
            }
        }
        if (hasProduit) {
            const produit = await Produit.findByPk(idProduit);
            if (!produit) {
                return res.status(404).json({ success: false, message: 'Produit non trouvé' });
            }
        }

        // ─── Traitement image ─────────────────────────────────────────────
        // upload.single() → req.file (objet unique, pas un tableau)
        let processedImage = null;

        if (req.file) {
            const base64 = ImageHandler.processMainImage(req.file.buffer, req.file.mimetype);

            if (!ImageHandler.validateBase64(base64)) {
                return res.status(400).json({
                    success: false,
                    message: 'Format d\'image invalide. Utilisez base64 (jpeg, jpg, png, gif, webp)'
                });
            }

            processedImage = base64;
        }

        // ─── Création ─────────────────────────────────────────────────────
        const publicite = await Publicite.create({
            libelle,
            description,
            images:         processedImage ? JSON.stringify([processedImage]) : null,
            dateExpiration: dateExpiration || null,
            isActive:       isActive !== undefined ? isActive : true,
            idCategory:     hasCategory ? idCategory : null,
            idProduit:      hasProduit  ? idProduit  : null
        });

        return res.status(201).json({
            success: true,
            message: 'Publicité créée avec succès',
            data: publicite
        });
    } catch (error) {
        console.error('Erreur création publicité :', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.errors.map(e => e.message)
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la publicité'
        });
    }
}

    /**
     * Modifier une publicité
     * PUT /publicites/:id
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const {
                libelle,
                description,
                images,
                dateExpiration,
                isActive,
                idCategory,
                idProduit
            } = req.body;

            const publicite = await Publicite.findByPk(id);
            if (!publicite) {
                return res.status(404).json({
                    success: false,
                    message: 'Publicité non trouvée'
                });
            }

            // ─── Validation association ───────────────────────────────────────
            const newIdCategory = idCategory !== undefined
                ? (idCategory && idCategory.trim() !== '' ? idCategory : null)
                : publicite.idCategory;
            const newIdProduit  = idProduit !== undefined
                ? (idProduit && idProduit.trim() !== '' ? idProduit : null)
                : publicite.idProduit;

            const hasCategory = newIdCategory !== null && newIdCategory !== undefined;
            const hasProduit  = newIdProduit  !== null && newIdProduit  !== undefined;

            if (!hasCategory && !hasProduit) {
                return res.status(400).json({
                    success: false,
                    message: 'Une publicité doit être associée à une catégorie ou à un produit'
                });
            }
            if (hasCategory && hasProduit) {
                return res.status(400).json({
                    success: false,
                    message: 'Une publicité ne peut pas être associée à la fois à une catégorie et à un produit'
                });
            }

            // ─── Traitement image ─────────────────────────────────────────────
            let imagesToProcess = undefined;

            if (req.files && req.files.length > 0) {
                imagesToProcess = req.files.map(file =>
                    ImageHandler.processMainImage(file.buffer, file.mimetype)
                );
            }

            if (imagesToProcess === undefined && images !== undefined) {
                imagesToProcess = images;
            }

            const processedImages = imagesToProcess !== undefined
                ? ImageHandler.processImagesArray(imagesToProcess)
                : publicite.images; // ← conserve les images existantes si rien envoyé

            for (const img of processedImages) {
                if (img && ImageHandler.isBase64(img)) {
                    if (!ImageHandler.validateBase64(img)) {
                        return res.status(400).json({
                            success: false,
                            message: 'Format d\'image invalide. Utilisez base64 (jpeg, jpg, png, gif, webp)'
                        });
                    }
                }
            }

            // ─── Mise à jour ──────────────────────────────────────────────────
            await publicite.update({
                libelle:        libelle        ?? publicite.libelle,
                description:    description    ?? publicite.description,
                images:         processedImages,
                dateExpiration: dateExpiration ?? publicite.dateExpiration,
                isActive:       isActive       ?? publicite.isActive,
                idCategory:     hasCategory ? newIdCategory : null,
                idProduit:      hasProduit  ? newIdProduit  : null
            });

            return res.status(200).json({
                success: true,
                message: 'Publicité mise à jour avec succès',
                data: publicite
            });
        } catch (error) {
            console.error('Erreur mise à jour publicité :', error);
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides',
                    errors: error.errors.map(e => e.message)
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de la publicité'
            });
        }
    }

    /**
     * Supprimer une publicité (soft delete)
     * DELETE /publicites/:id
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;

            const publicite = await Publicite.findByPk(id);
            if (!publicite) {
                return res.status(404).json({
                    success: false,
                    message: 'Publicité non trouvée'
                });
            }

            await publicite.destroy();

            return res.status(200).json({
                success: true,
                message: 'Publicité supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur suppression publicité :', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de la publicité'
            });
        }
    }

    /**
     * Activer / Désactiver une publicité
     * PATCH /publicites/:id/toggle
     */
    static async toggle(req, res) {
        try {
            const { id } = req.params;

            const publicite = await Publicite.findByPk(id);
            if (!publicite) {
                return res.status(404).json({
                    success: false,
                    message: 'Publicité non trouvée'
                });
            }

            await publicite.update({ isActive: !publicite.isActive });

            return res.status(200).json({
                success: true,
                message: `Publicité ${publicite.isActive ? 'activée' : 'désactivée'}`,
                data: publicite
            });
        } catch (error) {
            console.error('Erreur toggle publicité :', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors du changement de statut de la publicité'
            });
        }
    }
}

module.exports = PubliciteController;