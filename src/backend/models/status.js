// models/status.js
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Status = sequelize.define('Status', {
  rank: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nivel: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  proximo_nivel: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  xp_faltante: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_xp: {
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
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users', // Nome da tabela User
      key: 'id'
    },
    allowNull: false
  }
}, {
  tableName: 'Status',
  timestamps: true
});

module.exports = Status;
