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
    const { titulo, rank, prazo, dificuldade, penalidadeIds, id_usuario, repeticao } = req.body;

    if (!id_usuario) {
      return res.status(400).json({ error: 'O campo id_usuario é obrigatório.' });
    }

    let prazoFinal;
    if (repeticao === 'Diariamente') {
      const now = new Date();
      now.setUTCHours(27, 59, 59, 999); // Ajuste para Cuiabá (-4 UTC)
      prazoFinal = now.toISOString();
    } else {
      prazoFinal = new Date(`${prazo}T00:00:00-04:00`); // Ajusta para Cuiabá (-4 UTC)
      prazoFinal.setHours(23, 59, 59, 999);
      prazoFinal = prazoFinal.toISOString();
    }

    // Calcula o prazo mínimo (60% do prazo total)
    const prazoDate = new Date(prazoFinal);
    const now = new Date();
    const totalMilliseconds = prazoDate.getTime() - now.getTime();
    const minExecutionMilliseconds = totalMilliseconds * 0.6;
    const prazoMinimoDate = new Date(now.getTime() + minExecutionMilliseconds);
    const prazoMinimo = prazoMinimoDate.toISOString();

    // Calcula recompensas com base na dificuldade e rank
    const { recompensaXp: valorXp, recompensaOuro: valorOuro, recompensaPd: valorPd } = calcularRecompensas(dificuldade, rank);

    // Cria a missão
    const novaMissao = await Mission.create({
      titulo,
      rank,
      prazo: prazoFinal,
      prazoMinimo,  
      iniciado: false,  
      dificuldade,
      valorXp,
      valorOuro,
      valorPd,
      situacao: 'Em progresso',
      repeticao: repeticao === 'Diariamente' ? 'Diariamente' : 'Nunca',
      id_usuario,
    });

    // Valida se as penalidades existem
    if (!Array.isArray(penalidadeIds) || penalidadeIds.length === 0) {
      return res.status(400).json({ error: 'O campo penalidadeIds deve ser um array não vazio.' });
    }

    const penalidadesExistentes = await Penalty.findAll({
      where: { id: penalidadeIds },
    });

    if (penalidadesExistentes.length === 0) {
      return res.status(400).json({ error: 'Nenhuma penalidade encontrada com os IDs fornecidos.' });
    }

    // Associa penalidades à missão
    await Promise.all(
      penalidadesExistentes.map(async (penalidade) => {
        penalidade.id_missao = novaMissao.id;
        await penalidade.save();
      })
    );

    return res.status(201).json({
      message: 'Missão criada com sucesso!',
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
        as: 'Penalidades',
        required: false,
      },
      attributes: {
        include: [
          [
            sequelize.literal(`
              (SELECT JSON_AGG("penalties"."titulo")
               FROM "Penalidades" AS "penalties"
               WHERE "penalties"."id_missao" = "Mission"."id")`),
            'penaltyTitles'
          ],
          [
            sequelize.literal(`
              (SELECT COUNT(*)
               FROM "Penalidades" AS "penalties"
               WHERE "penalties"."id_missao" = "Mission"."id")`),
            'penaltyCount'
          ]
        ]
        
      },
    });

    res.json(missions);
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
};

