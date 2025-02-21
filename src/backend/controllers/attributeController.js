const Attribute = require('../models/attribute');
const Status = require('../models/status');

const createAttribute = async (req, res) => {
    const { nome, valor, tipo, icone, id_usuario } = req.body;

    if (!nome || !tipo || !id_usuario) {
        return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    try {
        const newAttribute = await Attribute.create({ nome, valor, tipo, icone, id_usuario });
        res.status(201).json({ attribute: newAttribute, message: 'Atributo criado com sucesso.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getUserAttributes = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const attributes = await Attribute.findAll({ where: { id_usuario } });
        res.status(200).json(attributes);
    } catch (error) {
        console.error('Erro ao buscar atributos:', error);
        res.status(500).json({ error: 'Erro ao buscar atributos.' });
    }
};

const updateAttributeValue = async (req, res) => {
    const { id_usuario } = req.params;
    const { attributeId, operation } = req.body;

    try {
        const attribute = await Attribute.findOne({ where: { id: attributeId, id_usuario } });
        if (!attribute) {
            return res.status(404).json({ message: 'Atributo não encontrado.' });
        }

        const status = await Status.findOne({ where: { id_usuario } });
        if (!status) {
            return res.status(404).json({ message: 'Status não encontrado.' });
        }

        if (operation === 'increment') {
            if (status.pd > 0) {
                attribute.valor += 1;
                status.pd -= 1; // Diminui os pontos disponíveis
            } else {
                return res.status(400).json({ message: 'Pontos insuficientes.' });
            }
        } else if (operation === 'decrement' && attribute.valor > 0) {
            attribute.valor -= 1;
            status.pd += 1; // Devolve o ponto disponível ao usuário
        }

        await attribute.save();
        await status.save(); // Salva a atualização do status

        res.status(200).json({ attribute, status });
    } catch (error) {
        console.error('Erro ao atualizar atributo:', error);
        res.status(500).json({ message: 'Erro ao atualizar atributo.', error: error.message });
    }
};

const deleteAttribute = async (req, res) => {
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
};

module.exports = {
    createAttribute,
    getUserAttributes,
    updateAttributeValue,
    deleteAttribute
};
