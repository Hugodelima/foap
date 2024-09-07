require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routerUser = require('../routes/routerUser'); // Ajuste o caminho conforme a estrutura do seu projeto

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configura a porta a partir da variável de ambiente ou usa a porta 3000 por padrão
const PORT = process.env.PORT || 3000;


// Usar o roteador definido em routerUser.js
app.use('/api/userapi', routerUser); // Prefixo para todas as rotas definidas no roteador

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
