const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

/**
 * Message envoyé depuis le formulaire de contact du site.
 */
const ContactMessage = sequelize.define(
    'ContactMessage',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        nom: {
            type: DataTypes.STRING(120),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Le nom est requis' },
            },
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                isEmail: { msg: "L'email doit être valide" },
            },
        },
        telephone: {
            type: DataTypes.STRING(30),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Le téléphone est requis' },
            },
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Le message est requis' },
            },
        },
        statut: {
            type: DataTypes.ENUM('nouveau', 'lu', 'traite'),
            defaultValue: 'nouveau',
            allowNull: false,
        },
    },
    {
        tableName: 'contact_messages',
        timestamps: true,
        paranoid: true,
    },
)

module.exports = ContactMessage
