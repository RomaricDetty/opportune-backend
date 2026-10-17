const { Wishlist, Produit, Marque, Category } = require('../models');

/**
 * Controller favoris client
 */
class WishlistController {
    /**
     * Liste les favoris du client connecté
     * GET /api/wishlist
     */
    static async getAll(req, res) {
        try {
            const items = await Wishlist.findAll({
                where: { idClient: req.client.id },
                include: [{
                    model: Produit,
                    as: 'produit',
                    include: [
                        { model: Marque, as: 'marque', attributes: ['id', 'libelle'] },
                        { model: Category, as: 'category', attributes: ['id', 'libelle'] }
                    ]
                }],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({ success: true, data: items });
        } catch (error) {
            console.error('Erreur wishlist getAll:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des favoris'
            });
        }
    }

    /**
     * Ajoute un produit aux favoris
     * POST /api/wishlist
     */
    static async add(req, res) {
        try {
            const { idProduit } = req.body;
            if (!idProduit) {
                return res.status(400).json({
                    success: false,
                    message: 'idProduit est requis'
                });
            }

            const produit = await Produit.findByPk(idProduit);
            if (!produit || !produit.isActive) {
                return res.status(404).json({
                    success: false,
                    message: 'Produit introuvable'
                });
            }

            const [item, created] = await Wishlist.findOrCreate({
                where: { idClient: req.client.id, idProduit },
                defaults: { idClient: req.client.id, idProduit }
            });

            return res.status(created ? 201 : 200).json({
                success: true,
                message: created ? 'Ajouté aux favoris' : 'Déjà dans les favoris',
                data: item
            });
        } catch (error) {
            console.error('Erreur wishlist add:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'ajout aux favoris'
            });
        }
    }

    /**
     * Retire un produit des favoris
     * DELETE /api/wishlist/:idProduit
     */
    static async remove(req, res) {
        try {
            const deleted = await Wishlist.destroy({
                where: {
                    idClient: req.client.id,
                    idProduit: req.params.idProduit
                }
            });

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Favori introuvable'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Retiré des favoris'
            });
        } catch (error) {
            console.error('Erreur wishlist remove:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression du favori'
            });
        }
    }

    /**
     * Vérifie si un produit est en favoris
     * GET /api/wishlist/check/:idProduit
     */
    static async check(req, res) {
        try {
            const item = await Wishlist.findOne({
                where: {
                    idClient: req.client.id,
                    idProduit: req.params.idProduit
                }
            });

            return res.status(200).json({
                success: true,
                data: { isFavorite: Boolean(item) }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la vérification'
            });
        }
    }
}

module.exports = WishlistController;
