const { Admin } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

/**
 * Controller pour la gestion des administrateurs
 */
class AdminController {
    /**
     * Authentification d'un administrateur
     * POST /api/admins/login
     */
    static async login(req, res) {
        try {
            const { login, password } = req.body;

            // Validation des données
            if (!login || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Le login et le mot de passe sont requis'
                });
            }

            // Rechercher l'admin par login
            const admin = await Admin.findOne({
                where: { login }
            });

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Identifiants invalides'
                });
            }

            // Vérifier que le compte est actif
            if (!admin.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Compte administrateur désactivé'
                });
            }

            // Vérifier le mot de passe
            const isPasswordValid = await admin.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Identifiants invalides'
                });
            }

            // Mettre à jour la date de dernière connexion
            admin.lastLogin = new Date();
            await admin.save();

            // Générer le token JWT
            const JWT_SECRET = process.env.JWT_SECRET || '1ts@opportune-$ecret-k3y_f4r==projEct-ch@nge-in-p@';
            const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
            
            const token = jwt.sign(
                { 
                    id: admin.id,
                    login: admin.login
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            return res.status(200).json({
                success: true,
                message: 'Authentification réussie',
                data: {
                    token,
                    admin: {
                        id: admin.id,
                        login: admin.login,
                        nom: admin.nom,
                        prenom: admin.prenom,
                        email: admin.email,
                        isActive: admin.isActive,
                        lastLogin: admin.lastLogin
                    }
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'authentification:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'authentification'
            });
        }
    }

    /**
     * Créer un nouvel administrateur
     * POST /api/admins
     */
    static async create(req, res) {
        try {
            const { login, password, nom, prenom, email, isActive } = req.body;

            // Validation des données requises
            if (!login || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Le login et le mot de passe sont requis'
                });
            }

            // Vérifier si le login existe déjà
            const existingAdmin = await Admin.findOne({
                where: { login }
            });

            if (existingAdmin) {
                return res.status(409).json({
                    success: false,
                    message: 'Un administrateur avec ce login existe déjà'
                });
            }

            // Créer l'administrateur
            const admin = await Admin.create({
                login,
                password,
                nom: nom || null,
                prenom: prenom || null,
                email: email || null,
                isActive: isActive !== undefined ? isActive : true
            });

            return res.status(201).json({
                success: true,
                message: 'Administrateur créé avec succès',
                data: admin
            });
        } catch (error) {
            console.error('Erreur lors de la création de l\'administrateur:', error);
            
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Erreur de validation',
                    errors: error.errors.map(err => err.message)
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de l\'administrateur'
            });
        }
    }

    /**
     * Récupérer tous les administrateurs
     * GET /api/admins
     */
    static async getAll(req, res) {
        try {
            const { isActive } = req.query;
            const where = {};

            if (isActive !== undefined) {
                where.isActive = isActive === 'true';
            }

            const admins = await Admin.findAll({
                where,
                attributes: { exclude: ['password'] },
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                data: admins
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des administrateurs:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des administrateurs'
            });
        }
    }

    /**
     * Récupérer un administrateur par ID
     * GET /api/admins/:id
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;

            const admin = await Admin.findByPk(id, {
                attributes: { exclude: ['password'] }
            });

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Administrateur non trouvé'
                });
            }

            return res.status(200).json({
                success: true,
                data: admin
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'administrateur:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération de l\'administrateur'
            });
        }
    }

    /**
     * Mettre à jour un administrateur
     * PUT /api/admins/:id
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { login, password, nom, prenom, email, isActive } = req.body;

            const admin = await Admin.findByPk(id);

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Administrateur non trouvé'
                });
            }

            // Vérifier si le login est modifié et s'il existe déjà
            if (login && login !== admin.login) {
                const existingAdmin = await Admin.findOne({
                    where: { 
                        login,
                        id: { [Op.ne]: id }
                    }
                });

                if (existingAdmin) {
                    return res.status(409).json({
                        success: false,
                        message: 'Un administrateur avec ce login existe déjà'
                    });
                }
                admin.login = login;
            }

            // Mettre à jour les autres champs
            if (password) admin.password = password;
            if (nom !== undefined) admin.nom = nom;
            if (prenom !== undefined) admin.prenom = prenom;
            if (email !== undefined) admin.email = email;
            if (isActive !== undefined) admin.isActive = isActive;

            await admin.save();

            return res.status(200).json({
                success: true,
                message: 'Administrateur mis à jour avec succès',
                data: {
                    id: admin.id,
                    login: admin.login,
                    nom: admin.nom,
                    prenom: admin.prenom,
                    email: admin.email,
                    isActive: admin.isActive,
                    lastLogin: admin.lastLogin,
                    updatedAt: admin.updatedAt
                }
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'administrateur:', error);
            
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Erreur de validation',
                    errors: error.errors.map(err => err.message)
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de l\'administrateur'
            });
        }
    }
}

module.exports = AdminController;
