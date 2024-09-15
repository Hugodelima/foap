const express = require('express');
const router = express.Router();
const Category = require('../models/category');

router.post('/create', async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
