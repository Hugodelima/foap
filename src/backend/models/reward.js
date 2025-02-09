const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const User = require('./user');

const Reward = sequelize.define('Reward', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    ouro: {
        type: DataTypes.INTEGER,
        allowNull: false, 
    },
    situacao: {
        type: DataTypes.STRING, 
        allowNull: false, 
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'id'
        }
    },
}, {
    tableName: 'Recompensas',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
});

module.exports = Reward;
