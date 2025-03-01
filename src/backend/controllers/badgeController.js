const Badge = require('../models/badge');

const createBadge = async (req, res) => {
    try {
        const { titulo, descricao, icone, conquista = false, id_usuario } = req.body;

        const badge = await Badge.create({
            titulo,
            descricao,
            icone,
            conquista,
            id_usuario: JSON.parse(id_usuario)
        });

        res.status(201).json(badge);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getBadgesByUser = async (req, res) => {
    try {
        const badges = await Badge.findAll({
            where: { id_usuario: req.params.id_usuario },
            order: [['criado_em', 'DESC']]
        });

        res.status(200).json(badges);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateBadge = async (req, res) => {
    try {
        const { titulo, descricao, icone, conquista } = req.body;
        const { badgeId } = req.params;

        const badge = await Badge.findByPk(badgeId);
        if (!badge) return res.status(404).json({ error: 'Badge não encontrada.' });

        badge.titulo = titulo || badge.titulo;
        badge.descricao = descricao || badge.descricao;
        badge.icone = icone || badge.icone;
        badge.conquista = conquista !== undefined ? conquista : badge.conquista;
        await badge.save();

        res.status(200).json(badge);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteBadge = async (req, res) => {
    try {
        const { badgeId } = req.params;
        const badge = await Badge.findByPk(badgeId);
        if (!badge) return res.status(404).json({ error: 'Badge não encontrada.' });

        await badge.destroy();
        res.status(200).json({ message: 'Badge deletada com sucesso.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const assignBadge = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_usuario } = req.body;

        const badge = await Badge.findByPk(id);
        if (!badge) return res.status(404).json({ error: 'Badge não encontrada.' });

        badge.id_usuario = id_usuario;
        await badge.save();

        res.status(200).json({ message: 'Badge atribuída com sucesso.', badge });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createBadge, getBadgesByUser, updateBadge, deleteBadge, assignBadge };
