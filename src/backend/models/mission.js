const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const Penalty = require('./penalty');  

const Mission = sequelize.define('Mission', {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rank: {
    type: DataTypes.ENUM('F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSS+'),
    allowNull: false,
  },
  prazo: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  dificuldade: {
    type: DataTypes.ENUM('Fácil', 'Médio', 'Difícil', 'Absurdo'),
    allowNull: false,
  },
  valorXp: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  valorOuro: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  valorPd: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  situacao: {
    type: DataTypes.ENUM('Finalizada', 'Em progresso', 'Não finalizada'),
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
  repeticao: {
    type: DataTypes.ENUM('Diariamente', 'Nunca'),
    allowNull: false,
    defaultValue: 'Nunca',
  },
}, {
  tableName: 'Missoes',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em'
});

Mission.hasMany(Penalty, {
  foreignKey: 'id_missao',
  as:'Penalidades',
  onDelete: 'CASCADE',  
});

module.exports = Mission;
