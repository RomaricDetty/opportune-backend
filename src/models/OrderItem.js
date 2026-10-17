const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle OrderItem
 * Ligne de commande (prix unitaire figé en XOF)
 */
const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    idOrder: {
        type: DataTypes.UUID,
        allowNull: false
    },
    idProduit: {
        type: DataTypes.UUID,
        allowNull: false
    },
    libelle: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    prixUnitaire: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Prix unitaire en XOF (FCFA) au moment de la commande'
    },
    quantite: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        }
    },
    sousTotal: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'order_items',
    timestamps: true,
    indexes: [
        { fields: ['idOrder'] },
        { fields: ['idProduit'] }
    ]
});

module.exports = OrderItem;
