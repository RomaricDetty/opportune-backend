// models/DemandeDevis.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DemandeDevis = sequelize.define('DemandeDevis', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    nomClient: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Le nom du client ne peut pas être vide' }
        }
    },
    prenomClient: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    telephone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Le téléphone ne peut pas être vide' }
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isEmail: { msg: 'L\'email doit être valide' }
        }
    },
    adresse: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    statut: {
        type: DataTypes.ENUM('en_attente', 'en_cours', 'validee', 'annulee'),
        defaultValue: 'en_attente',
        allowNull: false
    },
    montantTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    reference: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: true
    }
}, {
    tableName: 'demande_devis',
    timestamps: true,
    paranoid: true, // ✅ soft delete
    hooks: {
        beforeCreate: (devis) => {
            const timestamp = Date.now().toString().slice(-6);
            const random = Math.random().toString(36).substring(2, 5).toUpperCase();
            devis.reference = `DEV-${timestamp}-${random}`;
        }
    }
});

module.exports = DemandeDevis;