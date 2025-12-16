const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admins
 *   description: Gestion des administrateurs et authentification
 */

/**
 * @swagger
 * /admins/login:
 *   post:
 *     summary: Authentifier un administrateur
 *     tags: [Admins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login
 *               - password
 *             properties:
 *               login:
 *                 type: string
 *                 example: opporune_yao
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 1ts@fuckingPwd!
 *     responses:
 *       200:
 *         description: Authentification réussie
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
 *                         token:
 *                           type: string
 *                           description: Token JWT pour l'authentification
 *                         admin:
 *                           $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Identifiants invalides
 *       403:
 *         description: Compte désactivé
 */
router.post('/login', AdminController.login);

/**
 * @swagger
 * /admins:
 *   post:
 *     summary: Créer un nouvel administrateur
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login
 *               - password
 *             properties:
 *               login:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: new_admin
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: Secure@123
 *               nom:
 *                 type: string
 *                 example: Dupont
 *               prenom:
 *                 type: string
 *                 example: Jean
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jean.dupont@example.com
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Administrateur créé avec succès
 *       400:
 *         description: Erreur de validation
 *       409:
 *         description: Login déjà existant
 */
router.post('/', authenticate, AdminController.create);

/**
 * @swagger
 * /admins:
 *   get:
 *     summary: Récupérer tous les administrateurs
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *     responses:
 *       200:
 *         description: Liste des administrateurs
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
 *                         $ref: '#/components/schemas/Admin'
 */
router.get('/', authenticate, AdminController.getAll);

/**
 * @swagger
 * /admins/{id}:
 *   get:
 *     summary: Récupérer un administrateur par ID
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Administrateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Admin'
 *       404:
 *         description: Administrateur non trouvé
 */
router.get('/:id', authenticate, AdminController.getById);

/**
 * @swagger
 * /admins/{id}:
 *   put:
 *     summary: Mettre à jour un administrateur
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               login:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Administrateur mis à jour
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Administrateur non trouvé
 *       409:
 *         description: Login déjà existant
 */
router.put('/:id', authenticate, AdminController.update);

module.exports = router;
