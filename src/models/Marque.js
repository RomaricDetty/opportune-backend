const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const SiteCategory = require('./SiteCategory');

/**
 * Modèle Marque
 * Représente les marques de produits
 */
const Marque = sequelize.define('Marque', {
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
    logo: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    idSiteCategory: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: SiteCategory,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    }
}, {
    tableName: 'marques',
    timestamps: true,
    paranoid: true,
    indexes: [
        {
            fields: ['idSiteCategory']
        },
        {
            unique: true,
            fields: ['libelle', 'idSiteCategory']
        }
    ]
});

// Relations
/**
 * Marque belongs to SiteCategory
 */
Marque.belongsTo(SiteCategory, {
    foreignKey: 'idSiteCategory',
    as: 'siteCategory'
});

/**
 * SiteCategory has many Marques
 */
SiteCategory.hasMany(Marque, {
    foreignKey: 'idSiteCategory',
    as: 'marques'
});

module.exports = Marque;