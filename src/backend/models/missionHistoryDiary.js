const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const MissionHistoryDiary = sequelize.define('MissionHistory', {
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
  recompensaXp: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  recompensaOuro: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  recompensaPd: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'MissionHistoriesDiary',
  timestamps: true,
});

module.exports = MissionHistoryDiary;
