const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const sequelize = require('../models/database');
const User = require('../models/user');
const Verification = require('../models/verification');

const router = express.Router();
router.use(cors());
router.use(bodyParser.json());

const dbFuso = process.env.DB_FUSO || 'America/Cuiaba';
const jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const FIXED_SALT = 'fixedsalt1234567890'; // Exemplo de salt fixo

sequelize.sync({ alter: true })
    .then(() => console.log('Tabelas sincronizadas com o banco de dados no fuso horário:', dbFuso))
    .catch(err => console.error('Erro ao sincronizar com o banco de dados:', err));

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateVerificationCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000);
    return code.toString();
};

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

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Token não fornecido.' });

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido.' });
        req.user = user;
        next();
    });
};

router.post('/register', async (req, res) => {
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

        const hashedPassword = hashPassword(password);

        const newUser = await User.create({
            nome_usuario: username,
            email,
            senha: hashedPassword
        });

        const userId = newUser.id;
        const verificationCode = generateVerificationCode();
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 2);

        await Verification.create({ user_id: userId, codigo: verificationCode, expiracao: expiration, tipo: 'email_verification' });

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
            console.log('E-mail enviado:', info.response);
        });

        res.status(200).json({ message: 'Usuário registrado e e-mail de verificação enviado!', userID: userId });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar o usuário.', error: error.message });
    }
});

router.post('/send-verification-email', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const userId = user.id;
        await Verification.destroy({ where: { user_id: userId, tipo: 'email_verification' } });

        const verificationCode = generateVerificationCode();
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 2);

        await Verification.create({ user_id: userId, codigo: verificationCode, expiracao: expiration, tipo: 'email_verification' });

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
            console.log('E-mail enviado:', info.response);
        });

        res.status(200).json({ message: 'Código enviado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuário.', error: error.message });
    }
});

router.post('/verify', async (req, res) => {
    const { userID, verificationCode } = req.body;

    try {
        const verification = await Verification.findOne({
            where: {
                user_id: userID,
                codigo: verificationCode,
                expiracao: { [Op.gt]: new Date() },
                tipo: 'email_verification'
            }
        });

        if (!verification) {
            return res.status(400).json({ message: 'Código inválido ou expirado.' });
        }

        await User.update({ verificado: true }, { where: { id: userID } });
        await Verification.destroy({ where: { user_id: userID, tipo: 'email_verification' } });

        res.status(200).json({ message: 'Email verificado com sucesso!' });
    } catch (error) {
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
            where: { user_id: userId, tipo: 'email_verification' }
        });

        const verificationCode = generateVerificationCode();
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 2);

        await Verification.create({
            user_id: userId,
            codigo: verificationCode,
            expiracao: expiration,
            tipo: 'email_verification'
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

router.get('/users/:userID', async (req, res) => {
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

router.get('/verification-expiration/:userID', async (req, res) => {
    const { userID } = req.params;

    try {
        const verification = await Verification.findOne({
            where: {
                user_id: userID,
                tipo: 'email_verification'
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

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Email não encontrado.' });
        }

        if (!user.verificado) {
            return res.status(403).json({ message: 'Conta não verificada. Verifique seu e-mail para ativar sua conta.' });
        }

        const isPasswordValid = verifyPassword(password, user.senha);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Senha incorreta.' });
        }

        const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });

        res.json({ token, userID: user.id });
    } catch (error) {
        console.error("Erro durante o login:", error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const userId = user.id;
        await Verification.destroy({ where: { user_id: userId, tipo: 'reset_password' } });

        const verificationCode = generateVerificationCode();
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 2);

        await Verification.create({
            user_id: userId,
            codigo: verificationCode,
            expiracao: expiration,
            tipo: 'reset_password'
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Código de Redefinição de Senha',
            text: `Seu código de redefinição de senha é: ${verificationCode}. Este código expira em 2 minutos.`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).json({ message: 'Erro ao enviar o código de redefinição de senha.' });
            }
            console.log('E-mail enviado:', info.response);
        });

        res.status(200).json({ message: 'Código de redefinição de senha enviado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao enviar o código de redefinição de senha.', error: error.message });
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
                user_id: user.id,
                codigo: verificationCode,
                expiracao: { [Op.gt]: new Date() },
                tipo: 'reset_password'
            }
        });

        if (!verification) {
            return res.status(400).json({ message: 'Código inválido ou expirado.' });
        }

        res.status(200).json({ message: 'Validado as Informações com sucesso' });
        await Verification.destroy({ where: { user_id: user.id, tipo: 'reset_password' } });
        
    } catch (error) {
        console.error("Erro ao verificar o código:", error);
        res.status(400).send({ message: 'Código inválido ou expirado.' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).send({ message: 'Usuário não encontrado.' });
        }

        user.senha = hashPassword(newPassword);
        await user.save();

        res.status(200).send();
    } catch (error) {
        console.error("Erro ao redefinir a senha:", error);
        res.status(500).send({ message: 'Erro no servidor.' });
    }
});

router.post('/find-user', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email, verificado: true } });

        if (user) {
            const verificationCode = generateVerificationCode();

            await Verification.destroy({
                where: { user_id: user.id, tipo: 'reset_password' }
            });

            await Verification.create({ user_id: user.id, codigo: verificationCode, expiracao: new Date(new Date().getTime() + 2 * 60000), tipo: 'reset_password' });

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

router.post('/resend-forgot-password-code', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email, verificado: true } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado ou não verificado.' });
        }

        const userId = user.id;

        await Verification.destroy({
            where: { user_id: userId, tipo: 'reset_password' }
        });

        const verificationCode = generateVerificationCode();
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 2);

        await Verification.create({
            user_id: userId,
            codigo: verificationCode,
            expiracao: expiration,
            tipo: 'reset_password'
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

module.exports = router;