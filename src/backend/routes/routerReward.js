const express = require('express');
const router = express.Router();
const Reward = require('../models/reward');
const User = require('../models/user');
const Status = require('../models/status');

// Criar recompensa
router.post('/create', async (req, res) => {
    try {
        // Define a situação como "em aberto" se não for fornecida no corpo da requisição
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
});

// Buscar todas as recompensas de um determinado usuário
router.get('/:id_usuario', async (req, res) => {
    try {
        const rewards = await Reward.findAll({
            where: { id_usuario: req.params.id_usuario },
            order: [['criado_em', 'DESC']]
        });

        res.status(200).json(rewards);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Rota para editar recompensa
router.put('/update/:rewardId', async (req, res) => {
    try {
        const { titulo, ouro } = req.body;
        const rewardId = req.params.rewardId;

        const reward = await Reward.findByPk(rewardId);

        if (!reward) {
            return res.status(404).json({ error: 'Recompensa não encontrada.' });
        }

        reward.titulo = titulo || reward.titulo;
        reward.ouro = ouro || reward.ouro;

        await reward.save();

        res.status(200).json(reward);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Rota para deletar recompensa
router.delete('/delete/:rewardId', async (req, res) => {
    try {
        const rewardId = req.params.rewardId;
        const reward = await Reward.findByPk(rewardId);

        if (!reward) {
            return res.status(404).json({ error: 'Recompensa não encontrada.' });
        }

        await reward.destroy();
        res.status(200).json({ message: 'Recompensa deletada com sucesso.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Comprar recompensa (deduz ouro do usuário)
router.post('/buy/:id', async (req, res) => {
    const { id } = req.params
    const { id_usuario,  } = req.body
    try {
        const reward = await Reward.findByPk(id);
        const status = await Status.findOne({ where: { id_usuario: id_usuario } });

        if (!reward || !status) {
            return res.status(404).json({ error: 'Recompensa ou status do usuário não encontrado' });
        }

        if (status.ouro < reward.ouro) {
            return res.status(400).json({ error: 'Ouro insuficiente' });
        }

        // Deduzindo o ouro do status do usuário
        status.ouro -= reward.ouro;
        await status.save();

        // Atualizando a situação da recompensa para comprada
        reward.situacao = 'comprada';
        await reward.save();

        res.status(200).json({ message: 'Recompensa comprada com sucesso', status, reward });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
