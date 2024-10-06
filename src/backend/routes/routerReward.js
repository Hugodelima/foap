const express = require('express');
const router = express.Router();
const Reward = require('../models/reward');
const User = require('../models/user');
const Status = require('../models/status')

// Criar recompensa
router.post('/create', async (req, res) => {
    try {
        // Define o status como "em aberto" se não for fornecido no corpo da requisição
        const { title, gold, userId, status = 'em aberto' } = req.body;

        const reward = await Reward.create({
            titulo: title,
            gold,
            status,
            userId: JSON.parse(userId)
        });

        res.status(201).json(reward);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Buscar todas as recompensas de um determinado usuário
router.get('/:userId', async (req, res) => {
    try {
        const rewards = await Reward.findAll({
            where: { userId: req.params.userId },
            order: [['createdAt', 'DESC']]
        });

        

        res.status(200).json(rewards);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Rota para editar recompensa
router.put('/update/:rewardId', async (req, res) => {
    try {
        const { title, gold, status } = req.body;
        const rewardId = req.params.rewardId;

        const reward = await Reward.findByPk(rewardId);

        if (!reward) {
            return res.status(404).json({ error: 'Recompensa não encontrada.' });
        }

        reward.titulo = title || reward.titulo;
        reward.gold = gold || reward.gold;
        reward.status = status || reward.status;

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
    try {
        const reward = await Reward.findByPk(req.params.id);
        const status = await Status.findOne({ where: { user_id: req.body.userId } });


        if (!reward || !status) {
            return res.status(404).json({ error: 'Recompensa ou status do usuário não encontrado' });
        }

        if (status.ouro < reward.gold) {
            return res.status(400).json({ error: 'Ouro insuficiente' });
        }

        // Deduzindo o ouro do status do usuário
        status.ouro -= reward.gold;
        await status.save();

        // Atualizando o status da recompensa para comprada
        reward.status = 'comprada';
        await reward.save();

        res.status(200).json({ message: 'Recompensa comprada com sucesso', status, reward });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


module.exports = router;