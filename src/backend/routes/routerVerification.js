const express = require('express');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const Verification = require('../models/verification');
const User = require('../models/user');
require('dotenv').config()


const router = express.Router();

// Função para gerar um código de 6 dígitos aleatório
const generateVerificationCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000);
    return code.toString();
};

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post('/generate/:userId', async (req, res) => {
    const { userId } = req.params;


    try {
        if (!userId) {
            return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
        }

        const verificationCode = generateVerificationCode();
        const expiration = new Date()
        expiration.setMinutes(expiration.getMinutes() + 2); // Código expira em 2 minutos

        // Criar um novo código de verificação
        await Verification.create({
            id_usuario: userId,
            codigo: verificationCode,
            expiracao: expiration,
            tipo: 'verificacao_email'
        });

        res.status(200).json({ message: 'Código de verificação criado com sucesso!', codigo: verificationCode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao gerar o código de verificação.', error });
    }
});

router.get('/verification-expiration/:userID', async (req, res) => {
    const { userID } = req.params;

    try {
        const verification = await Verification.findOne({
            where: {
                id_usuario: userID,
                tipo: 'verificacao_email'
            },
            order: [['expiracao', 'DESC']]
        });

        if (!verification) {
            return res.status(404).json({ message: 'Código de verificação não encontrado.' });
        }

        const currentTime = new Date();
        const timeLeft = verification.expiracao - currentTime;

        res.status(200).json({ timeLeft: timeLeft > 0 ? timeLeft : 0 });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar a expiração do código.', error: error.message });
    }
});

router.post('/verify', async (req, res) => {
    console.log('fsdgdsfgf')
    const { userID, verificationCode } = req.body;

    try {
        const verification = await Verification.findOne({
            where: {
                id_usuario: userID,
                codigo: verificationCode,
                expiracao: { [Op.gt]: new Date() },
                tipo: 'verificacao_email'
            }
        });

        if (!verification) {
            return res.status(400).json({ message: 'Código inválido ou expirado.' });
        }

        await User.update({ verificado: true }, { where: { id: userID } });
        await Verification.destroy({ where: { id_usuario: userID, tipo: 'verificacao_email' } });

        res.status(200).json({ message: 'Email verificado com sucesso!' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erro ao verificar o código.', error: error.message });
    }
});

router.post('/resend-verification-code', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const userId = user.id;

        await Verification.destroy({
            where: { id_usuario: userId, tipo: 'verificacao_email' }
        });

        const verificationCode = generateVerificationCode();
        const expiration = new Date();
        console.log(expiration)
        expiration.setMinutes(expiration.getMinutes() + 2);

        await Verification.create({
            id_usuario: userId,
            codigo: verificationCode,
            expiracao: expiration,
            tipo: 'verificacao_email'
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Código de Verificação de Email',
            text: `Seu código de verificação é: ${verificationCode}. Este código expira em 2 minutos.`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Erro ao enviar o e-mail:", err);
                return res.status(500).json({ message: 'Erro ao enviar o e-mail de verificação.' });
            }
            console.log('E-mail enviado:', info.response);
        });

        res.status(200).json({ message: 'Código reenviado com sucesso!' });
    } catch (error) {
        console.error("Erro ao reenviar o código de verificação:", error);
        res.status(500).json({ message: 'Erro no servidor.', error: error.message });
    }
});

router.post('/resend-forgot-password-code', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email, verificado: true } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado ou não verificado.' });
        }

        const userId = user.id;

        await Verification.destroy({
            where: { id_usuario: userId, tipo: 'resetar_senha_email' }
        });

        const verificationCode = generateVerificationCode();
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 2);

        await Verification.create({
            id_usuario: userId,
            codigo: verificationCode,
            expiracao: expiration,
            tipo: 'resetar_senha_email'
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Código de Redefinição de Senha',
            text: `Seu código de redefinição de senha é: ${verificationCode}. Este código expira em 2 minutos.`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Erro ao enviar o e-mail:", err);
                return res.status(500).json({ message: 'Erro ao enviar o e-mail de redefinição de senha.' });
            }
            console.log('E-mail enviado:', info.response);
        });

        res.status(200).json({ message: 'Código reenviado com sucesso!' });
    } catch (error) {
        console.error("Erro ao reenviar o código de redefinição de senha:", error);
        res.status(500).json({ message: 'Erro no servidor.', error: error.message });
    }
});

router.post('/verify-forgot-password', async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const verification = await Verification.findOne({
            where: {
                id_usuario: user.id,
                codigo: verificationCode,
                expiracao: { [Op.gt]: new Date() },
                tipo: 'resetar_senha_email'
            }
        });

        if (!verification) {
            return res.status(400).json({ message: 'Código inválido ou expirado.' });
        }

        res.status(200).json({ message: 'Validado as Informações com sucesso' });
        await Verification.destroy({ where: { id_usuario: user.id, tipo: 'resetar_senha_email' } });
        
    } catch (error) {
        console.error("Erro ao verificar o código:", error);
        res.status(400).send({ message: 'Código inválido ou expirado.' });
    }
});

router.post('/generate/reset/:userId', async (req, res) => {
    const { userId } = req.params;
    const { email } = req.body

    try {

        if (userId) {
            const verificationCode = generateVerificationCode();

            await Verification.destroy({
                where: { id_usuario: userId, tipo: 'resetar_senha_email' }
            });

            await Verification.create({ id_usuario: userId, codigo: verificationCode, expiracao: new Date(new Date().getTime() + 2 * 60000), tipo: 'resetar_senha_email' });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Código de Redefinição de Senha',
                text: `Seu código de verificação é: ${verificationCode}. Este código expira em 2 minutos.`,
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error("Erro ao enviar o e-mail:", err);
                    return res.status(500).json({ message: 'Erro ao enviar o e-mail de verificação.' });
                }
                console.log('E-mail enviado:', info.response);
            });
            res.status(200).json({ message: 'E-mail encontrado com sucesso.' });
        } else {
            res.status(404).json({ message: 'E-mail não encontrado ou não está verificado.' });
        }
    } catch (error) {
        console.error("Erro ao encontrar o usuário:", error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
});
module.exports = router;