const getDailyMissionsPenalties = async (req, res) => {
  try {
    const dailyMissions = await Mission.findAll({
      where: {
        id_usuario: req.params.userId,
        repeticao: 'Diariamente',
      },
      include: {
        model: Penalty,
        as: 'Penalidades',
        required: false,
      },
      attributes: {
        include: [
          [
            sequelize.literal(`
              (SELECT JSON_AGG("penalties"."titulo")
               FROM "Penalidades" AS "penalties"
               WHERE "penalties"."id_missao" = "Mission"."id")`),
            'penaltyTitles'
          ],
          [
            sequelize.literal(`
              (SELECT COUNT(*)
               FROM "Penalidades" AS "penalties"
               WHERE "penalties"."id_missao" = "Mission"."id")`),
            'penaltyCount'
          ]
        ]
      },
    });

    res.json(dailyMissions);
  } catch (error) {
    console.error('Error fetching daily missions:', error);
    res.status(500).json({ error: 'Failed to fetch daily missions' });
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
      include: [{ model: Penalty, as: 'Penalidades' }],
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

    // Atualização de nível e rank conforme a lógica do leaderboard
    while (userStatus.xp_faltante <= 0) {
      userStatus.nivel += 1;
      userStatus.proximo_nivel = Math.round(100 * Math.pow(1.5, userStatus.nivel - 1));
      userStatus.xp_faltante += userStatus.proximo_nivel;
    }

    // Ajustando o rank do usuário para seguir o mesmo padrão do leaderboard
    if (userStatus.nivel < 10) {
      userStatus.rank = 'F';
    } else if (userStatus.nivel < 50) {
      userStatus.rank = 'E';
    } else if (userStatus.nivel < 100) {
      userStatus.rank = 'D';
    } else if (userStatus.nivel < 200) {
      userStatus.rank = 'C';
    } else if (userStatus.nivel < 300) {
      userStatus.rank = 'B';
    } else if (userStatus.nivel < 400) {
      userStatus.rank = 'A';
    } else {
      userStatus.rank = 'SSS';
    }

    // Ajustar o XP faltante corretamente
    userStatus.xp_faltante = userStatus.proximo_nivel - (userStatus.total_xp % userStatus.proximo_nivel);

    // Atualização das penalidades associadas à missão
    const penalties = mission.Penalidades; // Corrigido para usar o alias correto
    if (penalties && penalties.length > 0) {
      for (const penalty of penalties) {
        if (penalty.situacao !== 'Concluída') {
          penalty.situacao = 'Concluída';
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
  const { id_usuario } = req.body;

  try {
    // Busca missão com as penalidades associadas
    const mission = await Mission.findByPk(id, {
      include: [{ model: Penalty, as: 'Penalidades' }], // Use o alias correto
    });

    if (!mission) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }

    if (mission.situacao !== 'Em progresso') {
      return res.status(400).json({ error: 'Apenas missões em progresso podem ser expiradas.' });
    }

    // Buscar as penalidades associadas à missão
    const penalties = mission.Penalidades;
    if (!penalties || penalties.length === 0) {
      return res.status(400).json({ error: 'Nenhuma penalidade vinculada à missão.' });
    }

    // Buscar usuário e status do usuário
    const userStatus = await Status.findOne({ where: { id_usuario: id_usuario } });
    if (!userStatus) {
      return res.status(404).json({ error: 'Status do usuário não encontrado.' });
    }

    // Alterar o status da missão
    mission.situacao = 'Não finalizada';
    await mission.save(); // 🔴 Removendo a transação daqui

    // Atualizar penalidades e status do usuário
    for (const penalty of penalties) {
      if (penalty.situacao === 'Pendente') {
        penalty.situacao = 'Em andamento'; // Alterar penalidade para "Em andamento"
        await penalty.save(); 

        // Atualizar status do usuário
        userStatus.ouro -= penalty.perdaOuro;
        userStatus.pd -= penalty.perdaXp;
      }
    }

    // Salvar mudanças no status do usuário
    await userStatus.save(); 

    return res.status(200).json({ message: 'Missão expirada e penalidades aplicadas com sucesso.' });
  } catch (error) {
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
        id_usuario: userId 
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
  let { prazo, situacao, titulo, dificuldade, rank, penalidadeIds, repeticao } = req.body;

  try {
    const mission = await Mission.findByPk(id, {
      include: [{ model: Penalty, as: 'Penalidades' }]
    });

    if (!mission) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }

    if (titulo) mission.titulo = titulo;
    dificuldade ? mission.dificuldade = dificuldade : dificuldade = mission.dificuldade;
    rank ? mission.rank = rank : rank = mission.rank;
    if (situacao) mission.situacao = situacao;

    let prazoFinal;
    if (repeticao === 'Diariamente') {
      const now = new Date();
      now.setUTCHours(27, 59, 59, 999); // Cuiabá timezone
      prazoFinal = new Date(now).toISOString();
      mission.repeticao = 'Diariamente';
    } else if (prazo) {
      let prazoInput = new Date(prazo);
      prazoInput.setUTCHours(27, 59, 59, 999); // Cuiabá timezone
      prazoFinal = prazoInput.toISOString();
    }

    if (prazoFinal) mission.prazo = prazoFinal;
    
    const { recompensaXp, recompensaOuro, recompensaPd } = calcularRecompensas(dificuldade, rank);
    mission.valorXp = recompensaXp;
    mission.valorOuro = recompensaOuro;
    mission.valorPd = recompensaPd;

    if (repeticao === 'Diariamente') {
      mission.situacao = 'Em progresso';
    }

    // Atualiza os IDs das penalidades
    if (penalidadeIds && Array.isArray(penalidadeIds)) {
      const penalidades = await Penalty.findAll({ where: { id: penalidadeIds } });
      await mission.setPenalidades(penalidades);
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
        id_usuario: userId,
        situacao: 'Finalizada',
        atualizado_em: {
          [Op.between]: [
            today.clone().subtract(6, 'days').toDate(), // 7 dias atrás
            endOfToday.toDate(), // Fim do dia atual
          ],
        },
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('atualizado_em')), 'date'], // Retorna apenas a data (sem a hora)
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'], // Conta as missões por dia
      ],
      group: [sequelize.fn('DATE', sequelize.col('atualizado_em'))],
      order: [[sequelize.fn('DATE', sequelize.col('atualizado_em')), 'ASC']], // Ordena as missões por data ascendente
    });

    // Agora buscamos o histórico de missões do usuário para verificar se as missões foram concluídas
    const missionHistory = await MissionHistoryDiary.findAll({
      where: {
        id_usuario: userId,
        prazoAtualizado: { // Alterei para prazoAtualizado, pois é a data de conclusão da missão
          [Op.between]: [
            today.clone().subtract(6, 'days').toDate(), // 7 dias atrás
            endOfToday.toDate(), // Fim do dia atual
          ],
        },
        completado: true, // Garantir que a missão foi completada
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('prazoAtualizado')), 'date'], // Coluna que armazena a data de conclusão
        [sequelize.fn('COUNT', sequelize.col('id_missao')), 'count'], // Conta as missões do histórico
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

    

    res.status(200).json({ missionsPerDay });

  } catch (error) {
    console.error('Erro ao buscar missões dos últimos 7 dias:', error);
    res.status(500).json({ error: 'Erro ao buscar missões.' });
  }
};

