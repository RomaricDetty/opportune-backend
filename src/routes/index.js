const express = require('express');
const router = express.Router();

// Importer toutes les routes
const siteCategoryRoutes = require('./siteCategoryRoutes');
const categoryRoutes = require('./categoryRoutes');
const marqueRoutes = require('./marqueRoutes');
const produitRoutes = require('./produitRoutes');
const adminRoutes = require('./adminRoutes');

/**
 * Configuration centrale de toutes les routes de l'API
 * Préfixe général : /api
 */

// Routes pour les administrateurs
router.use('/admins', adminRoutes);
// Routes pour les catégories principales
router.use('/site-categories', siteCategoryRoutes);
// Routes pour les catégories
router.use('/categories', categoryRoutes);
// Routes pour les marques
router.use('/brands', marqueRoutes);
// Routes pour les produits
router.use('/products', produitRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Vérifier l'état de santé de l'API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API fonctionnelle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: API Opportune Backend fonctionnelle
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
// Route de test
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API Opportune Backend fonctionnelle',
        timestamp: new Date().toISOString()
    });
});

// Route par défaut (404) - doit être la dernière route
router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée',
        path: req.originalUrl
    });
});

module.exports = router;