const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./database');

const Verification = sequelize.define('Verification', {
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiracao: {
    type: DataTypes.DATE,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'Verificacoes',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em'
});

module.exports = Verification;
