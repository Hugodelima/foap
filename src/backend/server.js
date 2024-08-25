require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configuração do banco de dados SQLite
const db = new sqlite3.Database('database.db'); // Altere para o caminho do seu banco de dados

// Inicializar o banco de dados e criar tabelas
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_usuario TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        verificado INTEGER DEFAULT 0,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS verificacao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        codigo TEXT NOT NULL,
        expiracao TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios (id)
    )`);
});

// Função para gerar um código de verificação
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
};

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Rota para registrar um novo usuário
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send('Todos os campos são obrigatórios.');
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const verificationCode = generateVerificationCode();
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 10);

    // Verificar se o nome de usuário já existe
    db.get('SELECT id FROM usuarios WHERE nome_usuario = ?', [username], (err, row) => {
        if (err) {
            console.error('Erro ao buscar nome de usuário:', err);
            return res.status(500).send('Erro ao verificar nome de usuário.');
        }
        if (row) {
            return res.status(400).json({ error: 'Nome de usuário já está em uso.' });
        }

        // Verificar se o e-mail já existe
        db.get('SELECT id FROM usuarios WHERE email = ?', [email], (err, row) => {
            if (err) {
                console.error('Erro ao buscar e-mail:', err);
                return res.status(500).send('Erro ao verificar e-mail.');
            }
            if (row) {
                return res.status(400).json({ error: 'E-mail já está em uso.' });
            }

            // Inserir o novo usuário
            db.run(`INSERT INTO usuarios (nome_usuario, email, senha) VALUES (?, ?, ?)`, [username, email, hashedPassword], function(err) {
                if (err) {
                    console.error('Erro ao inserir usuário:', err);
                    return res.status(500).send('Erro ao registrar o usuário.');
                }

                const userID = this.lastID;

                db.run(`INSERT INTO verificacao (user_id, codigo, expiracao) VALUES (?, ?, ?)`, [userID, verificationCode, expirationTime.toISOString()], (err) => {
                    if (err) {
                        console.error('Erro ao inserir verificação:', err);
                        return res.status(500).send('Erro ao criar código de verificação.');
                    }

                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: 'Código de Verificação',
                        text: `Seu código de verificação é: ${verificationCode}`
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error('Erro ao enviar e-mail:', error);
                            return res.status(500).send('Erro ao enviar e-mail');
                        }
                        console.log('E-mail enviado:', info.response);
                        res.status(200).json({ userID });
                    });
                });
            });
        });
    });
});



// Rota para verificar o código de verificação
app.post('/verify', (req, res) => {
    const { userId, verificationCode } = req.body;

    if (!userId || !verificationCode) {
        return res.status(400).send('Todos os campos são obrigatórios.');
    }

    db.get(`SELECT * FROM verificacao WHERE user_id = ? AND codigo = ? AND expiracao > ?`, [userId, verificationCode, new Date().toISOString()], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao verificar código');
        }
        if (row) {
            db.run('UPDATE usuarios SET verificado = 1 WHERE id = ?', [userId], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Erro ao atualizar o status de verificação.');
                }
                res.status(200).send('Código verificado com sucesso');
            });
        } else {
            res.status(400).send('Código de verificação inválido ou expirado');
        }
    });
});

// Rota para reenviar o código de verificação
app.post('/resend-verification-code', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send('O e-mail é obrigatório.');
    }

    const verificationCode = generateVerificationCode();
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 10); // Código válido por 10 minutos

    db.get(`SELECT id FROM usuarios WHERE email = ?`, [email], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao buscar usuário.');
        }
        if (!row) {
            return res.status(404).send('Usuário não encontrado.');
        }

        const userId = row.id;

        db.run(`INSERT INTO verificacao (user_id, codigo, expiracao) VALUES (?, ?, ?)`, [userId, verificationCode, expirationTime.toISOString()], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erro ao gerar novo código');
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Código de Verificação',
                text: `Seu novo código de verificação é: ${verificationCode}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Erro ao enviar e-mail:', error);
                    return res.status(500).send('Erro ao enviar e-mail');
                }
                console.log('E-mail enviado:', info.response);
                res.status(200).send('Novo código de verificação enviado com sucesso');
            });
        });
    });
});

// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
