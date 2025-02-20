const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

router.post('/create/:userID', statusController.createStatus);
router.get('/:userID', statusController.getStatusByUser);
router.get('/leaderboard/:userID', statusController.getLeaderboard);

module.exports = router;
