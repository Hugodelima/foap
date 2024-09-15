const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Category = sequelize.define('Category', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    peso: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'Categories',
    timestamps: true
});

// Função para adicionar categorias padrão
const addDefaultCategories = async () => {
    try {
        // Verifica se já existem categorias
        const count = await Category.count();
        if (count > 0) return;

        // Define categorias padrão
        const defaultCategories = [
            { nome: 'Saúde', peso: 10 },
            { nome: 'Educação', peso: 8 },
            { nome: 'Trabalho', peso: 6 },
            { nome: 'Lazer', peso: 5 },
            { nome: 'Social', peso: 7 },
            { nome: 'Pessoal', peso: 9 }
        ];

        // Insere as categorias padrão
        await Category.bulkCreate(defaultCategories);
        console.log('Categorias padrão inseridas com sucesso.');
    } catch (error) {
        console.error('Erro ao adicionar categorias padrão:', error);
    }
};

// Executa a função após a sincronização dos modelos
sequelize.sync().then(() => {
    addDefaultCategories();
});

module.exports = Category;
