const express = require('express');
const router = express.Router();
const missionHistoryDiaryController = require('../controllers/missionHistoryDiaryController');

router.post('/create', missionHistoryDiaryController.createMissionHistory);
router.get('/:id_usuario', missionHistoryDiaryController.getMissionHistoryByUser);
router.get('/daily-missions', missionHistoryDiaryController.getDailyMissions);

module.exports = router;
