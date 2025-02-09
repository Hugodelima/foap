const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Penalty = sequelize.define('Penalty', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    situacao: {
        type: DataTypes.ENUM('Pendente', 'Em andamento', 'Concluída'),
        allowNull: false,
        defaultValue: 'Pendente'
    },
    perdaOuro: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    perdaXp: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    dificuldade: {
        type: DataTypes.ENUM('Fácil', 'Médio', 'Difícil', 'Absurdo'),
        allowNull: false
    },
    rank: {
        type: DataTypes.ENUM('F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSS+'),
        allowNull: false
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
    tableName: 'Penalidades',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
}); 

module.exports = Penalty;
