// models/verification.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./database'); // ou o caminho correto para sua configuração do sequelize

const Verification = sequelize.define('Verification', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Nome da tabela de usuários (em plural ou no formato correto)
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
  tipo: { // Campo adicional para diferenciar o tipo de verificação
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'Verifications',
  timestamps: true, // Adiciona colunas createdAt e updatedAt
});

module.exports = Verification;
