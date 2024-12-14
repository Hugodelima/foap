const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const MissionHistory = sequelize.define('MissionHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    missionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    prazoAnterior: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    prazoAtualizado: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'mission_histories',
    timestamps: true,
});

module.exports = MissionHistory;
