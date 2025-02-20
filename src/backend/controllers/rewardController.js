// controllers/rewardController.js
const Reward = require('../models/reward');
const Status = require('../models/status');

const createReward = async (req, res) => {
    try {
        const { titulo, ouro, id_usuario, situacao = 'em aberto' } = req.body;

        const reward = await Reward.create({
            titulo,
            ouro,
            situacao,
            id_usuario: JSON.parse(id_usuario)
        });

        res.status(201).json(reward);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getRewardsByUser = async (req, res) => {
    try {
        const rewards = await Reward.findAll({
            where: { id_usuario: req.params.id_usuario },
            order: [['criado_em', 'DESC']]
        });

        res.status(200).json(rewards);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateReward = async (req, res) => {
    try {
        const { titulo, ouro } = req.body;
        const { rewardId } = req.params;

        const reward = await Reward.findByPk(rewardId);
        if (!reward) return res.status(404).json({ error: 'Recompensa não encontrada.' });

        reward.titulo = titulo || reward.titulo;
        reward.ouro = ouro || reward.ouro;
        await reward.save();

        res.status(200).json(reward);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteReward = async (req, res) => {
    try {
        const { rewardId } = req.params;
        const reward = await Reward.findByPk(rewardId);
        if (!reward) return res.status(404).json({ error: 'Recompensa não encontrada.' });

        await reward.destroy();
        res.status(200).json({ message: 'Recompensa deletada com sucesso.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const buyReward = async (req, res) => {
    const { id } = req.params;
    const { id_usuario } = req.body;
    try {
        const reward = await Reward.findByPk(id);
        const status = await Status.findOne({ where: { id_usuario } });

        if (!reward || !status) return res.status(404).json({ error: 'Recompensa ou status do usuário não encontrado.' });

        if (status.ouro < reward.ouro) return res.status(400).json({ error: 'Ouro insuficiente.' });

        status.ouro -= reward.ouro;
        await status.save();

        reward.situacao = 'comprada';
        await reward.save();

        res.status(200).json({ message: 'Recompensa comprada com sucesso.', status, reward });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createReward, getRewardsByUser, updateReward, deleteReward, buyReward };
