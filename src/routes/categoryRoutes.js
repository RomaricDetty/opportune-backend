const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { validateCategory } = require('../middleware/validators');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

const canManageCatalog = requirePermission('catalog');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gestion des sous-catégories
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Récupérer toutes les catégories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Liste des catégories
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
 *                         $ref: '#/components/schemas/Category'
 */
router.get('/', CategoryController.getAll);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Récupérer une catégorie par ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Catégorie trouvée
 *       404:
 *         description: Catégorie non trouvée
 */
router.get('/:id', CategoryController.getById);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Créer une nouvelle catégorie
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
 *       400:
 *         description: Erreur de validation
 */
router.post('/', authenticate, canManageCatalog, validateCategory, CategoryController.create);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Mettre à jour une catégorie
 *     tags: [Categories]
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
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       200:
 *         description: Catégorie mise à jour
 *       404:
 *         description: Catégorie non trouvée
 */
router.put('/:id', authenticate, canManageCatalog, validateCategory, CategoryController.update);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Supprimer une catégorie (soft delete)
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Catégorie supprimée
 *       404:
 *         description: Catégorie non trouvée
 */
router.delete('/:id', authenticate, canManageCatalog, CategoryController.delete);

/**
 * @swagger
 * /categories/{id}/restore:
 *   post:
 *     summary: Restaurer une catégorie supprimée
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Catégorie restaurée
 *       404:
 *         description: Catégorie non trouvée
 */
router.post('/:id/restore', authenticate, canManageCatalog, CategoryController.restore);

/**
 * @swagger
 * /categories/{id}/stats:
 *   get:
 *     summary: Obtenir les statistiques d'une catégorie principale
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la catégorie principale (SiteCategory)
 *     responses:
 *       200:
 *         description: Statistiques de la catégorie
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Stats'
 *       404:
 *         description: Catégorie principale non trouvée
 */
router.get('/:id/stats', CategoryController.getStats);

module.exports = router;