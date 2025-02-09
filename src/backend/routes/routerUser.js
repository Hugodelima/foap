require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const { Op } = require('sequelize');


const User = require('../models/user');
const Verification = require('../models/verification');

const router = express.Router();
router.use(cors());
router.use(bodyParser.json());

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


router.post('/register', async (req, res) => {
    const { nome_usuario, email, senha } = req.body;

    try {
        // Verificar se o usuário já existe
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

        // Hash da senha
        const hashedPassword = hashPassword(senha);

        // Criar usuário no banco de dados
        const newUser = await User.create({
            nome_usuario,
            email,
            senha: hashedPassword
        });

        // Retornar ID do usuário para que o frontend possa chamar a rota de verificação
        res.status(200).json({ message: 'Usuário registrado com sucesso!', userID: newUser.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao registrar o usuário.', error });
    }
});


/* router.post('/send-verification-email', async (req, res) => {
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
}); */

router.get('/users/:id', async (req, res) => {
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
});

router.get('/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({where: { email }});
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(200).json(user.id);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuário.', error: error.message });
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

        //res.json({userID: user.id });
        res.status(200).json({ message: 'Usuário logado com sucesso!', userID: user.id });
    } catch (error) {
        console.error("Erro durante o login:", error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
});

/* router.post('/forgot-password', async (req, res) => {
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
}); */

router.post('/reset-password', async (req, res) => {
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
});



module.exports = router;