const Mission = require('../models/mission');
const Penalty = require('../models/penalty');
const Status = require('../models/status')
const User = require('../models/user')
const sequelize = require('../models/database');
const { Op, fn, col } = require('sequelize');
const MissionHistoryDiary = require('../models/missionHistoryDiary');
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
    const { titulo, rank, prazo, dificuldade, penalidadeIds, userId, repeticao } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'O campo userId é obrigatório.' });
    }

    let prazoFinal;

    if (repeticao === 'Diariamente') {
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      const offset = -4 * 60;
      const localTime = new Date(now.getTime() + offset * 60000);
      prazoFinal = localTime.toISOString();
    } else {
      prazoFinal = new Date(prazo).toISOString();
    }

    console.log("prazo enviado:", prazo);
    console.log("repeticao:", repeticao);
    console.log("prazoFinal ajustado:", prazoFinal);

    const { recompensaXp, recompensaOuro, recompensaPd } = calcularRecompensas(dificuldade, rank);

    const novaMissao = await Mission.create({
      titulo,
      rank,
      prazo: prazoFinal,
      dificuldade,
      valorXp: recompensaXp,
      valorOuro: recompensaOuro,
      valorPd: recompensaPd,
      situacao: 'Em progresso',
      repeticao: repeticao || 'Nunca',
      id_usuario: userId,
    });

    if (!Array.isArray(penalidadeIds) || penalidadeIds.length === 0) {
      return res.status(400).json({ error: 'O campo penalidadeIds deve ser um array não vazio.' });
    }

    const penalidadesExistentes = await Penalty.findAll({ where: { id: penalidadeIds } });

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
      where: { id_usuario: req.params.userId },
      include: {
        model: Penalty,
        as: 'Penalties',
        required: false,
      },
      attributes: {
        include: [
          [
            sequelize.literal(`
              (SELECT JSON_AGG("penalties"."titulo")
               FROM "Penalties" AS "penalties"
               WHERE "penalties"."id_missao" = "Mission"."id")`),
            'penaltyTitles'
          ],
          [
            sequelize.literal(`
              (SELECT COUNT(*)
               FROM "Penalties" AS "penalties"
               WHERE "penalties"."id_missao" = "Mission"."id")`),
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
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const mission = await Mission.findByPk(id, {
      include: [{ model: Penalty, as: 'Penalties' }],
    });

    if (!mission) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }

    if (mission.situacao === 'Finalizada') {
      return res.status(400).json({ error: 'Missão já foi concluída.' });
    }

    mission.situacao = 'Finalizada';
    await mission.save();

    const userStatus = await Status.findOne({ where: { id_usuario: userId } });

    if (!userStatus) {
      return res.status(404).json({ error: 'Status do usuário não encontrado.' });
    }

    userStatus.total_xp += mission.valorXp;
    userStatus.xp_faltante -= mission.valorXp;
    userStatus.ouro += mission.valorOuro;
    userStatus.pd += mission.valorPd;

    while (userStatus.xp_faltante <= 0) {
      userStatus.nivel += 1;
      userStatus.proximo_nivel = Math.round(100 * Math.pow(1.5, userStatus.nivel - 1));
      userStatus.xp_faltante += userStatus.proximo_nivel;

      if (userStatus.nivel < 10) userStatus.rank = 'F';
      else if (userStatus.nivel < 50) userStatus.rank = 'E';
      else if (userStatus.nivel < 100) userStatus.rank = 'D';
      else if (userStatus.nivel < 200) userStatus.rank = 'C';
      else if (userStatus.nivel < 300) userStatus.rank = 'B';
      else if (userStatus.nivel < 400) userStatus.rank = 'A';
      else userStatus.rank = 'SSS';
    }

    userStatus.xp_faltante = userStatus.proximo_nivel - (userStatus.total_xp % userStatus.proximo_nivel);

    const penalties = mission.Penalties;
    if (penalties && penalties.length > 0) {
      for (const penalty of penalties) {
        if (penalty.status !== 'Concluída') {
          penalty.status = 'Concluída';
          await penalty.save();
        }
      }
    }

    await userStatus.save();

    res.status(200).json({
      message: 'Missão concluída com sucesso, penalidades atualizadas.',
      userStatus,
    });
  } catch (error) {
    console.error('Erro ao concluir missão:', error);
    res.status(500).json({ error: 'Erro ao concluir a missão.' });
  }
};


