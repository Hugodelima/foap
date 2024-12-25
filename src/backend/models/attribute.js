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
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
}, {
    tableName: 'Attributes',
    timestamps: true,
});

module.exports = Attribute;
