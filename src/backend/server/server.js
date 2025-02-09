const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('../models/database');

const routerUser = require('../routes/routerUser');
const routerPenalty = require('../routes/routerPenalty');
const routerReward = require('../routes/routerReward');
const routerMission = require('../routes/routerMission');
const routerStatus = require('../routes/routerStatus')
const routerMissionHistory = require('../routes/routerMissionHistoryDiary')
const routerAttribute = require('../routes/routerAttribute')
const routerVerifications = require('../routes/routerVerification');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Roteadores
app.use('/api/userapi', routerUser);
app.use('/api/penaltyapi', routerPenalty);
app.use('/api/rewardapi', routerReward);
app.use('/api/missionapi', routerMission);
app.use('/api/statusapi', routerStatus);
app.use('/api/missionhistorynapi', routerMissionHistory);
app.use('/api/attributeapi', routerAttribute);
app.use('/api/verificationapi', routerVerifications);


const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

sequelize.sync({ alter: true })
    .then(() => console.log('Sincronizado o banco de dados'))
    .catch(err => console.error('Erro ao sincronizar com o banco de dados:', err));