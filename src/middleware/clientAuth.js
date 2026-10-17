const jwt = require('jsonwebtoken');
const { Client } = require('../models');
const { getJwtSecret } = require('../config/jwt');

/**
 * Middleware d'authentification client (Bearer JWT).
 * Attache `req.client` si le token est valide.
 */
const authenticateClient = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification manquant.'
            });
        }

        const parts = authHeader.split(/\s+/);
        if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
            return res.status(401).json({
                success: false,
                message: 'Format de token invalide.'
            });
        }

        const token = parts[1].trim();
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token manquant.'
            });
        }

        const decoded = jwt.verify(token, getJwtSecret());

        if (decoded.role !== 'client') {
            return res.status(401).json({
                success: false,
                message: 'Token non valide pour un client'
            });
        }

        const client = await Client.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!client) {
            return res.status(401).json({
                success: false,
                message: 'Client non trouvé'
            });
        }

        if (!client.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Compte client désactivé'
            });
        }

        req.client = client;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expiré'
            });
        }
        console.error('Erreur auth client:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'authentification'
        });
    }
};

module.exports = authenticateClient;
