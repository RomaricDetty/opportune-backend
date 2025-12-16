const express = require('express');
const router = express.Router();
const SiteCategoryController = require('../controllers/siteCategoryController');
const { validateSiteCategory } = require('../middleware/validators');
const authenticate = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Site Categories
 *   description: Gestion des catégories principales du site
 */

/**
 * @swagger
 * /site-categories:
 *   post:
 *     summary: Créer une nouvelle catégorie principale
 *     tags: [Site Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SiteCategoryInput'
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SiteCategory'
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur
 */
router.post(
    '/',
    authenticate,
    validateSiteCategory,
    SiteCategoryController.create
);

/**
 * @swagger
 * /site-categories:
 *   get:
 *     summary: Récupérer toutes les catégories principales
 *     tags: [Site Categories]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *     responses:
 *       200:
 *         description: Liste des catégories principales
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
 *                         $ref: '#/components/schemas/SiteCategory'
 */
router.get(
    '/',
    SiteCategoryController.getAll
);

/**
 * @swagger
 * /site-categories/electromenagers/organized:
 *   get:
 *     summary: Récupérer les catégories d'électroménager organisées par type
 *     tags: [Site Categories]
 *     description: Retourne les catégories d'électroménager organisées en gros et petit électroménager
 *     responses:
 *       200:
 *         description: Catégories organisées
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
 *                         grosElectromenager:
 *                           type: object
 *                         petitElectromenager:
 *                           type: object
 *       404:
 *         description: Catégorie Electromenagers non trouvée
 */
router.get(
    '/electromenagers/organized',
    SiteCategoryController.getElectromenagersOrganized
);

/**
 * @swagger
 * /site-categories/{id}:
 *   get:
 *     summary: Récupérer une catégorie principale par ID
 *     tags: [Site Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la catégorie principale
 *     responses:
 *       200:
 *         description: Catégorie trouvée
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SiteCategory'
 *       404:
 *         description: Catégorie non trouvée
 */
router.get(
    '/:id',
    SiteCategoryController.getById
);

/**
 * @swagger
 * /site-categories/{id}:
 *   put:
 *     summary: Mettre à jour une catégorie principale
 *     tags: [Site Categories]
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
 *             $ref: '#/components/schemas/SiteCategoryInput'
 *     responses:
 *       200:
 *         description: Catégorie mise à jour
 *       404:
 *         description: Catégorie non trouvée
 *       400:
 *         description: Erreur de validation
 */
router.put(
    '/:id',
    authenticate,
    validateSiteCategory,
    SiteCategoryController.update
);

/**
 * @swagger
 * /site-categories/{id}:
 *   delete:
 *     summary: Supprimer une catégorie principale (soft delete)
 *     tags: [Site Categories]
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
router.delete(
    '/:id',
    SiteCategoryController.delete
);

/**
 * @swagger
 * /site-categories/{id}/restore:
 *   post:
 *     summary: Restaurer une catégorie principale supprimée
 *     tags: [Site Categories]
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
router.post(
    '/:id/restore',
    SiteCategoryController.restore
);

/**
 * @swagger
 * /site-categories/{id}/stats:
 *   get:
 *     summary: Obtenir les statistiques d'une catégorie principale
 *     tags: [Site Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Catégorie non trouvée
 */
router.get(
    '/:id/stats',
    SiteCategoryController.getStats
);

module.exports = router;