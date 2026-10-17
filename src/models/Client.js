const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * Modèle Client
 * Compte client pour le site e-commerce
 */
const Client = sequelize.define('Client', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: { msg: 'L\'email doit être valide' }
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: {
                args: [6, 255],
                msg: 'Le mot de passe doit contenir au moins 6 caractères'
            }
        }
    },
    nom: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    prenom: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    telephone: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    adresse: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    ville: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'clients',
    timestamps: true,
    paranoid: true,
    indexes: [
        { unique: true, fields: ['email'] },
        { fields: ['telephone'] },
        { fields: ['isActive'] }
    ],
    hooks: {
        beforeCreate: async (client) => {
            if (client.password) {
                client.password = await bcrypt.hash(client.password, 10);
            }
        },
        beforeUpdate: async (client) => {
            if (client.changed('password')) {
                client.password = await bcrypt.hash(client.password, 10);
            }
        }
    }
});

/**
 * Compare un mot de passe en clair avec le hash stocké.
 * @param {string} plainPassword - Mot de passe en clair
 * @returns {Promise<boolean>}
 */
Client.prototype.comparePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
};

/**
 * Sérialise le client sans exposer le mot de passe.
 * @returns {object}
 */
Client.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
};

module.exports = Client;
