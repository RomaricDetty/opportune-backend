const { Op } = require('sequelize');
const {
    sequelize,
    Order,
    OrderItem,
    Produit,
    Client,
    Marque,
    Category
} = require('../models');
const { priceAfterDiscount } = require('../utils/formatPrice');

/**
 * Controller commandes e-commerce
 */
class OrderController {
    /**
     * Crée une commande depuis le panier client
     * POST /api/orders
     */
    static async create(req, res) {
        const t = await sequelize.transaction();
        try {
            const {
                items,
                adresseLivraison,
                villeLivraison,
                telephoneLivraison,
                modePaiement = 'cash_on_delivery',
                notes
            } = req.body;

            if (!Array.isArray(items) || items.length === 0) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Le panier est vide'
                });
            }

            if (!adresseLivraison || !villeLivraison || !telephoneLivraison) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Adresse, ville et téléphone de livraison sont requis'
                });
            }

            let montantTotal = 0;
            const lines = [];

            for (const item of items) {
                const quantite = Math.max(1, parseInt(item.quantite, 10) || 1);
                const produit = await Produit.findByPk(item.idProduit, { transaction: t });

                if (!produit || !produit.isActive || !produit.isAvailable) {
                    await t.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Produit indisponible: ${item.idProduit}`
                    });
                }

                if (produit.quantite_stock < quantite) {
                    await t.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Stock insuffisant pour ${produit.libelle}`
                    });
                }

                const prixUnitaire = priceAfterDiscount(produit.prix, produit.remise || 0);
                const sousTotal = prixUnitaire * quantite;
                montantTotal += sousTotal;

                lines.push({ produit, quantite, prixUnitaire, sousTotal });
            }

            const order = await Order.create({
                idClient: req.client.id,
                montantTotal,
                devise: 'XOF',
                modePaiement,
                adresseLivraison,
                villeLivraison,
                telephoneLivraison,
                notes: notes || null,
                statut: 'pending',
                statutPaiement: 'unpaid'
            }, { transaction: t });

            for (const line of lines) {
                await OrderItem.create({
                    idOrder: order.id,
                    idProduit: line.produit.id,
                    libelle: line.produit.libelle,
                    prixUnitaire: line.prixUnitaire,
                    quantite: line.quantite,
                    sousTotal: line.sousTotal
                }, { transaction: t });

                await line.produit.update({
                    quantite_stock: line.produit.quantite_stock - line.quantite
                }, { transaction: t });
            }

            await t.commit();

            const created = await Order.findByPk(order.id, {
                include: [
                    { model: OrderItem, as: 'items' },
                    { model: Client, as: 'client', attributes: { exclude: ['password'] } }
                ]
            });

            return res.status(201).json({
                success: true,
                message: 'Commande créée avec succès',
                data: created
            });
        } catch (error) {
            await t.rollback();
            console.error('Erreur create order:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de la création de la commande'
            });
        }
    }

    /**
     * Commandes du client connecté
     * GET /api/orders/me
     */
    static async getMine(req, res) {
        try {
            const orders = await Order.findAll({
                where: { idClient: req.client.id },
                include: [{ model: OrderItem, as: 'items' }],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({ success: true, data: orders });
        } catch (error) {
            console.error('Erreur getMine orders:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des commandes'
            });
        }
    }

    /**
     * Détail d'une commande (client propriétaire)
     * GET /api/orders/:id
     */
    static async getById(req, res) {
        try {
            const order = await Order.findByPk(req.params.id, {
                include: [
                    { model: OrderItem, as: 'items' },
                    { model: Client, as: 'client', attributes: { exclude: ['password'] } }
                ]
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Commande introuvable'
                });
            }

            if (order.idClient !== req.client.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé'
                });
            }

            return res.status(200).json({ success: true, data: order });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération de la commande'
            });
        }
    }

    /**
     * Liste toutes les commandes (admin)
     * GET /api/admin/orders
     */
    static async getAll(req, res) {
        try {
            const { statut, search } = req.query;
            const where = {};
            if (statut) where.statut = statut;
            if (search) {
                where.reference = { [Op.like]: `%${search}%` };
            }

            const orders = await Order.findAll({
                where,
                include: [
                    { model: OrderItem, as: 'items' },
                    {
                        model: Client,
                        as: 'client',
                        attributes: { exclude: ['password'] }
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({ success: true, data: orders });
        } catch (error) {
            console.error('Erreur admin getAll orders:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des commandes'
            });
        }
    }

    /**
     * Détail commande (admin)
     * GET /api/admin/orders/:id
     */
    static async adminGetById(req, res) {
        try {
            const order = await Order.findByPk(req.params.id, {
                include: [
                    {
                        model: OrderItem,
                        as: 'items',
                        include: [{
                            model: Produit,
                            as: 'produit',
                            include: [
                                { model: Marque, as: 'marque', attributes: ['id', 'libelle'] },
                                { model: Category, as: 'category', attributes: ['id', 'libelle'] }
                            ]
                        }]
                    },
                    { model: Client, as: 'client', attributes: { exclude: ['password'] } }
                ]
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Commande introuvable'
                });
            }

            return res.status(200).json({ success: true, data: order });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération de la commande'
            });
        }
    }

    /**
     * Met à jour le statut d'une commande (admin)
     * PUT /api/admin/orders/:id/statut
     */
    static async updateStatut(req, res) {
        try {
            const { statut, statutPaiement } = req.body;
            const order = await Order.findByPk(req.params.id);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Commande introuvable'
                });
            }

            const allowedStatuts = [
                'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
            ];
            const allowedPaiements = ['unpaid', 'paid', 'refunded'];

            if (statut && !allowedStatuts.includes(statut)) {
                return res.status(400).json({
                    success: false,
                    message: 'Statut invalide'
                });
            }

            if (statutPaiement && !allowedPaiements.includes(statutPaiement)) {
                return res.status(400).json({
                    success: false,
                    message: 'Statut de paiement invalide'
                });
            }

            if (statut) order.statut = statut;
            if (statutPaiement) order.statutPaiement = statutPaiement;
            await order.save();

            return res.status(200).json({
                success: true,
                message: 'Statut mis à jour',
                data: order
            });
        } catch (error) {
            console.error('Erreur update statut order:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour'
            });
        }
    }
}

module.exports = OrderController;
