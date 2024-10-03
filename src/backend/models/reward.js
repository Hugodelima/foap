const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const User = require('./user');  // Assumindo que você tem um modelo de Usuário

const Reward = sequelize.define('Reward', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    gold: {
        type: DataTypes.INTEGER,
        allowNull: false, 
    },
    status: {
        type: DataTypes.STRING, 
        allowNull: false, 
    },
    userId: { 
        type: DataTypes.INTEGER,
        references: {
            model: User,  // Referência ao modelo de Usuário
            key: 'id'
        },
        allowNull: false, // userId é obrigatório
    }
}, {
    tableName: 'Rewards',
    timestamps: true
});

module.exports = Reward;
