const express = require('express');
const router = express.Router();
const Penalty = require('../models/penalty'); 
const Status = require('../models/status'); 

const calcularPenalidade = (dificuldade, rank) => {
    let ouroPerdido = 0;
    let xpPerdido = 0;

    switch (dificuldade) {
        case 'Fácil': ouroPerdido = 10; xpPerdido = 20; break;
        case 'Médio': ouroPerdido = 20; xpPerdido = 40; break;
        case 'Difícil': ouroPerdido = 30; xpPerdido = 60; break;
        case 'Absurdo': ouroPerdido = 50; xpPerdido = 100; break;
        default: throw new Error('Dificuldade inválida.');
    }

    const multiplicadores = {
        'F': 1, 'E': 1.2, 'D': 1.4, 'C': 1.6, 'B': 1.8,
        'A': 2, 'S': 2.2, 'SS': 2.4, 'SSS': 2.6, 'SSS+': 3
    };

    if (!multiplicadores[rank]) throw new Error('Rank inválido.');

    return {
        ouroPerdido: Math.round(ouroPerdido * multiplicadores[rank]),
        xpPerdido: Math.round(xpPerdido * multiplicadores[rank]),
    };
};

// Criar uma penalidade
router.post('/create', async (req, res) => {
    const { titulo, dificuldade, situacao, rank, id_usuario } = req.body;

    if (!titulo || !dificuldade || !rank || !id_usuario) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    try {
        const { ouroPerdido, xpPerdido } = calcularPenalidade(dificuldade, rank);

        const newPenalty = await Penalty.create({
            titulo,
            dificuldade,
            rank,
            situacao,
            perdaOuro: ouroPerdido,
            perdaXp: xpPerdido,
            id_usuario,
        });

        res.status(201).json({ penalty: newPenalty, message: 'Penalidade criada com sucesso.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Buscar penalidades de um usuário
router.get('/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const penalties = await Penalty.findAll({ where: { id_usuario } });
        res.status(200).json(penalties);
    } catch (error) {
        console.error('Erro ao buscar penalidades:', error);
        res.status(500).json({ error: 'Erro ao buscar penalidades.' });
    }
});

// Excluir penalidade
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const penalty = await Penalty.findByPk(id);
        if (!penalty) return res.status(404).json({ error: 'Penalidade não encontrada.' });

        await penalty.destroy();
        res.status(200).json({ message: 'Penalidade excluída com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir penalidade:', error);
        res.status(500).json({ error: 'Erro ao excluir penalidade.' });
    }
});

// Atualizar penalidade
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, dificuldade, rank, situacao, id_usuario } = req.body;

    if (!titulo || !dificuldade || !rank || !situacao || !id_usuario) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    try {
        const penalty = await Penalty.findByPk(id);
        if (!penalty) return res.status(404).json({ error: 'Penalidade não encontrada.' });

        const { ouroPerdido, xpPerdido } = calcularPenalidade(dificuldade, rank);

        penalty.titulo = titulo;
        penalty.dificuldade = dificuldade;
        penalty.rank = rank;
        penalty.situacao = situacao;
        penalty.perdaOuro = ouroPerdido;
        penalty.perdaXp = xpPerdido;
        await penalty.save();

        const userStatus = await Status.findOne({ where: { id_usuario } });
        if (!userStatus) return res.status(404).json({ error: 'Status do usuário não encontrado.' });

        if (situacao === 'Pendente') {
            userStatus.ouro = Math.max(0, userStatus.ouro - ouroPerdido);
            userStatus.xp = Math.max(0, userStatus.xp - xpPerdido);
            await userStatus.save();
        }

        res.status(200).json({ penalty, message: 'Penalidade atualizada com sucesso.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Buscar todas as penalidades de um usuário
router.get('/all/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const penalties = await Penalty.findAll({ where: { id_usuario } });
        res.status(200).json({ penalties });
    } catch (error) {
        console.error('Erro ao buscar penalidades:', error);
        res.status(500).json({ error: 'Erro ao buscar penalidades.' });
    }
});

// Superar penalidade
router.put('/overcome/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const penalty = await Penalty.findByPk(id);
        if (!penalty) return res.status(404).json({ error: 'Penalidade não encontrada.' });

        const userStatus = await Status.findOne({ where: { id_usuario: penalty.id_usuario } });
        if (!userStatus) return res.status(404).json({ error: 'Status do usuário não encontrado.' });

        if (penalty.situacao === 'Em andamento') {
            penalty.situacao = 'Concluída';
            await penalty.save();

            userStatus.ouro += penalty.perdaOuro;
            userStatus.pd += penalty.perdaXp;
            await userStatus.save();

            return res.status(200).json({ message: 'Penalidade superada com sucesso.' });
        } else {
            return res.status(400).json({ error: 'Penalidade não está em andamento.' });
        }
    } catch (error) {
        console.error('Erro ao superar penalidade:', error);
        return res.status(500).json({ error: 'Erro ao superar penalidade.' });
    }
});

// Resetar penalidades de uma missão
router.put('/reset/:id_missao', async (req, res) => {
    const { id_missao } = req.params;

    try {
        await Penalty.update(
            { situacao: 'Pendente' },
            { where: { id_missao } }
        );

        res.status(200).json({ message: 'Penalidades resetadas com sucesso.' });
    } catch (error) {
        console.error('Erro ao resetar penalidades:', error);
        res.status(500).json({ error: 'Erro ao resetar penalidades.' });
    }
});

// Atualizar múltiplas penalidades
router.put('/update-multiple', async (req, res) => {
    const { id_missao, situacao } = req.body;

    if (!id_missao || !situacao) {
        return res.status(400).json({ error: 'Informe a missão e o novo status.' });
    }

    try {
        await Penalty.update(
            { situacao },
            { where: { id_missao } }
        );

        res.status(200).json({ message: 'Penalidades atualizadas com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar penalidades:', error);
        res.status(500).json({ error: 'Erro ao atualizar penalidades.' });
    }
});

module.exports = router;
