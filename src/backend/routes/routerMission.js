const express = require('express');
const router = express.Router();
const { createMission, allMission, deleteMission, completeMission, expireMission, getDailyMissions, updateMission, getCompletedMissionsLast7Days, getUserMissionsByStatusLast7Days, getTotalXpGainedPerDay, getDailyMissionsPenalties, startMission } = require('../controllers/missionController');

router.post('/create', createMission);
router.get('/:userId', allMission);
router.delete('/delete/:id', deleteMission)
router.put('/complete/:id', completeMission)
router.put('/expire/:id', expireMission);
router.get('/daily-missions/:userId', getDailyMissions)
router.get('/daily-missions-penalties/:userId', getDailyMissionsPenalties)
router.put('/update/:id', updateMission);
router.get('/complete/last7days/:id',getCompletedMissionsLast7Days);
router.get('/status/last7days/:userId', getUserMissionsByStatusLast7Days);
router.get('/xp/last7days/:id',getTotalXpGainedPerDay);
router.put('/start/:id', startMission);


module.exports = router;