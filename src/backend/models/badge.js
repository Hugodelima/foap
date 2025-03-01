const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Badge = sequelize.define('Badge', {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  conquista: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  icone: {
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
  tableName: 'Medalhas',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em'
});



module.exports = Badge;
