const express = require('express');
const router = express.Router();
const { createMission, allMission, deleteMission, completeMission, expireMission, getDailyMissions, updateMission, getCompletedMissionsLast7Days } = require('../controller/missionController');

router.post('/create', createMission);
router.get('/:userId', allMission);
router.delete('/delete/:id', deleteMission)
router.put('/complete/:id', completeMission)
router.put('/expire/:id', expireMission);
router.get('/daily-missions/:userId', getDailyMissions)
router.put('/update/:id', updateMission);
router.get('/complete/last7days/:id',getCompletedMissionsLast7Days);

module.exports = router;