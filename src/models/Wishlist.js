const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Wishlist
 * Favoris d'un client sur un produit
 */
const Wishlist = sequelize.define('Wishlist', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    idClient: {
        type: DataTypes.UUID,
        allowNull: false
    },
    idProduit: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    tableName: 'wishlists',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['idClient', 'idProduit'] },
        { fields: ['idClient'] },
        { fields: ['idProduit'] }
    ]
});

module.exports = Wishlist;
