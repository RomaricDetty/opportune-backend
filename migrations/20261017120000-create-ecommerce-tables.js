'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('clients', {
            id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
            email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
            password: { type: Sequelize.STRING(255), allowNull: false },
            nom: { type: Sequelize.STRING(100), allowNull: false },
            prenom: { type: Sequelize.STRING(100), allowNull: false },
            telephone: { type: Sequelize.STRING(30), allowNull: false },
            adresse: { type: Sequelize.STRING(255), allowNull: true },
            ville: { type: Sequelize.STRING(100), allowNull: true },
            isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
            lastLogin: { type: Sequelize.DATE, allowNull: true },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
            deletedAt: { type: Sequelize.DATE, allowNull: true }
        });

        await queryInterface.createTable('wishlists', {
            id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
            idClient: { type: Sequelize.UUID, allowNull: false },
            idProduit: { type: Sequelize.UUID, allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false }
        });

        const wishlistUniqueIndex = 'wishlists_id_client_id_produit';
        try {
            const indexes = await queryInterface.showIndex('wishlists');
            const alreadyExists = indexes.some((idx) => idx.name === wishlistUniqueIndex);
            if (!alreadyExists) {
                await queryInterface.addIndex('wishlists', ['idClient', 'idProduit'], {
                    unique: true,
                    name: wishlistUniqueIndex
                });
            }
        } catch (error) {
            const code = error?.original?.code || error?.parent?.code;
            if (code !== 'ER_DUP_KEYNAME' && !String(error.message || '').includes('Duplicate key')) {
                throw error;
            }
        }

        await queryInterface.createTable('orders', {
            id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
            reference: { type: Sequelize.STRING(40), allowNull: false, unique: true },
            idClient: { type: Sequelize.UUID, allowNull: false },
            statut: {
                type: Sequelize.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
                allowNull: false,
                defaultValue: 'pending'
            },
            montantTotal: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            devise: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'XOF' },
            modePaiement: {
                type: Sequelize.ENUM('cash_on_delivery', 'mobile_money', 'bank_transfer'),
                allowNull: false,
                defaultValue: 'cash_on_delivery'
            },
            statutPaiement: {
                type: Sequelize.ENUM('unpaid', 'paid', 'refunded'),
                allowNull: false,
                defaultValue: 'unpaid'
            },
            adresseLivraison: { type: Sequelize.STRING(255), allowNull: false },
            villeLivraison: { type: Sequelize.STRING(100), allowNull: false },
            telephoneLivraison: { type: Sequelize.STRING(30), allowNull: false },
            notes: { type: Sequelize.TEXT, allowNull: true },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
            deletedAt: { type: Sequelize.DATE, allowNull: true }
        });

        await queryInterface.createTable('order_items', {
            id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
            idOrder: { type: Sequelize.UUID, allowNull: false },
            idProduit: { type: Sequelize.UUID, allowNull: false },
            libelle: { type: Sequelize.STRING(200), allowNull: false },
            prixUnitaire: { type: Sequelize.INTEGER, allowNull: false },
            quantite: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            sousTotal: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false }
        });

        try {
            await queryInterface.addColumn('produits', 'devise', {
                type: Sequelize.STRING(3),
                allowNull: false,
                defaultValue: 'XOF'
            });
        } catch (_) {
            // colonne déjà présente
        }
    },

    async down(queryInterface) {
        await queryInterface.dropTable('order_items');
        await queryInterface.dropTable('orders');
        await queryInterface.dropTable('wishlists');
        await queryInterface.dropTable('clients');
        try {
            await queryInterface.removeColumn('produits', 'devise');
        } catch (_) {
            // no-op
        }
    }
};