const expireMission = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const transaction = await sequelize.transaction();
  try {
    // Busca missão com as penalidades associadas
    const mission = await Mission.findByPk(id, {
      include: [{ model: Penalty, as: 'Penalties' }], // Use o alias correto
    });

    if (!mission) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }

    if (mission.status !== 'Em progresso') {
      return res.status(400).json({ error: 'Apenas missões em progresso podem ser expiradas.' });
    }

    // Buscar as penalidades associadas à missão
    const penalties = mission.Penalties;
    if (!penalties || penalties.length === 0) {
      return res.status(400).json({ error: 'Nenhuma penalidade vinculada à missão.' });
    }

    // Buscar usuário e status do usuário
    const userStatus = await Status.findOne({ where: { user_id: userId } });
    if (!userStatus) {
      return res.status(404).json({ error: 'Status do usuário não encontrado.' });
    }

    // Alterar o status da missão
    mission.status = 'Não finalizada';
    await mission.save({ transaction });

    // Atualizar penalidades e status do usuário
    for (const penalty of penalties) {
      if (penalty.status === 'Pendente') {
        penalty.status = 'Em andamento'; // Alterar penalidade para "Em andamento"
        await penalty.save({ transaction });

        // Atualizar status do usuário
        userStatus.ouro -= penalty.perdaOuro;
        userStatus.pd -= penalty.perdaXp;
      }
    }

    // Salvar mudanças no status do usuário
    await userStatus.save({ transaction });

    // Finalizar transação
    await transaction.commit();

    return res.status(200).json({ message: 'Missão expirada e penalidades aplicadas com sucesso.' });
  } catch (error) {
    // Reverter transação em caso de erro
    await transaction.rollback();
    console.error('Erro ao expirar missão:', error);
    return res.status(500).json({ error: 'Erro ao expirar missão.' });
  }
};

const getDailyMissions = async (req, res) => {
  const { userId } = req.params; // Obtém o userId dos parâmetros da URL

  try {

    const dailyMissions = await Mission.findAll({
      where: {
        repeticao: 'Diariamente',
        user_id: userId 
      }
    });

    res.status(200).json(dailyMissions);
  } catch (error) {
    console.error('Erro ao buscar missões diárias:', error);
    res.status(500).json({ message: 'Erro ao buscar missões diárias.' });
  }
};

