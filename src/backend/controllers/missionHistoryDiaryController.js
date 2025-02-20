const MissionHistory = require('../models/missionHistoryDiary');
const Mission = require('../models/mission');

const createMissionHistory = async (req, res) => {
    console.log('rota de criar histórico');
    const { id_missao, id_usuario, completado, prazoAnterior, prazoAtualizado, valorXp, valorOuro, valorPd } = req.body;

    if (!id_missao || !id_usuario || !prazoAnterior || !prazoAtualizado) {
        return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    try {
        const history = await MissionHistory.create({
            id_missao,
            id_usuario,
            completado,
            prazoAnterior,
            prazoAtualizado,
            valorXp,
            valorOuro,
            valorPd,
        });

        res.status(201).json({ message: 'Histórico criado com sucesso.', history });
    } catch (error) {
        console.error('Erro ao criar histórico:', error);
        res.status(500).json({ error: 'Erro ao criar histórico.' });
    }
};

const getMissionHistoryByUser = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const histories = await MissionHistory.findAll({
            where: { id_usuario },
            include: [{ model: Mission, attributes: ['titulo', 'dificuldade'] }],
        });

        res.status(200).json(histories);
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico.' });
    }
};

const getDailyMissions = async (req, res) => {
    try {
        const missions = await Mission.findAll({
            where: { tipo: 'diária' },
        });

        res.status(200).json(missions);
    } catch (error) {
        console.error('Erro ao buscar missões diárias:', error);
        res.status(500).json({ error: 'Erro ao buscar missões diárias.' });
    }
};

module.exports = {
    createMissionHistory,
    getMissionHistoryByUser,
    getDailyMissions
};
