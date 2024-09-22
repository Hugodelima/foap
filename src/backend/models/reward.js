const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const User = require('./user');  // Assumindo que você tem um modelo de Usuário

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
    },
    userId: { 
        type: DataTypes.INTEGER,
        references: {
            model: 'Users', 
            key: 'id'
        }
    }
}, {
    tableName: 'Rewards',
    timestamps: true
});

module.exports = Reward;
