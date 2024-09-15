const express = require('express');
const router = express.Router();
const Reward = require('../models/reward');

router.post('/create', async (req, res) => {
    try {
        const reward = await Reward.create(req.body);
        res.status(201).json(reward);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
