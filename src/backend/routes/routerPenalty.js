const express = require('express');
const router = express.Router();
const Penalty = require('../models/penalty'); 
const Status = require('../models/status'); 

router.post('/create', async (req, res) => {
    const { titulo, dificuldade, rank, userId } = req.body;

    // Validação simples dos campos
    if (!titulo || !dificuldade || !rank || !userId) {
        return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    try {
        // Cria a nova penalidade no banco de dados com status "Em progresso"
        const penalty = await Penalty.create({
            titulo,
            dificuldade,
            rank,
            user_id: userId,
            status: 'Em progresso' // Status inicial quando a penalidade é criada
        });

  

        // Se a penalidade for criada com status "Não feita", aplique a perda de ouro e XP
        let ouroPerdido = 0;
        let xpPerdido = 0;

        // Cálculo da perda de ouro e XP com base na dificuldade
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
                
                return res.status(400).json({ error: 'Dificuldade inválida.' });
        }

        // Busca o status do usuário
        const userStatus = await Status.findOne({ where: { user_id: userId } });
     

        if (userStatus) {
            // Verifica se a penalidade está como "Não feita"
            if (penalty.status === 'Não feita') {
                userStatus.ouro -= ouroPerdido;
                userStatus.xp -= xpPerdido;

                // Garantir que os valores não fiquem negativos
                userStatus.ouro = Math.max(0, userStatus.ouro);
                userStatus.xp = Math.max(0, userStatus.xp);

              

                await userStatus.save();
            }

            // Retorna a penalidade criada com sucesso
            res.status(201).json({ penalty, message: 'Penalidade criada com sucesso, mas sem perda de ouro e XP, pois está em progresso.' });
        } else {
           
            return res.status(404).json({ error: 'Status do usuário não encontrado.' });
        }
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

        if (penalties.length === 0) {
            return res.status(404).json({ message: 'Nenhuma penalidade encontrada para este usuário.' });
        }

       
        res.status(200).json(penalties);
    } catch (error) {
        console.error('Erro ao buscar penalidades:', error);
        res.status(500).json({ error: 'Erro ao buscar penalidades.' });
    }
});


module.exports = router;
