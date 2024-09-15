const express = require('express');
const router = express.Router();
const Mission = require('../models/mission');

router.post('/create', async (req, res) => {
    try {
        const mission = await Mission.create(req.body);
        res.status(201).json(mission);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
