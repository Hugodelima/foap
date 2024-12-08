const express = require('express');
const router = express.Router();
const {createMission, allMission, deleteMission, completeMission, expireMission, checkAndDuplicateDailyMissions} = require('../controller/missionController');


router.post('/create', createMission);
router.get('/:userId', allMission);
router.delete('/delete/:id', deleteMission)
router.put('/complete/:id', completeMission)
router.put('/expire/:id', expireMission);
router.get('/check-daily-missions/:user_id', checkAndDuplicateDailyMissions);


module.exports = router;
