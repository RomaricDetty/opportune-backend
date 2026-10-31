'use strict';

/**
 * Rôles admin (les comptes existants gardent tous les droits),
 * historique des actions et accroche modifiable du site. Rejouable.
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const admins = await queryInterface.describeTable('admins');
    if (!admins.role) {
      await queryInterface.addColumn('admins', 'role', {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'admin',
      });
    }

    const settings = await queryInterface.describeTable('site_settings');
    if (!settings.tagline) {
      await queryInterface.addColumn('site_settings', 'tagline', {
        type: Sequelize.STRING(160),
        allowNull: true,
      });
    }

    const tables = (await queryInterface.showAllTables()).map(String);
    if (!tables.includes('admin_logs')) {
      await queryInterface.createTable('admin_logs', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
        idAdmin: { type: Sequelize.UUID, allowNull: true },
        adminLogin: { type: Sequelize.STRING(100), allowNull: false },
        method: { type: Sequelize.STRING(10), allowNull: false },
        path: { type: Sequelize.STRING(255), allowNull: false },
        label: { type: Sequelize.STRING(200), allowNull: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
      });
      await queryInterface.addIndex('admin_logs', ['createdAt']);
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('admin_logs');
    await queryInterface.removeColumn('site_settings', 'tagline');
    await queryInterface.removeColumn('admins', 'role');
  },
};
