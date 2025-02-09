const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const MissionHistoryDiary = sequelize.define('MissionHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_missao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Missoes',
      key: 'id'
    }
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  completado: {
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
}, {
  tableName: 'MissoesDiarias',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em'
});

module.exports = MissionHistoryDiary;
