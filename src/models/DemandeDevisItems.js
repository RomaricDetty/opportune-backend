// models/DemandeDevisItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DemandeDevisItem = sequelize.define('DemandeDevisItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    idDemandeDevis: {
        type: DataTypes.UUID,
        allowNull: false
    },
    idProduit: {
        type: DataTypes.UUID,
        allowNull: false
    },
    quantite: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: { args: [1], msg: 'La quantité doit être supérieure à 0' }
        }
    },
    prixUnitaire: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    tableName: 'demande_devis_items',
    timestamps: true,
    paranoid: false
});

module.exports = DemandeDevisItem;