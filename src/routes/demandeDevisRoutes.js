const express = require('express');
const router = express.Router();
const DemandeDevisController = require('../controllers/DemandeDevisController');
const authenticate = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: DemandeDevis
 *   description: Gestion des demandes de devis
 */

/**
 * @swagger
 * /demande-devis:
 *   get:
 *     summary: Récupérer toutes les demandes de devis
 *     tags: [DemandeDevis]
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [en_attente, en_cours, validee, annulee]
 *         description: Filtrer par statut
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Rechercher par nom, téléphone ou référence
 *     responses:
 *       200:
 *         description: Liste des demandes de devis
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DemandeDevis'
 */
router.get('/', authenticate, DemandeDevisController.getAll);
/**
 * @swagger
 * /demande-devis/countByStatut:
 *   get:
 *     summary: Récupérer le nombre de demandes par statut, le total des produits et des catégories
 *     tags: [DemandeDevis]
 *     responses:
 *       200:
 *         description: Comptages récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         demandesParStatut:
 *                           type: object
 *                           example: { "en_attente": 5, "validee": 3 }
 *                         totalProduits:
 *                           type: integer
 *                           example: 42
 *                         totalCategories:
 *                           type: integer
 *                           example: 8
 */
router.get('/stats', authenticate, DemandeDevisController.countByStatut);

/**
 * @swagger
 * /demande-devis/{id}:
 *   get:
 *     summary: Récupérer une demande de devis par ID
 *     tags: [DemandeDevis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Demande de devis trouvée
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DemandeDevis'
 *       404:
 *         description: Demande de devis non trouvée
 */
router.get('/:id', authenticate, DemandeDevisController.getById);

/**
 * @swagger
 * /demande-devis:
 *   post:
 *     summary: Créer une demande de devis
 *     tags: [DemandeDevis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomClient
 *               - telephone
 *               - items
 *             properties:
 *               nomClient:
 *                 type: string
 *                 example: 'Koné'
 *               prenomClient:
 *                 type: string
 *                 example: 'Mamadou'
 *               telephone:
 *                 type: string
 *                 example: '0788008600'
 *               email:
 *                 type: string
 *                 format: email
 *                 nullable: true
 *               adresse:
 *                 type: string
 *                 nullable: true
 *               message:
 *                 type: string
 *                 nullable: true
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - idProduit
 *                     - quantite
 *                   properties:
 *                     idProduit:
 *                       type: string
 *                       format: uuid
 *                     quantite:
 *                       type: integer
 *                       minimum: 1
 *     responses:
 *       201:
 *         description: Demande de devis créée avec succès
 *       400:
 *         description: Données manquantes ou invalides
 *       404:
 *         description: Un ou plusieurs produits introuvables
 */
router.post('/', DemandeDevisController.create);

/**
 * @swagger
 * /demande-devis/updateStatut/{id}:
 *   put:
 *     summary: Mettre à jour le statut (alias historique)
 *     tags: [DemandeDevis]
 */
router.put('/updateStatut/:id', authenticate, DemandeDevisController.updateStatut);

/**
 * @swagger
 * /demande-devis/{id}/statut:
 *   put:
 *     summary: Mettre à jour le statut d'une demande de devis
 *     tags: [DemandeDevis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - statut
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [en_attente, en_cours, validee, annulee]
 *                 example: 'validee'
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès
 *       400:
 *         description: Statut invalide
 *       404:
 *         description: Demande de devis non trouvée
 */
router.put('/:id/statut', authenticate, DemandeDevisController.updateStatut);
router.patch('/:id/statut', authenticate, DemandeDevisController.updateStatut);

/**
 * @swagger
 * /demande-devis/{id}:
 *   delete:
 *     summary: Supprimer une demande de devis (soft delete)
 *     tags: [DemandeDevis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Demande de devis supprimée
 *       404:
 *         description: Demande de devis non trouvée
 */
router.delete('/:id', authenticate, DemandeDevisController.delete);

module.exports = router;