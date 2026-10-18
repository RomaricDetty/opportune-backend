'use strict';

/**
 * Indique si une colonne existe sur une table.
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {string} table
 * @param {string} column
 * @returns {Promise<boolean>}
 */
async function columnExists(queryInterface, table, column) {
  const description = await queryInterface.describeTable(table);
  return Boolean(description[column]);
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await columnExists(queryInterface, 'categories', 'isSiteCategory'))) {
      await queryInterface.addColumn('categories', 'isSiteCategory', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    if (await columnExists(queryInterface, 'categories', 'isSiteCategory')) {
      await queryInterface.removeColumn('categories', 'isSiteCategory');
    }
  },
};
