const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {
    registerUser,
    getUserById,
    getUserIdByEmail,
    loginUser,
    resetPassword
} = require('../controllers/userController');

const router = express.Router();
router.use(cors());
router.use(bodyParser.json());

router.post('/register', registerUser);
router.get('/users/:id', getUserById);
router.get('/:email', getUserIdByEmail);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);

module.exports = router;
