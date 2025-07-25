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

        // Obter o usuário para pegar o email
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

        const verificationCode = generateVerificationCode();
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 2);

        // Criar o registro de verificação
        await Verification.create({ 
            id_usuario: userId, 
            codigo: verificationCode, 
            expiracao: expiration, 
            tipo: 'verificacao_email' 
        });

        // Enviar o email com o código
        sendEmail(
            user.email,
            'Código de Verificação de Email',
            `Seu código de verificação é: ${verificationCode}. Este código expira em 2 minutos.`
        );

        res.status(200).json({ 
            message: 'Código de verificação criado e enviado com sucesso!', 
            codigo: verificationCode 
        });
    } catch (error) {
        console.error("Erro no generateVerificationCodeForUser:", error);
        res.status(500).json({ 
            message: 'Erro ao gerar e enviar o código de verificação.', 
            error: error.message 
        });
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
    console.log('fdf')
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

const generateResetPasswordCode = async (req, res) => {
    const { userId } = req.params;
    const { email } = req.body;

    try {
        if (!userId || !email) return res.status(400).json({ message: 'ID de usuário e e-mail são obrigatórios.' });

        const user = await User.findOne({ where: { id: userId, email } });
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado ou e-mail inválido.' });

        const verificationCode = generateVerificationCode();

        // Deleta códigos de redefinição anteriores
        await Verification.destroy({ where: { id_usuario: userId, tipo: 'resetar_senha_email' } });

        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 2); // Código expira em 2 minutos

        // Cria o novo código de verificação
        await Verification.create({
            id_usuario: userId,
            codigo: verificationCode,
            expiracao: expiration,
            tipo: 'resetar_senha_email'
        });

        sendEmail(
            email,
            'Código de Redefinição de Senha',
            `Seu código de verificação é: ${verificationCode}. Este código expira em 2 minutos.`
        );

        res.status(200).json({ message: 'Código de redefinição de senha gerado e enviado com sucesso!' });
    } catch (error) {
        console.error("Erro ao gerar código de redefinição de senha:", error);
        res.status(500).json({ message: 'Erro ao gerar o código de redefinição de senha.', error: error.message });
    }
};


const getverificationexpiration =  async (req, res) => {
    try {
        const { userID } = req.query;
        const verification = await Verification.findOne({
            where: { id_usuario: userID, tipo: 'verificacao_email' },
            order: [['expiracao', 'DESC']]
        });

        if (!verification) {
            return res.status(404).json({ message: 'Código não encontrado', timeLeft: 0 });
        }

        const timeLeft = Math.max(0, verification.expiracao - new Date());
        res.status(200).json({ timeLeft });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar expiração', error: error.message });
    }
};

const getforgotpasswordexpiration = async (req, res) => {
    try {
        const { email } = req.query;
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado', timeLeft: 0 });
        }

        const verification = await Verification.findOne({
            where: { id_usuario: user.id, tipo: 'resetar_senha_email' },
            order: [['expiracao', 'DESC']]
        });

        if (!verification) {
            return res.status(404).json({ message: 'Código não encontrado', timeLeft: 0 });
        }

        const timeLeft = Math.max(0, verification.expiracao - new Date());
        res.status(200).json({ timeLeft });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar expiração', error: error.message });
    }
};


module.exports = {
    generateVerificationCodeForUser,
    getVerificationExpiration,
    verifyCode,
    resendVerificationCode,
    resendForgotPasswordCode,
    verifyForgotPasswordCode,
    generateResetPasswordCode,
    getverificationexpiration,
    getforgotpasswordexpiration
};
