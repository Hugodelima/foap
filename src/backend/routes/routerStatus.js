const express = require('express');
const router = express.Router();
const Status = require('../models/status');
const User = require('../models/user');

// Criar o status do cliente
router.post('/create/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    // Verifica se o status já existe para o usuário
    const existingStatus = await Status.findOne({ where: { id_usuario: userID } });

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
      id_usuario: userID
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
    let status = await Status.findOne({ where: { id_usuario: userID } });

    if (!status) {
      return res.status(404).json({ message: 'Status não encontrado.' });
    }

    // Certifica-se de que está retornando o status
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar ou criar status.', error: error.message });
  }
});

module.exports = router;
