const express = require('express');
const router = express.Router();
const {createMission} = require('../controller/missionController')


router.post('/create', createMission);

module.exports = router;