const updateMission = async (req, res) => {
  const { id } = req.params;
  const { prazo, situacao, titulo, dificuldade, rank, penalidadeIds, repeticao } = req.body;

  try {
    console.log("Dados recebidos para atualização de missão:", req.body);

    const mission = await Mission.findByPk(id);

    if (!mission) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }

    if (titulo) mission.titulo = titulo;
    if (dificuldade) mission.dificuldade = dificuldade;
    if (rank) mission.rank = rank;
    if (situacao) mission.situacao = situacao;

    let prazoFinal;
    if (repeticao === 'Diariamente') {
      const now = new Date();
      now.setHours(23 - 4, 59, 59, 999);
      prazoFinal = new Date(now).toISOString();
      mission.repeticao = 'Diariamente';
    } else if (prazo) {
      prazoFinal = new Date(prazo).toISOString();
    }

    if (prazoFinal) mission.prazo = prazoFinal;

    console.log("Missão após atualização:", mission);

    const { recompensaXp, recompensaOuro, recompensaPd } = calcularRecompensas(dificuldade, rank);
    mission.valorXp = recompensaXp;
    mission.valorOuro = recompensaOuro;
    mission.valorPd = recompensaPd;

    if (repeticao === 'Diariamente') {
      mission.situacao = 'Em progresso';
    }

    await mission.save();
    return res.status(200).json({ message: 'Missão atualizada com sucesso!' });
  } catch (error) {
    console.error("Erro ao atualizar missão:", error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getCompletedMissionsLast7Days = async (req, res) => {
  const { id: userId } = req.params;
  const today = moment().startOf('day'); // Início do dia atual
  const endOfToday = moment().endOf('day'); // Fim do dia atual

  try {
    // Buscar missões no modelo 'Mission' com status 'Finalizada' e a data de atualização nos últimos 7 dias
    const missions = await Mission.findAll({
      where: {
        user_id: userId,
        status: 'Finalizada',
        updatedAt: {
          [Op.between]: [
            today.clone().subtract(6, 'days').toDate(), // 7 dias atrás
            endOfToday.toDate(), // Fim do dia atual
          ],
        },
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('updatedAt')), 'date'], // Retorna apenas a data (sem a hora)
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'], // Conta as missões por dia
      ],
      group: [sequelize.fn('DATE', sequelize.col('updatedAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('updatedAt')), 'ASC']], // Ordena as missões por data ascendente
    });

    // Agora buscamos o histórico de missões do usuário para verificar se as missões foram concluídas
    const missionHistory = await MissionHistoryDiary.findAll({
      where: {
        userId: userId,
        prazoAtualizado: { // Alterei para prazoAtualizado, pois é a data de conclusão da missão
          [Op.between]: [
            today.clone().subtract(6, 'days').toDate(), // 7 dias atrás
            endOfToday.toDate(), // Fim do dia atual
          ],
        },
        completed: true, // Garantir que a missão foi completada
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('prazoAtualizado')), 'date'], // Coluna que armazena a data de conclusão
        [sequelize.fn('COUNT', sequelize.col('missionId')), 'count'], // Conta as missões do histórico
      ],
      group: [sequelize.fn('DATE', sequelize.col('prazoAtualizado'))],
      order: [[sequelize.fn('DATE', sequelize.col('prazoAtualizado')), 'ASC']], // Ordena por data ascendente
    });

    // Combinando as missões do modelo 'Mission' e 'MissionHistoryDiary'
    const missionsPerDay = {};
    for (let i = 6; i >= 0; i--) {
      const date = today.clone().subtract(i, 'days').format('YYYY-MM-DD');
      missionsPerDay[date] = 0; // Inicializa com 0 missões
    }

    // Adicionando missões do modelo 'Mission'
    missions.forEach((mission) => {
      const { date, count } = mission.get();
      if (missionsPerDay.hasOwnProperty(date)) {
        missionsPerDay[date] += parseInt(count, 10); // Soma as missões de 'Mission'
      }
    });

    // Adicionando missões do histórico 'MissionHistoryDiary'
    missionHistory.forEach((history) => {
      const { date, count } = history.get();
      if (missionsPerDay.hasOwnProperty(date)) {
        missionsPerDay[date] += parseInt(count, 10); // Soma as missões do histórico
      }
    });

    console.log(missionsPerDay); // Exibe a contagem final de missões por dia

    res.status(200).json({ missionsPerDay });
  } catch (error) {
    console.error('Erro ao buscar missões dos últimos 7 dias:', error);
    res.status(500).json({ error: 'Erro ao buscar missões.' });
  }
};

const getUserMissionsByStatusLast7Days = async (req, res) => {
  const { userId } = req.params; // Obtém o ID do usuário dos parâmetros da rota
  console.log('pegou a rota certo');

  try {
    // Define o intervalo de 7 dias
    const sevenDaysAgo = moment().subtract(6, 'days').startOf('day').toDate();
    const endOfToday = moment().endOf('day').toDate();

    // Busca todas as missões do usuário dentro dos últimos 7 dias
    const missions = await Mission.findAll({
      where: {
        user_id: userId, // Filtra pelo ID do usuário
        updatedAt: {
          [Op.between]: [sevenDaysAgo, endOfToday], // Apenas missões atualizadas nos últimos 7 dias
        },
      },
    });

    // Inicializa os contadores e categoriza as missões pelo status
    const missionData = {
      total: missions.length,
      finalizadas: [],
      emProgresso: [],
      naoFinalizadas: [],
    };

    missions.forEach((mission) => {
      switch (mission.status) {
        case 'Finalizada':
          missionData.finalizadas.push(mission);
          break;
        case 'Em progresso':
          missionData.emProgresso.push(mission);
          break;
        case 'Não finalizada':
          missionData.naoFinalizadas.push(mission);
          break;
        default:
          break;
      }
    });

    // Retorna os dados no formato estruturado
    res.status(200).json(missionData);
  } catch (error) {
    console.error('Erro ao buscar missões do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar missões do usuário.' });
  }
};
const getTotalXpGainedPerDay = async (req, res) => {
  const { id: userId } = req.params;
  const today = moment().endOf('day'); // Fim do dia de hoje
  const sevenDaysAgo = moment().subtract(7, 'days').startOf('day'); // 7 dias atrás

  try {
    // Buscar as missões finalizadas no modelo 'Mission' nos últimos 7 dias com base no createdAt
    const missions = await Mission.findAll({
      where: {
        user_id: userId,
        status: 'Finalizada',
        createdAt: {
          [Op.between]: [sevenDaysAgo.toDate(), today.toDate()],
        },
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'], // Retorna a data (sem a hora)
        [sequelize.fn('SUM', sequelize.col('recompensaXp')), 'totalXp'], // Soma o XP das missões
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))], // Agrupa por dia
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']], // Ordena por data
    });

    // Buscar o histórico de missões no modelo 'MissionHistoryDiary' nos últimos 7 dias com base no createdAt
    const missionHistory = await MissionHistoryDiary.findAll({
      where: {
        userId: userId,
        completed: true, // Considerando que a missão foi completada
        createdAt: {
          [Op.between]: [sevenDaysAgo.toDate(), today.toDate()],
        },
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'], // Ajustando para 'createdAt'
        [sequelize.fn('SUM', sequelize.col('recompensaXp')), 'totalXp'], // Soma o XP do histórico
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))], // Agrupa por dia
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']], // Ordena por data
    });

    // Combina os resultados das missões e do histórico
    let totalXpPerDay = {}; // Usaremos um objeto para armazenar o XP por dia

    // Adiciona XP das missões
    missions.forEach((mission) => {
      const { date, totalXp } = mission.get();
      totalXpPerDay[date] = totalXpPerDay[date] ? totalXpPerDay[date] + parseInt(totalXp, 10) : parseInt(totalXp, 10);
    });

    // Adiciona XP do histórico
    missionHistory.forEach((history) => {
      const { date, totalXp } = history.get();
      totalXpPerDay[date] = totalXpPerDay[date] ? totalXpPerDay[date] + parseInt(totalXp, 10) : parseInt(totalXp, 10);
    });

    // Agora, precisamos garantir que tenhamos dados para os últimos 7 dias
    const labels = [];
    const xpData = [];
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD'); // Formato YYYY-MM-DD
      labels.push(moment(date).format('DD/MM')); // Formatar como dia/mês
      xpData.push(totalXpPerDay[date] || 0); // Se não houver dados, coloca 0
    }

    res.status(200).json({ data: { labels, datasets: [{ data: xpData }] } });
  } catch (error) {
    console.error('Erro ao buscar XP ganho nos últimos 7 dias:', error);
    res.status(500).json({ error: 'Erro ao buscar XP ganho.' });
  }
};

module.exports = { createMission, allMission, deleteMission, completeMission, expireMission, getDailyMissions, updateMission, getCompletedMissionsLast7Days, getUserMissionsByStatusLast7Days, getTotalXpGainedPerDay};