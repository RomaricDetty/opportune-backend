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
const clientRoutes = require('./clientRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const orderRoutes = require('./orderRoutes');
const adminOrderRoutes = require('./adminOrderRoutes');
const adminClientRoutes = require('./adminClientRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const contactRoutes = require('./contactRoutes');
const SettingsController = require('../controllers/settingsController');
const { upload } = require('../middleware/upload');

const uploadLogo = upload.single('logo');

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
router.use('/admin/orders', adminOrderRoutes);
router.use('/admin/clients', adminClientRoutes);
router.use('/admin/dashboard', dashboardRoutes);
router.use('/admin/demande-devis', demandeDevisRoutes);
router.use('/admin/publicites', authenticate, publiciteRoutes);
router.use('/admin/contact', contactRoutes);
router.get('/admin/settings', authenticate, SettingsController.getAdmin);
router.put(
    '/admin/settings',
    authenticate,
    (req, res, next) => {
        uploadLogo(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Erreur upload logo',
                });
            }
            return next();
        });
    },
    SettingsController.update,
);
// Alias /admin (singulier) : login, CRUD admins — après les préfixes ci-dessus
router.use('/admin', adminRoutes);

// Routes publiques / client
router.get('/settings', SettingsController.getPublic);
router.use('/site-categories', siteCategoryRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', marqueRoutes);
router.use('/products', produitRoutes);
router.use('/clients', clientRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/demande-devis', demandeDevisRoutes);
router.use('/publicites', publiciteRoutes);
router.use('/contact', contactRoutes);
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