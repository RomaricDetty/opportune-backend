const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
// Importer toutes les routes
const siteCategoryRoutes = require('./siteCategoryRoutes');
const categoryRoutes = require('./categoryRoutes');
const marqueRoutes = require('./marqueRoutes');
const produitRoutes = require('./produitRoutes');
const adminRoutes = require('./adminRoutes');
const demandeDevisRoutes = require('./demandeDevisRoutes');
const publiciteRoutes = require('./publiciteRoutes');
/**
 * Configuration centrale de toutes les routes de l'API
 * Préfixe général : /api
 */

// Routes pour les administrateurs
router.use('/admins', adminRoutes);

// Back-office : chemins /admin/* AVANT /admin (sinon « products » est pris pour :id)
router.use('/admin/products', authenticate, produitRoutes);
router.use('/admin/categories', authenticate, categoryRoutes);
router.use('/admin/brands', authenticate, marqueRoutes);
router.use('/admin/site-categories', authenticate, siteCategoryRoutes);
router.use('/admin/demande-devis', demandeDevisRoutes);
router.use('/admin/publicites', authenticate, publiciteRoutes);
// Alias /admin (singulier) : login, CRUD admins — après les préfixes ci-dessus
router.use('/admin', adminRoutes);

// Routes pour les catégories principales
router.use('/site-categories', siteCategoryRoutes);
// Routes pour les catégories
router.use('/categories', categoryRoutes);
// Routes pour les marques
router.use('/brands', marqueRoutes);
// Routes pour les produits
router.use('/products', produitRoutes);

// Routes pour les demandes de devis
router.use('/demande-devis', demandeDevisRoutes);

// Routes pour les publicites
router.use('/publicites', publiciteRoutes);
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