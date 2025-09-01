# 🎮 Foap – Transformando Tarefas em Conquistas

Aplicativo mobile gamificado que transforma tarefas cotidianas em missões com recompensas, penalidades e progresso visual. Desenvolvido como TCC no curso de Análise e Desenvolvimento de Sistemas (IFMS – Campus Nova Andradina).

> **Objetivo:** Aumentar o engajamento de jovens com atividades rotineiras por meio da gamificação.

---

## 📱 Disponível na Play Store

[![Disponível na Google Play](https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white)](https://play.google.com/store/apps/details?id=com.hizup.foap)

**📥 Download:** [https://play.google.com/store/apps/details?id=com.hizup.foap](https://play.google.com/store/apps/details?id=com.hizup.foap)

---

## 📽️ Demonstração

- 🔗 Vídeo do Projeto

https://github.com/user-attachments/assets/3d7a9609-ce8c-42f3-8d14-7de3cc8f38d9

- 🎨 [Protótipo no Figma](https://www.figma.com/design/HvWcCZSI5wI9gxxP3tz8LE/Foap--Copy-?node-id=0-1)

---

## ✨ Funcionalidades

- ✅ Cadastro com verificação de e-mail
- 📌 Criação de missões e missões diárias
- ⛔ Aplicação de penalidades em caso de não cumprimento
- 🏆 Sistema de recompensas, conquistas e medalhas
- 📊 Dashboard com gráficos de progresso semanais
- 🥇 Ranking entre usuários por nível
- 🔐 Criptografia de senhas via SHA-256

---

## 🧰 Tecnologias Utilizadas

**Frontend Mobile**
<p> 
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native"> 
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"> 
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"> 
</p>

**Backend & Infra**
<p> 
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"> 
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express"> 
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"> 
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"> 
</p>

**Ferramentas & Serviços**
<p> 
  <img src="https://img.shields.io/badge/Render-000000?style=for-the-badge&logo=render&logoColor=white" alt="Render"> 
  <img src="https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white" alt="Figma"> 
  <img src="https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white" alt="Sequelize"> 
</p>

---

## ⚙️ Como Rodar o Projeto

### 🧪 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- Git

### 🚀 Passo a Passo

1. **Clone o repositório:**

```bash
git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/Hugodelima/foap.git)
cd foap
```

2. **Crie o arquivo .env com as variáveis:**
```bash
EMAIL_USER=XXXX@gmail.com
EMAIL_PASS=XXXX

DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAMEDATABASE=foap
DB_HOST=localhost
DB_DIALECT=postgres
FIXED_SALT=dfgdfgdfg2423432

API_URL=http://192.168.0.105:3000
PORT=3000
```

3. **Suba o banco de dados com Docker:**
```bash
docker-compose up -d
```

4. **Instale as dependências:**
```bash
npm install
```

5. **Inicie o servidor:**
```bash
npm start
```

---

## 📊 Avaliação e Resultados

### ✅ Métricas de Aceitação

| Métrica               | Valor     | Classificação |
|-----------------------|-----------|---------------|
| **SUS Score**         | 77.9 / 100 | ⭐⭐⭐⭐         |
| **Utilidade Percebida** | 4.21 / 5   | ⭐⭐⭐⭐⭐        |
| **Facilidade de Uso** | 4.48 / 5   | ⭐⭐⭐⭐⭐        |

---

### 💬 Feedback dos Usuários

> 💬 *"O Foap transformou minhas tarefas chatas em desafios divertidos!"*

> 💬 *"A sensação de completar uma missão e ganhar recompensas é viciante!"*

> 💬 *"O sistema de medalhas me motiva a manter minha rotina diária."*

---

## 🚧 Melhorias Futuras

- 🔔 Sistema de notificações para lembretes  
- 📚 Tutorial interativo para novos usuários  
- 📱 Versão para iOS  

---

## 👨‍💻 Autor e Orientação

**Hugo Rodrigues de Lima**  
Tecnólogo em Análise e Desenvolvimento de Sistemas  
IFMS - Campus Nova Andradina  

**Orientador:** Prof. Me. Renato de Souza Garcia  

<div align="center">
  <a href="https://github.com/seu-usuario">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <a href="https://www.linkedin.com/in/seu-perfil">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
  <a href="mailto:hugo.lima2@estudante.ifms.edu.br">
    <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email">
  </a>
</div>

<p align="center"><em>"Transformando obrigações diárias em conquistas memoráveis"</em></p>
