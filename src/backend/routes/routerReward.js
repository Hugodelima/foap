const express = require('express');
const router = express.Router();
const Reward = require('../models/reward');
const User = require('../models/user');

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

        if (rewards.length === 0) {
            return res.status(404).json({ error: 'Nenhuma recompensa encontrada para esse usuário.' });
        }

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
    console.log('22323')
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
        const user = await User.findByPk(req.body.userId); // Assumindo que você passa o ID do usuário no corpo da requisição

        if (!reward || !user) {
            return res.status(404).json({ error: 'Recompensa ou usuário não encontrado' });
        }

        if (user.ouro < reward.ouro) {
            return res.status(400).json({ error: 'Ouro insuficiente' });
        }

        // Deduz o ouro do usuário
        user.ouro -= reward.ouro;
        await user.save();

        res.status(200).json({ message: 'Recompensa comprada com sucesso', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
