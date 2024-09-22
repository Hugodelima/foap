const express = require('express');
const router = express.Router();
const Reward = require('../models/reward');
const User = require('../models/user');

// Criar recompensa
router.post('/create', async (req, res) => {
    try {
        const reward = await Reward.create(req.body);
        res.status(201).json(reward);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Editar recompensa
router.put('/edit/:id', async (req, res) => {
    try {
        const reward = await Reward.findByPk(req.params.id);
        if (!reward) {
            return res.status(404).json({ error: 'Recompensa não encontrada' });
        }

        await reward.update(req.body);
        res.status(200).json(reward);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Excluir recompensa
router.delete('/delete/:id', async (req, res) => {
    try {
        const reward = await Reward.findByPk(req.params.id);
        if (!reward) {
            return res.status(404).json({ error: 'Recompensa não encontrada' });
        }

        await reward.destroy();
        res.status(200).json({ message: 'Recompensa excluída com sucesso' });
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
