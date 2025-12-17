const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Marque = require('./Marque');
const Category = require('./Category');

/**
 * Modèle Produit
 * Représente les produits disponibles à la vente
 */
const Produit = sequelize.define('Produit', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    libelle: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Le libellé ne peut pas être vide'
            },
            len: {
                args: [2, 200],
                msg: 'Le libellé doit contenir entre 2 et 200 caractères'
            }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    quantite_minimale: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: {
                args: [1],
                msg: 'La quantité minimale doit être au moins 1'
            }
        }
    },
    prix: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: {
                args: [0],
                msg: 'Le prix ne peut pas être négatif'
            }
        }
    },
    quantite_stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'La quantité en stock ne peut pas être négative'
            }
        }
    },
    idMarque: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Marque,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    idCategory: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Category,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    imagePrincipale: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    caracteristiques: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    reference: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
}, {
    tableName: 'produits',
    timestamps: true,
    paranoid: true,
    indexes: [
        {
            fields: ['idMarque']
        },
        {
            fields: ['idCategory']
        },
        {
            fields: ['reference']
        },
        {
            fields: ['isActive', 'isAvailable']
        }
    ],
    hooks: {
        beforeCreate: (produit) => {
            // Générer une référence automatique si non fournie
            if (!produit.reference) {
                produit.reference = `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            }
        }
    }
});

// Relations
/**
 * Produit belongs to Marque
 */
Produit.belongsTo(Marque, {
    foreignKey: 'idMarque',
    as: 'marque'
});

/**
 * Marque has many Produits
 */
Marque.hasMany(Produit, {
    foreignKey: 'idMarque',
    as: 'produits'
});

/**
 * Produit belongs to Category
 */
Produit.belongsTo(Category, {
    foreignKey: 'idCategory',
    as: 'category'
});

/**
 * Category has many Produits
 */
Category.hasMany(Produit, {
    foreignKey: 'idCategory',
    as: 'produits'
});

module.exports = Produit;