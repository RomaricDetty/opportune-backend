// controllers/DemandeDevisController.js
const { DemandeDevis, DemandeDevisItems, Produit, Marque, Category, sequelize } = require('../models');
const { Op } = require('sequelize');

class DemandeDevisController {

    /**
     * Créer une demande de devis
     * POST /api/demande-devis/create
     */
    static async create(req, res) {
        try {
            const { nomClient, prenomClient, telephone, email, adresse, message, items } = req.body;

            if (!nomClient || !telephone) {
                return res.status(400).json({ success: false, message: 'Le nom et le téléphone sont obligatoires' });
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ success: false, message: 'La demande doit contenir au moins un produit' });
            }

            const idProduits = items.map(i => i.idProduit);
            const produits = await Produit.findAll({ where: { id: { [Op.in]: idProduits } } });

            if (produits.length !== idProduits.length) {
                return res.status(404).json({ success: false, message: 'Un ou plusieurs produits sont introuvables' });
            }

            const montantTotal = items.reduce((total, item) => {
                const produit = produits.find(p => p.id === item.idProduit);
                return total + (parseFloat(produit?.prix ?? 0) * item.quantite);
            }, 0);

            // Créer la demande
            const demandeDevis = await DemandeDevis.create({ nomClient, prenomClient, telephone, email, adresse, message, montantTotal });

            // Créer les items
            const devisItems = items.map(item => {
                const produit = produits.find(p => p.id === item.idProduit);
                return {
                    idDemandeDevis: demandeDevis.id,
                    idProduit: item.idProduit,
                    quantite: item.quantite,
                    prixUnitaire: parseFloat(produit?.prix ?? 0)
                };
            });

            await DemandeDevisItems.bulkCreate(devisItems);

            const result = await DemandeDevis.findByPk(demandeDevis.id, {
                include: [{ model: DemandeDevisItems, as: 'items', include: [{ model: Produit, as: 'produit', attributes: ['id', 'libelle', 'imagePrincipale', 'prix'] }] }]
            });

            return res.status(201).json({ success: true, message: 'Demande de devis enregistrée avec succès', data: result });

        } catch (error) {
            console.error('Erreur création DemandeDevis:', error);
            return res.status(500).json({ success: false, message: 'Erreur lors de la création de la demande de devis' });
        }
    }

    /**
     * Récupérer toutes les demandes
     * GET /api/demande-devis/getAll
     */
    static async getAll(req, res) {
        try {
            const { statut, search } = req.query;
            const where = {};

            if (statut) where.statut = statut;
            if (search) {
                where[Op.or] = [
                    { nomClient: { [Op.like]: `%${search}%` } },
                    { telephone: { [Op.like]: `%${search}%` } },
                    { reference: { [Op.like]: `%${search}%` } }
                ];
            }

            const demandes = await DemandeDevis.findAll({
                where,
                include: [{
                    model: DemandeDevisItems,
                    as: 'items',
                    separate: true,
                    order: [['createdAt', 'DESC']],
                    include: [{
                        model: Produit,
                        as: 'produit',
                        attributes: ['id', 'libelle', 'imagePrincipale', 'prix']
                    }]
                }],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                data: demandes
            });
        } catch (error) {
            console.error('Erreur récupération DemandeDevis:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des demandes'
            });
        }
    }


    /**
 * Récupérer le nombre de demandes par statut, le nombre de produits et de catégories
 * GET /api/demande-devis/countByStatut
 */
    static async countByStatut(req, res) {
        try {
            const [counts, totalProduits, totalCategories] = await Promise.all([
                DemandeDevis.findAll({
                    attributes: [
                        'statut',
                        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
                    ],
                    group: ['statut']
                }),
                Produit.count(),
                Category.count()
            ]);

            // Transformer en objet clé/valeur { statut: total }
            const demandesParStatut = counts.reduce((acc, item) => {
                acc[item.statut] = parseInt(item.dataValues.total, 10);
                return acc;
            }, {});

            return res.status(200).json({
                success: true,
                data: {
                    demandesParStatut,
                    totalProduits,
                    totalCategories
                }
            });
        } catch (error) {
            console.error('Erreur countByStatut DemandeDevis:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors du comptage des demandes par statut'
            });
        }
    }

    /**
     * Récupérer une demande par ID
     * GET /api/demande-devis/getById/:id
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const demande = await DemandeDevis.findByPk(id, {
                include: [{
                    model: DemandeDevisItems,
                    as: 'items',
                    include: [{
                        model: Produit,
                        as: 'produit',
                        attributes: ['id', 'libelle', 'imagePrincipale', 'prix'],
                        include: [
                            { model: Marque, as: 'marque', attributes: ['id', 'libelle'] },
                            { model: Category, as: 'category', attributes: ['id', 'libelle'] }
                        ]
                    }]
                }]
            });

            if (!demande) {
                return res.status(404).json({
                    success: false,
                    message: 'Demande de devis non trouvée'
                });
            }

            return res.status(200).json({ success: true, data: demande });
        } catch (error) {
            console.error('Erreur récupération DemandeDevis:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération de la demande'
            });
        }
    }

    /**
     * Mettre à jour le statut d'une demande
     * PUT|PATCH /api/demande-devis/:id/statut ou PUT /api/demande-devis/updateStatut/:id
     */
    static async updateStatut(req, res) {
        try {
            const { id } = req.params;
            const raw = req.body?.statut ?? req.body?.status;
            const statut = typeof raw === 'string' ? raw.trim() : raw;

            const validStatuts = ['en_attente', 'en_cours', 'validee', 'annulee'];
            if (statut === undefined || statut === null || statut === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Le champ statut est requis (body JSON : { "statut": "..." })'
                });
            }
            if (!validStatuts.includes(statut)) {
                return res.status(400).json({
                    success: false,
                    message: `Statut invalide. Valeurs acceptées : ${validStatuts.join(', ')}`
                });
            }

            const demande = await DemandeDevis.findByPk(id);
            if (!demande) {
                return res.status(404).json({
                    success: false,
                    message: 'Demande de devis non trouvée'
                });
            }

            await demande.update({ statut });
            await demande.reload();

            return res.status(200).json({
                success: true,
                message: 'Statut mis à jour avec succès',
                data: demande
            });
        } catch (error) {
            console.error('Erreur mise à jour statut:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du statut',
                ...(process.env.NODE_ENV === 'development' && { detail: error.message })
            });
        }
    }

    /**
     * Supprimer une demande
     * DELETE /api/demande-devis/delete/:id
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const demande = await DemandeDevis.findByPk(id);

            if (!demande) {
                return res.status(404).json({
                    success: false,
                    message: 'Demande de devis non trouvée'
                });
            }

            await demande.destroy();
            return res.status(200).json({
                success: true,
                message: 'Demande de devis supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur suppression DemandeDevis:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de la demande'
            });
        }
    }
}

module.exports = DemandeDevisController;