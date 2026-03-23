'use strict';

/** @type {import('sequelize-cli').Migration} */
  module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    // Ajouter une colonne
    await queryInterface.addColumn('produits', 'remise', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Modifier la colonne prix en INTEGER
    await queryInterface.changeColumn('produits', 'prix', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    // Supprimer la colonne remise
    await queryInterface.removeColumn('produits', 'remise');

    // Revenir à l'ancien type (exemple FLOAT)
    await queryInterface.changeColumn('produits', 'prix', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
  }
};
