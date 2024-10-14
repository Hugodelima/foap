const express = require('express');
const router = express.Router();
const Penalty = require('../models/penalty'); 
const Status = require('../models/status'); 

const calcularPenalidade = (dificuldade, rank) => {
    let ouroPerdido = 0;
    let xpPerdido = 0;

    switch (dificuldade) {
        case 'Fácil':
            ouroPerdido = 10;
            xpPerdido = 20;
            break;
        case 'Médio':
            ouroPerdido = 20;
            xpPerdido = 40;
            break;
        case 'Difícil':
            ouroPerdido = 30;
            xpPerdido = 60;
            break;
        case 'Absurdo':
            ouroPerdido = 50;
            xpPerdido = 100;
            break;
        default:
            throw new Error('Dificuldade inválida.');
    }

    switch (rank) {
        case 'F':
            ouroPerdido *= 1;
            xpPerdido *= 1;
            break;
        case 'E':
            ouroPerdido *= 1.2;
            xpPerdido *= 1.2;
            break;
        case 'D':
            ouroPerdido *= 1.4;
            xpPerdido *= 1.4;
            break;
        case 'C':
            ouroPerdido *= 1.6;
            xpPerdido *= 1.6;
            break;
        case 'B':
            ouroPerdido *= 1.8;
            xpPerdido *= 1.8;
            break;
        case 'A':
            ouroPerdido *= 2;
            xpPerdido *= 2;
            break;
        case 'S':
            ouroPerdido *= 2.2;
            xpPerdido *= 2.2;
            break;
        case 'SS':
            ouroPerdido *= 2.4;
            xpPerdido *= 2.4;
            break;
        case 'SSS':
            ouroPerdido *= 2.6;
            xpPerdido *= 2.6;
            break;
        case 'SSS+':
            ouroPerdido *= 3;
            xpPerdido *= 3;
            break;
        default:
            throw new Error('Rank inválido.');
    }

    return {
        ouroPerdido: Math.round(ouroPerdido),
        xpPerdido: Math.round(xpPerdido),
    };
};


router.post('/create', async (req, res) => {
    const { titulo, dificuldade, rank, userId } = req.body;

    if (!titulo || !dificuldade || !rank || !userId) {
        return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    try {
        const { ouroPerdido, xpPerdido } = calcularPenalidade(dificuldade, rank);

        const newPenalty = await Penalty.create({
            titulo,
            dificuldade,
            rank,
            perdaOuro: ouroPerdido,
            perdaXp: xpPerdido,
            user_id: userId,
        });

        res.status(201).json({ penalty: newPenalty, message: 'Penalidade criada com sucesso.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



// Rota para buscar penalidades por userId
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Busca as penalidades que pertencem ao usuário
        const penalties = await Penalty.findAll({
            where: {
                user_id: userId // Certifique-se de que este campo exista na tabela Penalty
            }
        });

        res.status(200).json(penalties);
    } catch (error) {
        console.error('Erro ao buscar penalidades:', error);
        res.status(500).json({ error: 'Erro ao buscar penalidades.' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params; // Obtém o ID da penalidade dos parâmetros

    try {
        // Busca a penalidade pelo ID
        const penalty = await Penalty.findByPk(id);

        if (!penalty) {
            return res.status(404).json({ error: 'Penalidade não encontrada.' });
        }

        // Deleta a penalidade
        await penalty.destroy();

        res.status(200).json({ message: 'Penalidade excluída com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir penalidade:', error);
        res.status(500).json({ error: 'Erro ao excluir penalidade.' });
    }
});





router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, dificuldade, rank, status, userId } = req.body;

    if (!titulo || !dificuldade || !rank || !status || !userId) {
        return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    try {
        const penalty = await Penalty.findByPk(id);

        if (!penalty) {
            return res.status(404).json({ error: 'Penalidade não encontrada.' });
        }

        penalty.titulo = titulo;
        penalty.dificuldade = dificuldade;
        penalty.rank = rank;
        penalty.status = status;

        const { ouroPerdido, xpPerdido } = calcularPenalidade(dificuldade, rank);

        penalty.perdaOuro = ouroPerdido;
        penalty.perdaXp = xpPerdido;
        await penalty.save();

        const userStatus = await Status.findOne({ where: { user_id: userId } });

        if (userStatus) {
            if (status === 'Não feita') {
                userStatus.ouro -= ouroPerdido;
                userStatus.xp -= xpPerdido;
                userStatus.ouro = Math.max(0, userStatus.ouro);
                userStatus.xp = Math.max(0, userStatus.xp);
                await userStatus.save();
            }

            res.status(200).json({ penalty, message: 'Penalidade atualizada com sucesso.' });
        } else {
            return res.status(404).json({ error: 'Status do usuário não encontrado.' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


module.exports = router;
