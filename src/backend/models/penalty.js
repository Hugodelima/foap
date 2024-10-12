const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Penalty = sequelize.define('Penalty', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Não feita', 'Em progresso', 'Superada', 'Missão feita'),
        allowNull: false,
        defaultValue: 'Não feita'
    },
    perdaOuro: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 500
    },
    perdaXp: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 250
    },
    dificuldade: {
        type: DataTypes.ENUM('Fácil', 'Médio', 'Difícil', 'Absurdo'),
        allowNull: false
    },
    rank: {
        type: DataTypes.ENUM('F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSS+'),
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Nome da tabela Users
            key: 'id'
        }
    }
}, {
    tableName: 'Penalties',
    timestamps: true
});

module.exports = Penalty;
