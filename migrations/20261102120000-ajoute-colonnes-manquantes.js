'use strict';

/**
 * Plusieurs tables n'ont jamais eu de migration : leurs nouvelles colonnes
 * (ex. publicites.emplacement) n'existaient que grâce à sync({ alter }).
 * Ajoute chaque colonne des modèles absente de la base, sans rien supprimer ni modifier.
 * Rejouable.
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface) {
    const { sequelize, ...exported } = require('../src/models');
    const models = Object.values(exported).filter((value) => value?.rawAttributes && value?.tableName);
    const tables = (await queryInterface.showAllTables()).map(String);

    for (const model of models) {
      if (!tables.includes(model.tableName)) {
        await model.sync();
        console.log(`Table créée : ${model.tableName}`);
        continue;
      }
      const columns = await queryInterface.describeTable(model.tableName);
      for (const attribute of Object.values(model.rawAttributes)) {
        if (columns[attribute.field]) continue;
        // Une colonne obligatoire sans valeur par défaut casserait les lignes existantes.
        const allowNull = attribute.allowNull !== false || attribute.defaultValue === undefined;
        await queryInterface.addColumn(model.tableName, attribute.field, {
          type: attribute.type,
          allowNull,
          ...(attribute.defaultValue !== undefined && typeof attribute.defaultValue !== 'object'
            ? { defaultValue: attribute.defaultValue }
            : {}),
        });
        console.log(`Colonne ajoutée : ${model.tableName}.${attribute.field}`);
      }
    }
  },

  async down() {
    // Rien à défaire : ces colonnes sont attendues par le code.
  },
};
