const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Order
 * Commande client (prix en XOF / FCFA)
 */
const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    reference: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true
    },
    idClient: {
        type: DataTypes.UUID,
        allowNull: false
    },
    statut: {
        type: DataTypes.ENUM(
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled'
        ),
        allowNull: false,
        defaultValue: 'pending'
    },
    montantTotal: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Montant total en XOF (FCFA)'
    },
    devise: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'XOF'
    },
    modePaiement: {
        type: DataTypes.ENUM('cash_on_delivery', 'mobile_money', 'bank_transfer'),
        allowNull: false,
        defaultValue: 'cash_on_delivery'
    },
    statutPaiement: {
        type: DataTypes.ENUM('unpaid', 'paid', 'refunded'),
        allowNull: false,
        defaultValue: 'unpaid'
    },
    adresseLivraison: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    villeLivraison: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    telephoneLivraison: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'orders',
    timestamps: true,
    paranoid: true,
    indexes: [
        { unique: true, fields: ['reference'] },
        { fields: ['idClient'] },
        { fields: ['statut'] },
        { fields: ['statutPaiement'] }
    ],
    hooks: {
        beforeValidate: (order) => {
            if (!order.reference) {
                const stamp = Date.now().toString(36).toUpperCase();
                const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
                order.reference = `CMD-${stamp}-${rand}`;
            }
        }
    }
});

module.exports = Order;
