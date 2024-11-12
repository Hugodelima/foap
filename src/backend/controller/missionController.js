const Mission = require('../models/mission');
const Penalty = require('../models/penalty');

const createMission = async (req, res) => {
  try {
    const { titulo, rank, prazo, dificuldade, penalidades, userId } = req.body;

    if (!penalidades || !Array.isArray(penalidades) || penalidades.length === 0) {
      return res.status(400).json({ message: "O campo penalidades é obrigatório e deve ser um array com pelo menos uma penalidade." });
    }

    let xpReward = 100;
    let goldReward = 50;
    let pdReward = 10;

    // Criar a missão
    const mission = await Mission.create({
      titulo,
      rank,
      prazo,
      dificuldade,
      recompensaXp: xpReward,
      recompensaOuro: goldReward,
      recompensaPd: pdReward,
      status: 'Em progresso',
      userId,
    });

    // Cria penalidades associadas à missão
    const createdPenalties = await Penalty.bulkCreate(
      penalidades.map(penalty => ({
        ...penalty,
        missionId: mission.id // Vincula cada penalidade à missão criada
      }))
    );

    res.status(201).json({ message: 'Missão criada com sucesso', mission, penalties: createdPenalties });
  } catch (error) {
    console.error("Erro ao criar missão:", error);
    res.status(400).json({ error: error.message || "Erro desconhecido ao criar a missão" });
  }
};

module.exports = { createMission };
