const express = require('express');
const router  = express.Router();
const PubliciteController   = require('../controllers/publiciteController');
const authenticate          = require('../middleware/auth');
const { uploadPubliciteImages } = require('../middleware/upload');

/**
 * @swagger
 * tags:
 *   name: Publicites
 *   description: Gestion des publicités
 */

/**
 * @swagger
 * /publicites:
 *   get:
 *     summary: Récupérer toutes les publicités
 *     tags: [Publicites]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *       - in: query
 *         name: idCategory
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par catégorie
 *       - in: query
 *         name: idProduit
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par produit
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par libellé
 *     responses:
 *       200:
 *         description: Liste des publicités
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
 *                         $ref: '#/components/schemas/Publicite'
 */
router.get('/', PubliciteController.getAll);



/**
 * @swagger
 * /publicites/{id}:
 *   get:
 *     summary: Récupérer une publicité par ID
 *     tags: [Publicites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Publicité trouvée
 *       404:
 *         description: Publicité non trouvée
 */
router.get('/:id', PubliciteController.getById);

/**
 * @swagger
 * /publicites:
 *   post:
 *     summary: Créer une nouvelle publicité
 *     tags: [Publicites]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - libelle
 *             properties:
 *               libelle:
 *                 type: string
 *               description:
 *                 type: string
 *               dateExpiration:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *               idCategory:
 *                 type: string
 *                 format: uuid
 *               idProduit:
 *                 type: string
 *                 format: uuid
 *               images:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Publicité créée avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Catégorie ou produit non trouvé
 */
router.post('/', authenticate, uploadPubliciteImages, PubliciteController.create);

/**
 * @swagger
 * /publicites/{id}:
 *   put:
 *     summary: Mettre à jour une publicité
 *     tags: [Publicites]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               libelle:
 *                 type: string
 *               description:
 *                 type: string
 *               dateExpiration:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *               idCategory:
 *                 type: string
 *                 format: uuid
 *               idProduit:
 *                 type: string
 *                 format: uuid
 *               images:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Publicité mise à jour
 *       404:
 *         description: Publicité non trouvée
 */
router.put('/:id', authenticate, uploadPubliciteImages, PubliciteController.update);

/**
 * @swagger
 * /publicites/{id}:
 *   delete:
 *     summary: Supprimer une publicité (soft delete)
 *     tags: [Publicites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Publicité supprimée
 *       404:
 *         description: Publicité non trouvée
 */
router.delete('/:id', authenticate, PubliciteController.delete);

/**
 * @swagger
 * /publicites/{id}/toggle:
 *   patch:
 *     summary: Activer ou désactiver une publicité
 *     tags: [Publicites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Statut de la publicité modifié
 *       404:
 *         description: Publicité non trouvée
 */
router.patch('/:id/toggle', authenticate, PubliciteController.toggle);

module.exports = router;