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
  status: {
    type: DataTypes.ENUM('Finalizada', 'Em progresso', 'Não finalizada'),
    allowNull: false,
    defaultValue: 'Não finalizada',
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
});

Mission.hasMany(Penalty, {
  foreignKey: 'missionId',  
  onDelete: 'CASCADE',      
});

module.exports = Mission;
