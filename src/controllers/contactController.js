const { Op } = require('sequelize')
const { ContactMessage } = require('../models')

/**
 * Contrôleur des messages de contact (site + back-office).
 */
class ContactController {
    /**
     * Enregistre un message depuis le formulaire public.
     * POST /api/contact
     */
    static async create(req, res) {
        try {
            const nom = String(req.body.nom || '').trim()
            const email = String(req.body.email || '').trim()
            const telephone = String(req.body.telephone || '').trim()
            const message = String(req.body.message || '').trim()

            if (!nom || !email || !telephone || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Nom, email, téléphone et message sont obligatoires',
                })
            }

            const created = await ContactMessage.create({
                nom,
                email,
                telephone,
                message,
            })

            return res.status(201).json({
                success: true,
                message: 'Message enregistré avec succès',
                data: created,
            })
        } catch (error) {
            console.error('Erreur création ContactMessage:', error)
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    success: false,
                    message: error.errors?.[0]?.message || 'Données invalides',
                })
            }
            return res.status(500).json({
                success: false,
                message: "Erreur lors de l'enregistrement du message",
            })
        }
    }

    /**
     * Liste les messages (admin).
     * GET /api/admin/contact
     */
    static async getAll(req, res) {
        try {
            const { statut, search } = req.query
            const where = {}

            if (statut) where.statut = statut
            if (search) {
                where[Op.or] = [
                    { nom: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { telephone: { [Op.like]: `%${search}%` } },
                ]
            }

            const rows = await ContactMessage.findAll({
                where,
                order: [['createdAt', 'DESC']],
            })

            return res.status(200).json({ success: true, data: rows })
        } catch (error) {
            console.error('Erreur liste ContactMessage:', error)
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des messages',
            })
        }
    }

    /**
     * Met à jour le statut d’un message (admin).
     * PATCH /api/admin/contact/:id/statut
     */
    static async updateStatut(req, res) {
        try {
            const { statut } = req.body
            const allowed = ['nouveau', 'lu', 'traite']
            if (!allowed.includes(statut)) {
                return res.status(400).json({
                    success: false,
                    message: 'Statut invalide',
                })
            }

            const row = await ContactMessage.findByPk(req.params.id)
            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: 'Message introuvable',
                })
            }

            await row.update({ statut })
            return res.status(200).json({
                success: true,
                message: 'Statut mis à jour',
                data: row,
            })
        } catch (error) {
            console.error('Erreur update statut ContactMessage:', error)
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour',
            })
        }
    }
}

module.exports = ContactController
