const express = require('express');
const router = express.Router();
const {createMission, allMission} = require('../controller/missionController')


router.post('/create', createMission);
router.get('/:userId', allMission);

module.exports = router;
