const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Mission = sequelize.define('Mission', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    prazo: {
        type: DataTypes.DATE,
        allowNull: false
    },
    penalidadeId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Penalties',
            key: 'id'
        }
    },
    recompensaId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Rewards',
            key: 'id'
        }
    },
    rank: {
        type: DataTypes.ENUM('F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSS+'),
        allowNull: false
    },
    dificuldade: {
        type: DataTypes.ENUM('Fácil', 'Médio', 'Difícil', 'Absurdo'),
        allowNull: false
    },
    repeticao: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'Missions',
    timestamps: true
});

module.exports = Mission;
