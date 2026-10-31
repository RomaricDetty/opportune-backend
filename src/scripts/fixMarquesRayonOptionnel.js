const sequelize = require('../config/database');
const migration = require('../../migrations/20261031120000-marques-rayon-optionnel-logo-longtext');

/**
 * Applique le schéma « marque sans rayon + logo LONGTEXT » sur une base créée via sync(),
 * où `db:migrate` rejouerait tout l'historique. Rejouable sans risque.
 */
const run = async () => {
    try {
        await migration.up(sequelize.getQueryInterface());
        console.log('Table marques à jour : rayon optionnel, logo LONGTEXT.');
        process.exitCode = 0;
    } catch (error) {
        console.error('Échec de la mise à jour de la table marques :', error.message);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

run();
