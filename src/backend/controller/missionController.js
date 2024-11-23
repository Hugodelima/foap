const Mission = require('../models/mission');
const Penalty = require('../models/penalty');
const Status = require('../models/status')
const sequelize = require('../models/database');
const moment = require('moment')

const calcularRecompensas = (dificuldade, rank) => {
  let recompensaXp = 0;
  let recompensaOuro = 0;
  let recompensaPd = 0;

  switch (dificuldade) {
    case 'Fácil':
      recompensaXp = 100;
      recompensaOuro = 50;
      recompensaPd = 1;
      break;
    case 'Médio':
      recompensaXp = 200;
      recompensaOuro = 100;
      recompensaPd = 2;
      break;
    case 'Difícil':
      recompensaXp = 400;
      recompensaOuro = 200;
      recompensaPd = 4;
      break;
    case 'Absurdo':
      recompensaXp = 800;
      recompensaOuro = 400;
      recompensaPd = 8;
      break;
    default:
      throw new Error('Dificuldade inválida');
  }


  switch (rank) {
    case 'F':
      recompensaXp *= 1;
      recompensaOuro *= 1;
      recompensaPd *= 1;
      break;
    case 'E':
      recompensaXp *= 1.1;
      recompensaOuro *= 1.1;
      recompensaPd *= 1.1;
      break;
    case 'D':
      recompensaXp *= 1.2;
      recompensaOuro *= 1.2;
      recompensaPd *= 1.2;
      break;
    case 'C':
      recompensaXp *= 1.4;
      recompensaOuro *= 1.4;
      recompensaPd *= 1.4;
      break;
    case 'B':
      recompensaXp *= 1.6;
      recompensaOuro *= 1.6;
      recompensaPd *= 1.6;
      break;
    case 'A':
      recompensaXp *= 1.8;
      recompensaOuro *= 1.8;
      recompensaPd *= 1.8;
      break;
    case 'S':
      recompensaXp *= 2;
      recompensaOuro *= 2;
      recompensaPd *= 2;
      break;
    case 'SS':
      recompensaXp *= 2.2;
      recompensaOuro *= 2.2;
      recompensaPd *= 2.2;
      break;
    case 'SSS':
      recompensaXp *= 2.4;
      recompensaOuro *= 2.4;
      recompensaPd *= 2.4;
      break;
    case 'SSS+':
      recompensaXp *= 2.6;
      recompensaOuro *= 2.6;
      recompensaPd *= 2.6;
      break;
    default:
      throw new Error('Rank inválido');
  }

  return {
    recompensaXp: Math.round(recompensaXp),
    recompensaOuro: Math.round(recompensaOuro),
    recompensaPd: Math.round(recompensaPd),
  };
};

const createMission = async (req, res) => {
  try {
    const { titulo, rank, prazo, dificuldade, penalidadeIds, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'O campo userId é obrigatório.' });
    }
    if (moment(prazo).isBefore(moment(), 'day')) {
      return res.status(400).json({ error: 'O prazo deve ser hoje ou uma data futura.' });
    }

    const { recompensaXp, recompensaOuro, recompensaPd } = calcularRecompensas(dificuldade, rank);

    const novaMissao = await Mission.create({
      titulo,
      rank,
      prazo,
      dificuldade,
      recompensaXp,
      recompensaOuro,
      recompensaPd,
      status: 'Em progresso',
      user_id: userId,
    });

    if (!Array.isArray(penalidadeIds) || penalidadeIds.length === 0) {
      return res.status(400).json({ error: 'O campo penalidadeIds deve ser um array não vazio.' });
    }

    const penalidadesExistentes = await Penalty.findAll({
      where: {
        id: penalidadeIds,
      },
    });

    

    await novaMissao.setPenalties(penalidadesExistentes);

    return res.status(201).json({
      message: 'Missão criada com sucesso e penalidades vinculadas!',
      mission: novaMissao,
      penalidades: penalidadesExistentes,
    });
  } catch (error) {
    console.error('Erro ao criar missão:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const allMission = async (req, res) => {
  try {
    const missions = await Mission.findAll({
      where: { user_id: req.params.userId },
      include: {
        model: Penalty,
        as: 'Penalties',
        required: false,  // Inclui missões mesmo sem penalidades
      },
      attributes: {
        include: [
          [
            sequelize.literal(`
              (SELECT JSON_AGG("penalties"."titulo")
               FROM "Penalties" AS "penalties"
               WHERE "penalties"."missionId" = "Mission"."id")`),
            'penaltyTitles'
          ],
          [
            sequelize.literal(`
              (SELECT COUNT(*)
               FROM "Penalties" AS "penalties"
               WHERE "penalties"."missionId" = "Mission"."id")`),
            'penaltyCount'
          ]
        ]
      }
    });

    res.json(missions);
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
};


const deleteMission = async (req, res) => {
  const { id } = req.params;

  try {

    if (!id) {
      return res.status(400).json({ error: 'ID da missão não fornecido.' });
    }


    const deletedMission = await Mission.findByPk(id);

    if (!deletedMission) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }

    await deletedMission.destroy()


    return res.status(200).json({ message: 'Missão excluída com sucesso.', mission: deletedMission });
  } catch (error) {
    console.error('Erro ao excluir missão:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const completeMission = async (req, res) => {
  const { id } = req.params; // ID da missão
  const { userId } = req.body; // ID do usuário

  try {
    // Buscar missão
    const mission = await Mission.findByPk(id);

    if (!mission) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }

    if (mission.status === 'Finalizada') {
      return res.status(400).json({ error: 'Missão já foi concluída.' });
    }

    // Atualizar status da missão para "Finalizada"
    mission.status = 'Finalizada';
    await mission.save();

    // Atualizar o status do usuário com as recompensas da missão
    const userStatus = await Status.findOne({ where: { user_id: userId } });

    if (!userStatus) {
      return res.status(404).json({ error: 'Status do usuário não encontrado.' });
    }

    userStatus.xp_faltante -= mission.recompensaXp;
    userStatus.ouro += mission.recompensaOuro;
    userStatus.pd += mission.recompensaPd;

    // Verificar se o usuário subiu de nível
    if (userStatus.xp_faltante <= 0) {
      userStatus.nivel += 1;
      userStatus.xp_faltante += userStatus.proximo_nivel; // Resetar XP faltante com o próximo nível
    }

    await userStatus.save();

    // Atualizar o status das penalidades vinculadas a essa missão para "Concluída"
    const penalties = await Penalty.findAll({
      where: { missionId: mission.id }, // Supondo que a tabela de penalidades tenha um campo missionId
    });

    if (penalties.length > 0) {
      await Promise.all(
        penalties.map(async (penalty) => {
          penalty.status = 'Concluída'; // Atualiza o status da penalidade
          await penalty.save();
        })
      );
    }

    res.status(200).json({
      message: 'Missão concluída com sucesso.',
      userStatus,
    });
  } catch (error) {
    console.error('Erro ao concluir missão:', error);
    res.status(500).json({ error: 'Erro ao concluir a missão.' });
  }
};





module.exports = { createMission, allMission, deleteMission, completeMission };