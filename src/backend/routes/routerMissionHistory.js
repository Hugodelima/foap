const express = require('express');
const router = express.Router();
const MissionHistory = require('../models/missionHistory');
const Mission = require('../models/mission');

// Rota para criar um registro no histórico de missões
router.post('/create', async (req, res) => {
    const { missionId, userId, completed, prazoAnterior, prazoAtualizado } = req.body;

    if (!missionId || !userId || !prazoAnterior || !prazoAtualizado) {
        return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    try {
        const history = await MissionHistory.create({
            missionId,
            userId,
            completed,
            prazoAnterior,
            prazoAtualizado,
        });

        res.status(201).json({ message: 'Histórico criado com sucesso.', history });
    } catch (error) {
        console.error('Erro ao criar histórico:', error);
        res.status(500).json({ error: 'Erro ao criar histórico.' });
    }
});

// Rota para buscar o histórico de uma missão por usuário
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const histories = await MissionHistory.findAll({
            where: { userId },
            include: [{ model: Mission, attributes: ['titulo', 'dificuldade'] }],
        });

        res.status(200).json(histories);
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico.' });
    }
});

router.get('/daily-missions', async (req, res) => {
    try {
        const missions = await Mission.findAll({
            where: {
                tipo: 'diária',
            },
        });

        res.status(200).json(missions);
    } catch (error) {
        console.error('Erro ao buscar missões diárias:', error);
        res.status(500).json({ error: 'Erro ao buscar missões diárias.' });
    }
});


module.exports = router;
