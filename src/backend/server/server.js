const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const routerUser = require('../routes/routerUser');
const routerPenalty = require('../routes/routerPenalty');
const routerReward = require('../routes/routerReward');
const routerMission = require('../routes/routerMission');
const routerStatus = require('../routes/routerStatus')

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

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
