const fs = require('fs');
const path = require('path');
const { QueryTypes } = require('sequelize');
const { sequelize, ...exported } = require('../models');

const MIGRATIONS_DIR = path.resolve(__dirname, '../../migrations');

/**
 * Déclare à jour une base créée par sync(), pour qu'elle suive ensuite le même
 * processus de migrations que la production. Refuse si une colonne manque.
 */
const run = async () => {
    try {
        const queryInterface = sequelize.getQueryInterface();
        await sequelize.query(
            'CREATE TABLE IF NOT EXISTS `SequelizeMeta` (`name` VARCHAR(255) NOT NULL PRIMARY KEY)',
        );
        const [{ n }] = await sequelize.query('SELECT COUNT(*) AS n FROM `SequelizeMeta`', { type: QueryTypes.SELECT });
        if (Number(n) > 0) {
            console.log('Cette base a déjà un historique de migrations : rien à faire.');
            return;
        }

        const missing = [];
        const models = Object.values(exported).filter((value) => value?.rawAttributes && value?.tableName);
        for (const model of models) {
            const columns = await queryInterface.describeTable(model.tableName);
            for (const attribute of Object.values(model.rawAttributes)) {
                if (!columns[attribute.field]) missing.push(`${model.tableName}.${attribute.field}`);
            }
        }
        if (missing.length) {
            throw new Error(`colonnes manquantes : ${missing.join(', ')}`);
        }

        const names = fs.readdirSync(MIGRATIONS_DIR).filter((name) => name.endsWith('.js')).sort();
        await sequelize.getQueryInterface().bulkInsert('SequelizeMeta', names.map((name) => ({ name })));
        console.log(`${names.length} migrations marquées comme appliquées.`);
    } catch (error) {
        console.error(`Initialisation refusée : ${error.message}`);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

run();
