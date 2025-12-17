const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle SiteCategory
 * Représente les grandes catégories du site : Electromenagers, Telephones, Mobiliers, Accessoires
 */
const SiteCategory = sequelize.define('SiteCategory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    libelle: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Le libellé ne peut pas être vide'
            },
            len: {
                args: [2, 100],
                msg: 'Le libellé doit contenir entre 2 et 100 caractères'
            }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    }
}, {
    tableName: 'site_categories',
    timestamps: true,
    paranoid: true, // Pour la suppression soft delete (deletedAt)
    indexes: [
        {
            unique: true,
            fields: ['libelle']
        }
    ]
});

module.exports = SiteCategory;