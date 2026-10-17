const { Op } = require('sequelize');
const {
    sequelize,
    Order,
    OrderItem,
    Client,
    Produit,
    Category,
    Marque,
    DemandeDevis,
    Wishlist,
    Publicite
} = require('../models');

/**
 * Controller statistiques du tableau de bord admin.
 */
class DashboardController {
    /**
     * Agrège les indicateurs de pilotage e-commerce.
     * GET /api/admin/dashboard
     */
    static async getStats(req, res) {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const [
                totalOrders,
                ordersPending,
                ordersConfirmed,
                ordersProcessing,
                ordersShipped,
                ordersDelivered,
                ordersCancelled,
                ordersUnpaid,
                caAll,
                caPaid,
                caMonth,
                ordersToday,
                totalClients,
                clientsActive,
                totalProduits,
                produitsRupture,
                produitsStockFaible,
                totalCategories,
                totalMarques,
                totalWishlist,
                totalPublicites,
                devisCounts,
                recentOrders,
                lowStockProducts,
                topViewedProducts
            ] = await Promise.all([
                Order.count(),
                Order.count({ where: { statut: 'pending' } }),
                Order.count({ where: { statut: 'confirmed' } }),
                Order.count({ where: { statut: 'processing' } }),
                Order.count({ where: { statut: 'shipped' } }),
                Order.count({ where: { statut: 'delivered' } }),
                Order.count({ where: { statut: 'cancelled' } }),
                Order.count({ where: { statutPaiement: 'unpaid', statut: { [Op.ne]: 'cancelled' } } }),
                Order.sum('montantTotal', { where: { statut: { [Op.ne]: 'cancelled' } } }),
                Order.sum('montantTotal', { where: { statutPaiement: 'paid' } }),
                Order.sum('montantTotal', {
                    where: {
                        statut: { [Op.ne]: 'cancelled' },
                        createdAt: { [Op.gte]: startOfMonth }
                    }
                }),
                Order.count({ where: { createdAt: { [Op.gte]: startOfDay } } }),
                Client.count(),
                Client.count({ where: { isActive: true } }),
                Produit.count(),
                Produit.count({ where: { quantite_stock: 0 } }),
                Produit.count({ where: { quantite_stock: { [Op.gt]: 0, [Op.lte]: 5 } } }),
                Category.count(),
                Marque.count(),
                Wishlist.count(),
                Publicite.count({ where: { isActive: true } }),
                DemandeDevis.findAll({
                    attributes: [
                        'statut',
                        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
                    ],
                    group: ['statut']
                }),
                Order.findAll({
                    include: [
                        {
                            model: Client,
                            as: 'client',
                            attributes: ['id', 'nom', 'prenom', 'telephone', 'email']
                        },
                        { model: OrderItem, as: 'items', attributes: ['id', 'quantite'] }
                    ],
                    order: [['createdAt', 'DESC']],
                    limit: 8
                }),
                Produit.findAll({
                    where: { quantite_stock: { [Op.lte]: 5 } },
                    attributes: ['id', 'libelle', 'quantite_stock', 'prix', 'reference', 'isAvailable'],
                    include: [
                        { model: Marque, as: 'marque', attributes: ['id', 'libelle'] },
                        { model: Category, as: 'category', attributes: ['id', 'libelle'] }
                    ],
                    order: [['quantite_stock', 'ASC']],
                    limit: 8
                }),
                Produit.findAll({
                    attributes: ['id', 'libelle', 'nombreVues', 'prix', 'quantite_stock'],
                    include: [{ model: Marque, as: 'marque', attributes: ['id', 'libelle'] }],
                    order: [['nombreVues', 'DESC']],
                    limit: 5
                })
            ]);

            const demandesParStatut = devisCounts.reduce((acc, item) => {
                acc[item.statut] = parseInt(item.dataValues.total, 10);
                return acc;
            }, {});

            const totalDevis = Object.values(demandesParStatut).reduce((s, n) => s + n, 0);

            return res.status(200).json({
                success: true,
                data: {
                    kpis: {
                        caTotal: Number(caAll) || 0,
                        caPaye: Number(caPaid) || 0,
                        caMois: Number(caMonth) || 0,
                        commandesTotal: totalOrders,
                        commandesAujourdhui: ordersToday,
                        commandesEnAttente: ordersPending,
                        commandesImpayees: ordersUnpaid,
                        clientsTotal: totalClients,
                        clientsActifs: clientsActive,
                        produitsTotal: totalProduits,
                        produitsRupture,
                        produitsStockFaible,
                        categoriesTotal: totalCategories,
                        marquesTotal: totalMarques,
                        favorisTotal: totalWishlist,
                        publicitesActives: totalPublicites,
                        devisTotal: totalDevis,
                        devisEnAttente: demandesParStatut.en_attente || 0
                    },
                    commandesParStatut: {
                        pending: ordersPending,
                        confirmed: ordersConfirmed,
                        processing: ordersProcessing,
                        shipped: ordersShipped,
                        delivered: ordersDelivered,
                        cancelled: ordersCancelled
                    },
                    demandesParStatut,
                    recentOrders,
                    lowStockProducts,
                    topViewedProducts
                }
            });
        } catch (error) {
            console.error('Erreur dashboard stats:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des statistiques'
            });
        }
    }
}

module.exports = DashboardController;
