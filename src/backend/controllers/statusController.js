const Status = require('../models/status');
const User = require('../models/user');

const createStatus = async (req, res) => {
  const { userID } = req.params;

  try {
    const existingStatus = await Status.findOne({ where: { id_usuario: userID } });

    if (existingStatus) {
      return res.status(400).json({ message: 'Status já criado para este usuário.' });
    }

    const newStatus = await Status.create({
      rank: 'F',
      nivel: 1,
      proximo_nivel: 10, 
      xp_faltante: 100, 
      total_xp: 0,
      ouro: 0,
      pd: 0,
      id_usuario: userID
    });

    res.status(201).json(newStatus);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar status.', error: error.message });
  }
};

const getStatusByUser = async (req, res) => {
  const { userID } = req.params;

  try {
    const status = await Status.findAll({ where: { id_usuario: userID } });

    if (!status.length) {
      return res.status(404).json({ message: 'Status não encontrado.' });
    }

    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar status.', error: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  const { userID } = req.params;

  try {
    const userStatus = await Status.findOne({ where: { id_usuario: userID } });

    if (!userStatus) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

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
      levelsToNextRank = 0;
    }

    userStatus.setDataValue('nextRank', nextRank);
    userStatus.setDataValue('levelsToNextRank', levelsToNextRank);

    const leaderboard = await Status.findAll({ order: [['nivel', 'DESC']], limit: 5 });

    const leaderboardWithNames = await Promise.all(
      leaderboard.map(async (status) => {
        const user = await User.findOne({ where: { id: status.id_usuario } });

        return {
          nome_usuario: user ? user.nome_usuario : 'Usuário desconhecido',
          nivel: status.nivel,
          rank: status.rank,
        };
      })
    );

    res.status(200).json({ userStatus, leaderboard: leaderboardWithNames });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar o leaderboard.', error: error.message });
  }
};

module.exports = { createStatus, getStatusByUser, getLeaderboard };
