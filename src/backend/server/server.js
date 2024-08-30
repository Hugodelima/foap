require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const sequelize = require('../models/database');
const { Op } = require('sequelize');
const User = require('../models/user');
const Verification = require('../models/verification');

const app = express();
app.use(cors());
app.use(bodyParser.json());

sequelize.sync({ alter: true })
    .then(() => console.log('Tabelas sincronizadas com o banco de dados'))
    .catch(err => console.error('Erro ao sincronizar com o banco de dados:', err));

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const hashPassword = (password, salt) => {
    const hash = crypto.createHmac('sha256', salt);
    hash.update(password);
    return hash.digest('hex');
};

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ 
            where: {
                [Op.or]: [{ nome_usuario: username }, { email }]
            }
        });

        if (existingUser) {
            if (existingUser.nome_usuario === username) {
                return res.status(400).json({ message: 'Nome de usuário já cadastrado.' });
            } else if (existingUser.email === email) {
                return res.status(400).json({ message: 'E-mail já cadastrado.' });
            }
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = hashPassword(password, salt);

        const newUser = await User.create({ 
            nome_usuario: username, 
            email, 
            senha: hashedPassword, 
            salt 
        });

        const userId = newUser.id;
        const verificationCode = generateVerificationCode();
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 2);

        await Verification.create({ user_id: userId, codigo: verificationCode, expiracao: expiration });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Código de Verificação de Email',
            text: `Seu código de verificação é: ${verificationCode}. Este código expira em 2 minutos.`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).json({ message: 'Erro ao enviar o e-mail de verificação.' });
            }
            res.status(200).json({ message: 'Usuário registrado e e-mail de verificação enviado!', userID: userId });
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar o usuário.', error: error.message });
    }
});

app.post('/send-verification-email', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const userId = user.id;
        await Verification.destroy({ where: { user_id: userId } });

        const verificationCode = generateVerificationCode();
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 2);

        await Verification.create({ user_id: userId, codigo: verificationCode, expiracao: expiration });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Código de Verificação de Email',
            text: `Seu código de verificação é: ${verificationCode}. Este código expira em 2 minutos.`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).json({ message: 'Erro ao enviar o e-mail de verificação.' });
            }
            res.status(200).json({ message: 'Código enviado com sucesso!' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuário.', error: error.message });
    }
});

app.post('/verify', async (req, res) => {
    const { userID, verificationCode } = req.body;

    try {
        const verification = await Verification.findOne({
            where: {
                user_id: userID,
                codigo: verificationCode,
                expiracao: { [Op.gt]: new Date() }
            }
        });

        if (!verification) {
            return res.status(400).json({ message: 'Código inválido ou expirado.' });
        }

        await User.update({ verificado: true }, { where: { id: userID } });
        await Verification.destroy({ where: { user_id: userID } });

        res.status(200).json({ message: 'Email verificado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao verificar o código.', error: error.message });
    }
});

app.post('/resend-verification-code', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const userId = user.id;
        const verificationCode = generateVerificationCode();
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 2);

        await Verification.create({ user_id: userId, codigo: verificationCode, expiracao: expiration });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Código de Verificação de Email',
            text: `Seu código de verificação é: ${verificationCode}. Este código expira em 2 minutos.`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).json({ message: 'Erro ao enviar o e-mail de verificação.' });
            }
            res.status(200).json({ message: 'Código reenviado com sucesso!' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuário.', error: error.message });
    }
});

const generateVerificationCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000);
    return code.toString();
};

app.get('/users/:userID', async (req, res) => {
    const { userID } = req.params;

    try {
        const user = await User.findByPk(userID);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuário.', error: error.message });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
