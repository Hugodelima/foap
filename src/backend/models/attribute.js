const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Attribute = sequelize.define('Attribute', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    valor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    tipo: {
        type: DataTypes.ENUM('Mental', 'Físico'),
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
    tableName: 'Atributos',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
});

module.exports = Attribute;
