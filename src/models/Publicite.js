const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Category');
const Produit = require('./Produit');

/**
 * Modèle Publicite
 * Annonces associées soit à une catégorie, soit à un produit
 */
const Publicite = sequelize.define('Publicite', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    libelle: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Le titre ne peut pas être vide'
            },
            len: {
                args: [3, 150],
                msg: 'Le titre doit contenir entre 3 et 150 caractères'
            }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    images: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    dateExpiration: {
        type: DataTypes.DATE,
        allowNull: true
    },
    nombreVues: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },

    // ─── Clés étrangères optionnelles (l'une ou l'autre) ───────────────────────
    idCategory: {
        type: DataTypes.UUID,
        allowNull: true,          // nullable car peut être lié à un produit
        references: {
            model: Category,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    idProduit: {
        type: DataTypes.UUID,
        allowNull: true,          // nullable car peut être lié à une catégorie
        references: {
            model: Produit,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    }

}, {
    tableName: 'publicites',
    timestamps: true,
    paranoid: true,
    indexes: [
        { fields: ['idCategory'] },
        { fields: ['idProduit'] },
        { fields: ['dateExpiration'] }
    ],
    validate: {
        /**
         * Validation globale : une publicité doit être liée
         * soit à une catégorie, soit à un produit — pas ni l'un ni l'autre,
         * pas les deux à la fois.
         */
        soitCategorySoitProduct() {
            const hasCategory = this.idCategory !== null && this.idCategory !== undefined;
            const hasProduct  = this.idProduit  !== null && this.idProduit  !== undefined;

            if (!hasCategory && !hasProduct) {
                throw new Error('Une publicité doit être associée à une catégorie ou à un produit');
            }
            if (hasCategory && hasProduct) {
                throw new Error('Une publicité ne peut pas être associée à la fois à une catégorie et à un produit');
            }
        }
    }
});



module.exports = Publicite;