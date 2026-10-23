const { SiteSetting } = require('../models');
const ImageHandler = require('../utils/imageHandler');
const { pickSocialUpdates, toPublicSocials } = require('../constants/socialNetworks');

/**
 * Récupère (ou crée) la ligne unique de paramètres.
 * @returns {Promise<import('sequelize').Model>}
 */
async function getOrCreateSettings() {
    let settings = await SiteSetting.findOne({ order: [['createdAt', 'ASC']] });
    if (!settings) {
        settings = await SiteSetting.create({
            siteName: 'Electro Store',
            logo: null,
        });
    }
    return settings;
}

/**
 * Contrôleur des paramètres du site (logo, etc.).
 */
class SettingsController {
    /**
     * Paramètres publics (boutique).
     * GET /api/settings
     */
    static async getPublic(req, res) {
        try {
            const settings = await getOrCreateSettings();
            return res.status(200).json({
                success: true,
                data: {
                    siteName: settings.siteName,
                    logo: settings.logo || null,
                    socials: toPublicSocials(settings),
                },
            });
        } catch (error) {
            console.error('Erreur getPublic settings:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des paramètres',
            });
        }
    }

    /**
     * Paramètres pour le back-office.
     * GET /api/admin/settings
     */
    static async getAdmin(req, res) {
        try {
            const settings = await getOrCreateSettings();
            return res.status(200).json({
                success: true,
                data: settings,
            });
        } catch (error) {
            console.error('Erreur getAdmin settings:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des paramètres',
            });
        }
    }

    /**
     * Met à jour le logo (et éventuellement le nom du site).
     * PUT /api/admin/settings
     */
    static async update(req, res) {
        try {
            const settings = await getOrCreateSettings();
            const updates = {};

            if (req.body.siteName !== undefined) {
                const name = String(req.body.siteName || '').trim();
                if (name) updates.siteName = name.slice(0, 120);
            }

            if (req.file) {
                updates.logo = ImageHandler.processMainImage(req.file.buffer, req.file.mimetype);
            } else if (req.body.removeLogo === 'true' || req.body.removeLogo === true) {
                updates.logo = null;
            }

            const { updates: socialUpdates, errors: socialErrors } = pickSocialUpdates(req.body);
            if (socialErrors.length) {
                return res.status(400).json({
                    success: false,
                    message: socialErrors[0],
                });
            }
            Object.assign(updates, socialUpdates);

            await settings.update(updates);

            return res.status(200).json({
                success: true,
                message: 'Paramètres mis à jour',
                data: settings,
            });
        } catch (error) {
            console.error('Erreur update settings:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de la mise à jour des paramètres',
            });
        }
    }
}

module.exports = SettingsController;
