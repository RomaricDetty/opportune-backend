const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Client } = require('../models');
const { getJwtSecret, getJwtExpiresIn } = require('../config/jwt');

/**
 * Génère un JWT pour un client.
 * @param {import('../models/Client')} client
 * @returns {string}
 */
function signClientToken(client) {
    const expiresIn = process.env.JWT_CLIENT_EXPIRES_IN || getJwtExpiresIn() || '7d';
    return jwt.sign(
        { id: client.id, email: client.email, role: 'client' },
        getJwtSecret(),
        { expiresIn }
    );
}

/**
 * Controller compte client
 */
class ClientController {
    /**
     * Inscription client
     * POST /api/clients/register
     */
    static async register(req, res) {
        try {
            const { email, password, nom, prenom, telephone, adresse, ville } = req.body;

            if (!email || !password || !nom || !prenom || !telephone) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, mot de passe, nom, prénom et téléphone sont requis'
                });
            }

            const existing = await Client.findOne({ where: { email } });
            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: 'Un compte existe déjà avec cet email'
                });
            }

            const client = await Client.create({
                email,
                password,
                nom,
                prenom,
                telephone,
                adresse: adresse || null,
                ville: ville || null
            });

            const token = signClientToken(client);

            return res.status(201).json({
                success: true,
                message: 'Compte créé avec succès',
                data: { token, client }
            });
        } catch (error) {
            console.error('Erreur register client:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de l\'inscription'
            });
        }
    }

    /**
     * Connexion client
     * POST /api/clients/login
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email et mot de passe requis'
                });
            }

            const client = await Client.findOne({ where: { email } });
            if (!client || !(await client.comparePassword(password))) {
                return res.status(401).json({
                    success: false,
                    message: 'Identifiants invalides'
                });
            }

            if (!client.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Compte désactivé'
                });
            }

            client.lastLogin = new Date();
            await client.save();

            const token = signClientToken(client);

            return res.status(200).json({
                success: true,
                message: 'Connexion réussie',
                data: { token, client }
            });
        } catch (error) {
            console.error('Erreur login client:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la connexion'
            });
        }
    }

    /**
     * Profil du client connecté
     * GET /api/clients/me
     */
    static async me(req, res) {
        return res.status(200).json({
            success: true,
            data: req.client
        });
    }

    /**
     * Mise à jour du profil
     * PUT /api/clients/me
     */
    static async updateProfile(req, res) {
        try {
            const { nom, prenom, telephone, adresse, ville, password } = req.body;
            const client = await Client.findByPk(req.client.id);

            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Client non trouvé'
                });
            }

            if (nom !== undefined) client.nom = nom;
            if (prenom !== undefined) client.prenom = prenom;
            if (telephone !== undefined) client.telephone = telephone;
            if (adresse !== undefined) client.adresse = adresse;
            if (ville !== undefined) client.ville = ville;
            if (password) client.password = password;

            await client.save();

            return res.status(200).json({
                success: true,
                message: 'Profil mis à jour',
                data: client
            });
        } catch (error) {
            console.error('Erreur update profil:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour'
            });
        }
    }

    /**
     * Liste clients (admin)
     * GET /api/admin/clients
     */
    static async getAll(req, res) {
        try {
            const { search, isActive } = req.query;
            const where = {};

            if (isActive !== undefined) where.isActive = isActive === 'true';
            if (search) {
                where[Op.or] = [
                    { nom: { [Op.like]: `%${search}%` } },
                    { prenom: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { telephone: { [Op.like]: `%${search}%` } }
                ];
            }

            const clients = await Client.findAll({
                where,
                attributes: { exclude: ['password'] },
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({ success: true, data: clients });
        } catch (error) {
            console.error('Erreur liste clients:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des clients'
            });
        }
    }

    /**
     * Active / désactive un client (admin)
     * PUT /api/admin/clients/:id/status
     */
    static async updateStatus(req, res) {
        try {
            const client = await Client.findByPk(req.params.id);
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Client non trouvé'
                });
            }

            if (typeof req.body.isActive !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'isActive (boolean) est requis'
                });
            }

            client.isActive = req.body.isActive;
            await client.save();

            return res.status(200).json({
                success: true,
                message: 'Statut mis à jour',
                data: client
            });
        } catch (error) {
            console.error('Erreur statut client:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du statut'
            });
        }
    }
}

module.exports = ClientController;
