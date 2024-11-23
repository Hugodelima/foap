const express = require('express');
const router = express.Router();
const {createMission, allMission, deleteMission, completeMission} = require('../controller/missionController');


router.post('/create', createMission);
router.get('/:userId', allMission);
router.delete('/delete/:id', deleteMission)
router.put('/complete/:id', completeMission)

module.exports = router;
