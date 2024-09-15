const express = require('express');
const router = express.Router();
const Penalty = require('../models/penalty');

router.post('/create', async (req, res) => {
    try {
        const penalty = await Penalty.create(req.body);
        res.status(201).json(penalty);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
