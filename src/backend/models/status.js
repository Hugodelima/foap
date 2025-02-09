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
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
}, {
  tableName: 'Fases',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em'
});

module.exports = Status;
