'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('categories', 'isSiteCategory');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('categories', 'isSiteCategory', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },
};