const getUserMissionsByStatusLast7Days = async (req, res) => {
  const { userId } = req.params;

  try {
    const sevenDaysAgo = moment().subtract(6, 'days').startOf('day').toDate();
    const endOfToday = moment().endOf('day').toDate();

    // Busca missões regulares
    const missions = await Mission.findAll({
      where: {
        id_usuario: userId,
        atualizado_em: {
          [Op.between]: [sevenDaysAgo, endOfToday],
        },
      },
    });

    // Busca missões diárias
    const dailyMissions = await MissionHistoryDiary.findAll({
      where: {
        id_usuario: userId,
        atualizado_em: {
          [Op.between]: [sevenDaysAgo, endOfToday],
        },
      },
    });

    const missionData = {
      total: missions.length + dailyMissions.length,
      finalizadas: [],
      emProgresso: [],
      naoFinalizadas: [],
    };

    [...missions, ...dailyMissions].forEach((mission) => {
      switch (mission.situacao) {
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

    res.status(200).json(missionData);
  } catch (error) {
    console.error('Erro ao buscar missões do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar missões do usuário.' });
  }
};

const getTotalXpGainedPerDay = async (req, res) => {
  const { id: userId } = req.params;
  const today = moment().endOf('day');
  const sevenDaysAgo = moment().subtract(7, 'days').startOf('day');

  try {
    const missions = await Mission.findAll({
      where: {
        id_usuario: userId,
        situacao: 'Finalizada',
        criado_em: {
          [Op.between]: [sevenDaysAgo.toDate(), today.toDate()],
        },
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('criado_em')), 'date'],
        [sequelize.fn('SUM', sequelize.col('valorXp')), 'totalXp'],
      ],
      group: [sequelize.fn('DATE', sequelize.col('criado_em'))],
      order: [[sequelize.fn('DATE', sequelize.col('criado_em')), 'ASC']],
    });

    const missionHistory = await MissionHistoryDiary.findAll({
      where: {
        id_usuario: userId,
        completado: true,
        criado_em: {
          [Op.between]: [sevenDaysAgo.toDate(), today.toDate()],
        },
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('criado_em')), 'date'],
        [sequelize.fn('SUM', sequelize.col('valorXp')), 'totalXp'],
      ],
      group: [sequelize.fn('DATE', sequelize.col('criado_em'))],
      order: [[sequelize.fn('DATE', sequelize.col('criado_em')), 'ASC']],
    });

    let totalXpPerDay = {};

    missions.forEach((mission) => {
      const { date, totalXp } = mission.get();
      totalXpPerDay[date] = (totalXpPerDay[date] || 0) + parseInt(totalXp, 10);
    });

    missionHistory.forEach((history) => {
      const { date, totalXp } = history.get();
      totalXpPerDay[date] = (totalXpPerDay[date] || 0) + parseInt(totalXp, 10);
    });

    const labels = [];
    const xpData = [];
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      labels.push(moment(date).format('DD/MM'));
      xpData.push(totalXpPerDay[date] || 0);
    }

    res.status(200).json({ data: { labels, datasets: [{ data: xpData }] } });
  } catch (error) {
    console.error('Erro ao buscar XP ganho nos últimos 7 dias:', error);
    res.status(500).json({ error: 'Erro ao buscar XP ganho.' });
  }
};

const startMission = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar a missão pelo ID
    const mission = await Mission.findByPk(id);
    if (!mission) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }

    // Verificar se a missão já foi iniciada
    if (mission.iniciado) {
      return res.status(400).json({ error: 'A missão já foi iniciada.' });
    }

    // Registrar a data de início
    const registroInicio = new Date();

    // Calcular prazo mínimo (60% do prazo total)
    const prazoFinal = new Date(mission.prazo);
    const prazoMinimo = new Date(registroInicio.getTime() + (prazoFinal - registroInicio) * 0.6);

    // Atualizar a missão
    mission.iniciado = true;
    mission.registroInicio = registroInicio;
    mission.prazoMinimo = prazoMinimo;

    await mission.save();

    return res.status(200).json({
      message: 'Missão iniciada com sucesso!',
      mission
    });
  } catch (error) {
    console.error('Erro ao iniciar missão:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};




module.exports = { createMission, allMission, deleteMission, completeMission, expireMission, getDailyMissions, updateMission, getCompletedMissionsLast7Days, getUserMissionsByStatusLast7Days, getTotalXpGainedPerDay, getDailyMissionsPenalties, startMission};