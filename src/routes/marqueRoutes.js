const express = require('express');
const router = express.Router();
const MarqueController = require('../controllers/marqueController');
const { validateMarque } = require('../middleware/validators');
const authenticate = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Marques
 *   description: Gestion des marques de produits
 */

/**
 * @swagger
 * /brands:
 *   get:
 *     summary: Récupérer toutes les marques
 *     tags: [Marques]
 *     parameters:
 *       - in: query
 *         name: idSiteCategory
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par catégorie principale
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *     responses:
 *       200:
 *         description: Liste des marques
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
 *                         $ref: '#/components/schemas/Marque'
 */
router.get('/', MarqueController.getAll);

/**
 * @swagger
 * /brands/{id}:
 *   get:
 *     summary: Récupérer une marque par ID avec ses produits
 *     tags: [Marques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Marque trouvée avec ses produits
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Marque'
 *       404:
 *         description: Marque non trouvée
 */
router.get('/:id', MarqueController.getById);

/**
 * @swagger
 * /brands:
 *   post:
 *     summary: Créer une nouvelle marque
 *     tags: [Marques]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarqueInput'
 *     responses:
 *       201:
 *         description: Marque créée avec succès
 *       400:
 *         description: Erreur de validation
 *       409:
 *         description: Marque déjà existante pour cette catégorie
 */
router.post('/', authenticate, validateMarque, MarqueController.create);

/**
 * @swagger
 * /brands/{id}:
 *   put:
 *     summary: Mettre à jour une marque
 *     tags: [Marques]
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
 *             $ref: '#/components/schemas/MarqueInput'
 *     responses:
 *       200:
 *         description: Marque mise à jour
 *       404:
 *         description: Marque non trouvée
 *       409:
 *         description: Marque déjà existante pour cette catégorie
 */
router.put('/:id', authenticate, validateMarque, MarqueController.update);

/**
 * @swagger
 * /brands/{id}:
 *   delete:
 *     summary: Supprimer une marque (soft delete)
 *     tags: [Marques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Marque supprimée
 *       400:
 *         description: Impossible de supprimer, marque associée à des produits
 *       404:
 *         description: Marque non trouvée
 */
router.delete('/:id', authenticate, MarqueController.delete);

/**
 * @swagger
 * /brands/{id}/restore:
 *   post:
 *     summary: Restaurer une marque supprimée
 *     tags: [Marques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Marque restaurée
 *       404:
 *         description: Marque non trouvée
 */
router.post('/:id/restore', authenticate, MarqueController.restore);

/**
 * @swagger
 * /brands/{id}/stats:
 *   get:
 *     summary: Obtenir les statistiques d'une marque
 *     tags: [Marques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Statistiques de la marque
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MarqueStats'
 *       404:
 *         description: Marque non trouvée
 */
router.get('/:id/stats', MarqueController.getStats);

module.exports = router;
