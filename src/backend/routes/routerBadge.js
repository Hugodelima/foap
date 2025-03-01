const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');

router.post('/create', badgeController.createBadge);
router.get('/:id_usuario', badgeController.getBadgesByUser);
router.put('/update/:badgeId', badgeController.updateBadge);
router.delete('/delete/:badgeId', badgeController.deleteBadge);
router.post('/assign/:id', badgeController.assignBadge);

module.exports = router;
