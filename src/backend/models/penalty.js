const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Penalty = sequelize.define('Penalty', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    categoriaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Categories', // Nome da tabela associada
            key: 'id'
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    missaoId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Missions', // Nome da tabela associada
            key: 'id'
        }
    },
    dificuldade: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rank: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'Penalties',
    timestamps: true
});

module.exports = Penalty;
