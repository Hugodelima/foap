const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const Verification = require('../models/verification');
const User = require('../models/user');
require('dotenv').config();

// Função para gerar um código de 6 dígitos aleatório
const generateVerificationCode = () => Math.floor(1000 + Math.random() * 9000).toString();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = (email, subject, text) => {
    const mailOptions = { from: process.env.EMAIL_USER, to: email, subject, text };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Erro ao enviar o e-mail:", err);
            throw new Error('Erro ao enviar o e-mail.');
        }
        console.log('E-mail enviado:', info.response);
    });
};

const generateVerificationCodeForUser = async (req, res) => {
    const { userId } = req.params;

    try {
        if (!userId) return res.status(400).json({ message: 'ID do usuário é obrigatório.' });

        const verificationCode = generateVerificationCode();
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 2);

        await Verification.create({ id_usuario: userId, codigo: verificationCode, expiracao: expiration, tipo: 'verificacao_email' });

        res.status(200).json({ message: 'Código de verificação criado com sucesso!', codigo: verificationCode });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao gerar o código de verificação.', error: error.message });
    }
};

const getVerificationExpiration = async (req, res) => {
    const { userID } = req.params;

    try {
        const verification = await Verification.findOne({
            where: { id_usuario: userID, tipo: 'verificacao_email' },
            order: [['expiracao', 'DESC']]
        });

        if (!verification) return res.status(404).json({ message: 'Código de verificação não encontrado.' });

        const timeLeft = Math.max(0, verification.expiracao - new Date());

        res.status(200).json({ timeLeft });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar a expiração do código.', error: error.message });
    }
};

const verifyCode = async (req, res) => {
    const { userID, verificationCode } = req.body;

    try {
        const verification = await Verification.findOne({
            where: { id_usuario: userID, codigo: verificationCode, expiracao: { [Op.gt]: new Date() }, tipo: 'verificacao_email' }
        });

        if (!verification) return res.status(400).json({ message: 'Código inválido ou expirado.' });

        await User.update({ verificado: true }, { where: { id: userID } });
        await Verification.destroy({ where: { id_usuario: userID, tipo: 'verificacao_email' } });

        res.status(200).json({ message: 'Email verificado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao verificar o código.', error: error.message });
    }
};

const resendVerificationCode = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

        await Verification.destroy({ where: { id_usuario: user.id, tipo: 'verificacao_email' } });

        const verificationCode = generateVerificationCode();
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 2);

        await Verification.create({ id_usuario: user.id, codigo: verificationCode, expiracao: expiration, tipo: 'verificacao_email' });

        sendEmail(email, 'Código de Verificação de Email', `Seu código de verificação é: ${verificationCode}. Este código expira em 2 minutos.`);

        res.status(200).json({ message: 'Código reenviado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao reenviar o código de verificação.', error: error.message });
    }
};

const resendForgotPasswordCode = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email, verificado: true } });
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado ou não verificado.' });

        await Verification.destroy({ where: { id_usuario: user.id, tipo: 'resetar_senha_email' } });

        const verificationCode = generateVerificationCode();
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 2);

        await Verification.create({ id_usuario: user.id, codigo: verificationCode, expiracao: expiration, tipo: 'resetar_senha_email' });

        sendEmail(email, 'Código de Redefinição de Senha', `Seu código de redefinição de senha é: ${verificationCode}. Este código expira em 2 minutos.`);

        res.status(200).json({ message: 'Código reenviado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao reenviar o código de redefinição de senha.', error: error.message });
    }
};

const verifyForgotPasswordCode = async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

        const verification = await Verification.findOne({
            where: { id_usuario: user.id, codigo: verificationCode, expiracao: { [Op.gt]: new Date() }, tipo: 'resetar_senha_email' }
        });

        if (!verification) return res.status(400).json({ message: 'Código inválido ou expirado.' });

        await Verification.destroy({ where: { id_usuario: user.id, tipo: 'resetar_senha_email' } });

        res.status(200).json({ message: 'Validado as Informações com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao verificar o código.', error: error.message });
    }
};

module.exports = {
    generateVerificationCodeForUser,
    getVerificationExpiration,
    verifyCode,
    resendVerificationCode,
    resendForgotPasswordCode,
    verifyForgotPasswordCode
};
