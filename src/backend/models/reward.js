const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Reward = sequelize.define('Reward', {
    missaoId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Missions',
            key: 'id'
        }
    },
    xp: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ouro: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    pd: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'Rewards',
    timestamps: true
});

module.exports = Reward;
