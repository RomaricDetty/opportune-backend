'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Crée les tables demande_devis et demande_devis_items.
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('demande_devis', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      nomClient: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      prenomClient: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      telephone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      adresse: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      statut: {
        type: Sequelize.ENUM('en_attente', 'en_cours', 'validee', 'annulee'),
        allowNull: false,
        defaultValue: 'en_attente'
      },
      montantTotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
      },
      reference: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.createTable('demande_devis_items', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      idDemandeDevis: {
        type: Sequelize.UUID,
        allowNull: false
      },
      idProduit: {
        type: Sequelize.UUID,
        allowNull: false
      },
      quantite: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      prixUnitaire: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  /**
   * Supprime les tables demande_devis_items puis demande_devis.
   */
  async down(queryInterface) {
    await queryInterface.dropTable('demande_devis_items');
    await queryInterface.dropTable('demande_devis');
  }
};
