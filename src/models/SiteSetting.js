const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Paramètres globaux du site (singleton logique).
 */
const SiteSetting = sequelize.define(
    'SiteSetting',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        siteName: {
            type: DataTypes.STRING(120),
            allowNull: false,
            defaultValue: 'Electro Store',
        },
        logo: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
    },
    {
        tableName: 'site_settings',
        timestamps: true,
    },
);

module.exports = SiteSetting;
