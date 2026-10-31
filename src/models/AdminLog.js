const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Historique des modifications faites depuis le back-office.
 */
const AdminLog = sequelize.define('AdminLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    idAdmin: {
        type: DataTypes.UUID,
        allowNull: true
    },
    adminLogin: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    method: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    path: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    label: {
        type: DataTypes.STRING(200),
        allowNull: true
    }
}, {
    tableName: 'admin_logs',
    timestamps: true,
    updatedAt: false,
    indexes: [{ fields: ['createdAt'] }]
});

module.exports = AdminLog;
