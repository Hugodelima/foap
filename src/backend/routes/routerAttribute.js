const express = require('express');
const router = express.Router();
const Attribute = require('../models/attribute');

// Rota para criar um novo atributo
router.post('/create', async (req, res) => {
    const { nome, valor, tipo, user_id } = req.body;

    if (!nome || !tipo || !user_id) {
        return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    try {
        const newAttribute = await Attribute.create({ nome, valor, tipo, user_id });
        res.status(201).json({ attribute: newAttribute, message: 'Atributo criado com sucesso.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Rota para buscar os atributos de um usuário
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const attributes = await Attribute.findAll({
            where: { user_id: userId },
        });

        res.status(200).json(attributes);
    } catch (error) {
        console.error('Erro ao buscar atributos:', error);
        res.status(500).json({ error: 'Erro ao buscar atributos.' });
    }
});


router.put('/:userID', async (req, res) => {
    const { userID } = req.params;
    const { attributeId, operation } = req.body;
  
    try {
      const attribute = await Attribute.findOne({ where: { id: attributeId, user_id: userID } });
  
      if (!attribute) {
        return res.status(404).json({ message: 'Atributo não encontrado.' });
      }
  
      if (operation === 'increment') {
        attribute.valor += 1;
      } else if (operation === 'decrement' && attribute.valor > 0) {
        attribute.valor -= 1;
      }
  
      await attribute.save();
      res.status(200).json(attribute);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar atributo.', error: error.message });
    }
});
  

// Rota para deletar um atributo
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const attribute = await Attribute.findByPk(id);

        if (!attribute) {
            return res.status(404).json({ error: 'Atributo não encontrado.' });
        }

        await attribute.destroy();
        res.status(200).json({ message: 'Atributo excluído com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir atributo:', error);
        res.status(500).json({ error: 'Erro ao excluir atributo.' });
    }
});

module.exports = router;
