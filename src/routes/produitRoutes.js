const express = require('express');
const router = express.Router();
const ProduitController = require('../controllers/produitController');
const { validateProduit } = require('../middleware/validators');
const { uploadProductImages } = require('../middleware/upload');
const authenticate = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Produits
 *   description: Gestion des produits disponibles à la vente
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Récupérer tous les produits
 *     tags: [Produits]
 *     parameters:
 *       - in: query
 *         name: idMarque
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par marque
 *       - in: query
 *         name: idCategory
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par catégorie
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *       - in: query
 *         name: isAvailable
 *         schema:
 *           type: boolean
 *         description: Filtrer par disponibilité
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Prix minimum
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Prix maximum
 *     responses:
 *       200:
 *         description: Liste des produits
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
 *                         $ref: '#/components/schemas/Produit'
 */
router.get('/', ProduitController.getAll);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Récupérer un produit par ID
 *     tags: [Produits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Produit trouvé
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Produit'
 *       404:
 *         description: Produit non trouvé
 */
router.get('/:id', ProduitController.getById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Créer un nouveau produit
 *     tags: [Produits]
 *     description: |
 *       Crée un nouveau produit avec gestion flexible des images.
 *       
 *       **Deux méthodes d'envoi d'images :**
 *       1. **Fichiers uploadés** (multipart/form-data) : Envoyez les fichiers directement, ils seront convertis en base64 automatiquement
 *       2. **Base64 direct** (application/json) : Envoyez les images déjà en base64
 *       
 *       **Formats d'images supportés** : JPEG, PNG, GIF, WEBP, SVG
 *       **Taille max par fichier** : 10MB
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - libelle
 *               - quantite_minimale
 *               - quantite_stock
 *               - idMarque
 *             properties:
 *               libelle:
 *                 type: string
 *                 example: 'Réfrigérateur Samsung 300L'
 *                 minLength: 2
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 example: 'Réfrigérateur combiné avec congélateur'
 *               quantite_minimale:
 *                 type: integer
 *                 example: 1
 *                 minimum: 1
 *               prix:
 *                 type: number
 *                 format: decimal
 *                 example: 299.99
 *                 minimum: 0
 *               quantite_stock:
 *                 type: integer
 *                 example: 50
 *                 minimum: 0
 *               idMarque:
 *                 type: string
 *                 format: uuid
 *                 example: '123e4567-e89b-12d3-a456-426614174000'
 *               idCategory:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               imagePrincipale:
 *                 type: string
 *                 format: binary
 *                 description: 'Fichier image principale (sera converti en base64)'
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 'Fichiers images supplémentaires (seront convertis en base64)'
 *               caracteristiques:
 *                 type: string
 *                 description: 'JSON string des caractéristiques'
 *                 example: '{"capacite":"300L","energie":"A++"}'
 *               reference:
 *                 type: string
 *                 maxLength: 50
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProduitInput'
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *       400:
 *         description: Erreur de validation (format d'image invalide, données manquantes, etc.)
 *       404:
 *         description: Marque ou catégorie non trouvée
 *       409:
 *         description: Référence déjà existante
 */
router.post('/', authenticate, uploadProductImages, validateProduit, ProduitController.create);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Mettre à jour un produit
 *     tags: [Produits]
 *     description: |
 *       Met à jour un produit existant. Les images peuvent être mises à jour avec les mêmes formats que la création.
 *       
 *       **Note** : Si vous ne fournissez pas `imagePrincipale` ou `images`, les valeurs existantes sont conservées.
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
 *               quantite_minimale:
 *                 type: integer
 *               prix:
 *                 type: number
 *               quantite_stock:
 *                 type: integer
 *               idMarque:
 *                 type: string
 *                 format: uuid
 *               idCategory:
 *                 type: string
 *                 format: uuid
 *               imagePrincipale:
 *                 type: string
 *                 format: binary
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               caracteristiques:
 *                 type: string
 *               reference:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               isAvailable:
 *                 type: boolean
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProduitInput'
 *     responses:
 *       200:
 *         description: Produit mis à jour
 *       400:
 *         description: Erreur de validation (format d'image invalide)
 *       404:
 *         description: Produit non trouvé
 *       409:
 *         description: Référence déjà existante
 */
router.put('/:id', authenticate, uploadProductImages, validateProduit, ProduitController.update);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Supprimer un produit (soft delete)
 *     tags: [Produits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Produit supprimé
 *       404:
 *         description: Produit non trouvé
 */
router.delete('/:id', ProduitController.delete);

/**
 * @swagger
 * /products/{id}/restore:
 *   post:
 *     summary: Restaurer un produit supprimé
 *     tags: [Produits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Produit restauré
 *       404:
 *         description: Produit non trouvé
 */
router.post('/:id/restore', ProduitController.restore);

/**
 * @swagger
 * /products/{id}/stock:
 *   put:
 *     summary: Mettre à jour le stock d'un produit
 *     tags: [Produits]
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
 *             $ref: '#/components/schemas/StockUpdateInput'
 *     responses:
 *       200:
 *         description: Stock mis à jour avec succès
 *       400:
 *         description: Opération invalide
 *       404:
 *         description: Produit non trouvé
 */
router.put('/:id/stock', ProduitController.updateStock);

module.exports = router;