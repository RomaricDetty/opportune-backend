const { execFileSync } = require('child_process');
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const { backup } = require('./backupDb');

/**
 * Processus unique de mise à jour en production : sauvegarde puis migrations.
 * S'arrête si la base existe sans historique, car les migrations seraient toutes rejouées.
 */
const run = async () => {
    try {
        const tables = (await sequelize.getQueryInterface().showAllTables()).map(String);
        const hasMeta = tables.includes('SequelizeMeta');
        const applied = hasMeta
            ? (await sequelize.query('SELECT COUNT(*) AS n FROM `SequelizeMeta`', { type: QueryTypes.SELECT }))[0].n
            : 0;
        if (tables.includes('produits') && Number(applied) === 0) {
            throw new Error(
                "Cette base a des tables mais aucun historique de migrations (créée par sync()). "
                + 'Lancez d\'abord npm run db:baseline.',
            );
        }
        if (tables.length > 0) console.log(`Sauvegarde créée : ${await backup()}`);
        execFileSync('npx', ['sequelize-cli', 'db:migrate'], { stdio: 'inherit' });
        console.log('Base à jour.');
    } catch (error) {
        console.error(`Mise à jour interrompue : ${error.message}`);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

run();
