'use strict';

const COLUMNS = [
    'facebookUrl',
    'instagramUrl',
    'tiktokUrl',
    'youtubeUrl',
    'twitterUrl',
    'linkedinUrl',
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    /**
     * Ajoute les colonnes d'URL des réseaux sociaux.
     */
    async up(queryInterface, Sequelize) {
        for (const column of COLUMNS) {
            try {
                await queryInterface.addColumn('site_settings', column, {
                    type: Sequelize.STRING(500),
                    allowNull: true,
                });
            } catch (_) {
                // colonne déjà présente
            }
        }
    },

    /**
     * Retire les colonnes d'URL des réseaux sociaux.
     */
    async down(queryInterface) {
        for (const column of COLUMNS) {
            try {
                await queryInterface.removeColumn('site_settings', column);
            } catch (_) {
                // colonne déjà absente
            }
        }
    },
};
