const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

const { syncModels } = require('./models');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimiters');
const seedDatabase = require('./scripts/seedDatabase');

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false,
    }),
);

/**
 * Normalise une origine pour la comparaison CORS.
 * @param {string} origin
 * @returns {string}
 */
function normalizeOrigin(origin) {
    return String(origin || '')
        .trim()
        .replace(/\/$/, '')
        .toLowerCase();
}

// CORS : origines explicites (CORS_ORIGIN), permissif en dev si non défini
const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => normalizeOrigin(s)).filter(Boolean)
    : [];
const allowedOrigins = new Set(corsOrigins);

if (isProd && allowedOrigins.size === 0) {
    console.warn(
        '[CORS] CORS_ORIGIN est vide en production : les requêtes cross-origin seront refusées.',
    );
}

app.use(
    cors({
        origin(origin, callback) {
            // Pas d'Origin = requêtes same-origin / outils serveur
            if (!origin) return callback(null, true);

            const normalized = normalizeOrigin(origin);

            if (allowedOrigins.size > 0) {
                if (allowedOrigins.has(normalized)) return callback(null, true);
                console.warn(`[CORS] Origin refusée: ${origin}`);
                return callback(null, false);
            }

            // Dev sans liste : autoriser
            if (!isProd) return callback(null, true);

            return callback(null, false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/api', apiLimiter);

// Middleware pour logger les requêtes (en développement)
if (!isProd) {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Swagger uniquement hors production
if (!isProd) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'API Opportune - Documentation',
        customfavIcon: '/favicon.ico'
    }));
}

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static('uploads'));

// Routes de l'API
app.use('/api', routes);

// Route racine
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Bienvenue sur l\'API Opportune Backend',
        version: '1.0.0',
        documentation: '/api-docs',
        endpoints: {
            health: '/api/health',
            admins: '/api/admins',
            adminAlias: '/api/admin',
            siteCategories: '/api/site-categories',
            categories: '/api/categories',
            marques: '/api/brands',
            produits: '/api/products',
            clients: '/api/clients',
            wishlist: '/api/wishlist',
            orders: '/api/orders',
            adminBackOffice: {
                products: '/api/admin/products',
                categories: '/api/admin/categories',
                brands: '/api/admin/brands',
                siteCategories: '/api/admin/site-categories',
                orders: '/api/admin/orders',
                clients: '/api/admin/clients',
                demandeDevis: '/api/admin/demande-devis',
                publicites: '/api/admin/publicites'
            }
        }
    });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error('Erreur:', err);
    res.status(err.status || 500).json({
        success: false,
        message: isProd ? 'Erreur interne du serveur' : (err.message || 'Erreur interne du serveur'),
        ...(!isProd && { stack: err.stack })
    });
});

// Initialiser le serveur
const startServer = async () => {
    try {
        // Synchroniser les modèles avec la base de données
        // En production, utilisez les migrations au lieu de sync()
        await syncModels(false);

        // Exécuter le seeding de la base de données
        // console.log('Exécution du seeding de la base de données...');
        // await seedDatabase();

        // Démarrer le serveur
        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║  Serveur démarré avec succès !                        ║
║                                                       ║
║  Port: ${PORT}                                        ║
║  URL: http://localhost:${PORT}                        ║
║  API: http://localhost:${PORT}/api                    ║
║  Documentation Swagger: http://localhost:${PORT}/api-docs║
║  Environment: ${process.env.NODE_ENV || 'development'}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('Erreur lors du démarrage du serveur:', error);
        process.exit(1);
    }
};

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
    console.log('SIGTERM reçu, arrêt du serveur...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT reçu, arrêt du serveur...');
    process.exit(0);
});

// Démarrer le serveur
startServer();

module.exports = app;