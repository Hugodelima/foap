// routes/routerStatus.js
const express = require('express');
const router = express.Router();
const Status = require('../models/status');
const User = require('../models/user')


// Criar o status do cliente
router.post('/create', async (req, res) => {
  const { userID } = req.body;

  try {
    // Verifica se o status já existe para o usuário
    const existingStatus = await Status.findOne({ where: { user_id: userID } });

    if (existingStatus) {
      return res.status(400).json({ message: 'Status já criado para este usuário.' });
    }

    // Cria o status com valores iniciais
    const newStatus = await Status.create({
      rank: 'F',
      nivel: 1,
      proximo_nivel: 10, 
      xp_faltante: 100, 
      total_xp: 0,
      ouro: 0,
      pd: 0,
      user_id: userID
    });

    res.status(201).json(newStatus);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar status.', error: error.message });
  }
});

// Obter ou criar o status do cliente
router.get('/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    // Verifica se já existe um status para o usuário
    let status = await Status.findOne({ where: { user_id: userID } });

    if (!status) {
      return res.status(404).json({ message: 'Status não encontrado.' });
    }

    // Certifica-se de que está retornando o status
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar ou criar status.', error: error.message });
  }
});


// Atualizar lógica no leaderboard
router.get('/leaderboard/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    const userStatus = await Status.findOne({
      where: { user_id: userID },
    });

    if (!userStatus) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Determinar o próximo rank e quantos níveis faltam
    let nextRank;
    let levelsToNextRank;

    if (userStatus.nivel < 10) {
      nextRank = 'E';
      levelsToNextRank = 10 - userStatus.nivel;
    } else if (userStatus.nivel < 50) {
      nextRank = 'D';
      levelsToNextRank = 50 - userStatus.nivel;
    } else if (userStatus.nivel < 100) {
      nextRank = 'C';
      levelsToNextRank = 100 - userStatus.nivel;
    } else if (userStatus.nivel < 200) {
      nextRank = 'B';
      levelsToNextRank = 200 - userStatus.nivel;
    } else if (userStatus.nivel < 300) {
      nextRank = 'A';
      levelsToNextRank = 300 - userStatus.nivel;
    } else if (userStatus.nivel < 400) {
      nextRank = 'SSS';
      levelsToNextRank = 400 - userStatus.nivel;
    } else {
      nextRank = 'SSS';
      levelsToNextRank = 0; // Já está no nível máximo
    }

    // Adiciona os valores calculados no userStatus
    userStatus.setDataValue('nextRank', nextRank);
    userStatus.setDataValue('levelsToNextRank', levelsToNextRank);

    // Buscar os Top 5 usuários
    const leaderboard = await Status.findAll({
      order: [['nivel', 'DESC']], // Ordena por nível
      limit: 5, // Top 5
    });

    const leaderboardWithNames = await Promise.all(
      leaderboard.map(async (status) => {
        const user = await User.findOne({
          where: { id: status.user_id },
        });

        return {
          nome_usuario: user.nome_usuario,
          nivel: status.nivel,
          rank: status.rank,
        };
      })
    );

    res.status(200).json({
      userStatus,
      leaderboard: leaderboardWithNames,
    });
  } catch (error) {
    console.error('Erro ao buscar o leaderboard:', error);
    res.status(500).json({ message: 'Erro ao buscar o leaderboard.', error: error.message });
  }
});






module.exports = router;