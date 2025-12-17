const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const SiteCategory = require('./SiteCategory');

/**
 * Modèle Category
 * Sous-catégories pour les catégories principales (ex: Electromenagers, Telephones, Mobiliers, Accessoires)
 */
const Category = sequelize.define('Category', {
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
    tableName: 'categories',
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
 * Category belongs to SiteCategory
 */
Category.belongsTo(SiteCategory, {
    foreignKey: 'idSiteCategory',
    as: 'siteCategory'
});

/**
 * SiteCategory has many Categories
 */
SiteCategory.hasMany(Category, {
    foreignKey: 'idSiteCategory',
    as: 'categories'
});

module.exports = Category;