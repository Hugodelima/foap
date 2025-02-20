require('dotenv').config();
const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/user');
const Verification = require('../models/verification');

const FIXED_SALT = process.env.FIXED_SALT;

const hashPassword = (password) => {
    const hash = crypto.createHmac('sha256', FIXED_SALT);
    hash.update(password);
    return hash.digest('hex');
};

const verifyPassword = (password, hashedPassword) => {
    const hash = crypto.createHmac('sha256', FIXED_SALT);
    hash.update(password);
    return hash.digest('hex') === hashedPassword;
};

const registerUser = async (req, res) => {
    const { nome_usuario, email, senha } = req.body;

    try {
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ nome_usuario }, { email }]
            }
        });

        if (existingUser) {
            if (existingUser.nome_usuario === nome_usuario) {
                return res.status(400).json({ message: 'Nome de usuário já cadastrado.' });
            } else if (existingUser.email === email) {
                return res.status(400).json({ message: 'E-mail já cadastrado.' });
            }
        }

        const hashedPassword = hashPassword(senha);
        const newUser = await User.create({ nome_usuario, email, senha: hashedPassword });

        res.status(200).json({ message: 'Usuário registrado com sucesso!', userID: newUser.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao registrar o usuário.', error });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuário.', error: error.message });
    }
};

const getUserIdByEmail = async (req, res) => {
    const { email } = req.params;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(200).json(user.id);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuário.', error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Email não encontrado.' });
        }

        if (!user.verificado) {
            return res.status(403).json({ message: 'Conta não verificada. Verifique seu e-mail para ativar sua conta.' });
        }

        if (!verifyPassword(password, user.senha)) {
            return res.status(400).json({ message: 'Senha incorreta.' });
        }

        res.status(200).json({ message: 'Usuário logado com sucesso!', userID: user.id });
    } catch (error) {
        console.error("Erro durante o login:", error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

const resetPassword = async (req, res) => {
    const { email, nova_senha } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).send({ message: 'Usuário não encontrado.' });
        }

        user.senha = hashPassword(nova_senha);
        await user.save();

        res.status(200).send();
    } catch (error) {
        console.error("Erro ao redefinir a senha:", error);
        res.status(500).send({ message: 'Erro no servidor.' });
    }
};

module.exports = {
    registerUser,
    getUserById,
    getUserIdByEmail,
    loginUser,
    resetPassword
};
