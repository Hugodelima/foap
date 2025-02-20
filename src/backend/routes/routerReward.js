const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');

router.post('/create', rewardController.createReward);
router.get('/:id_usuario', rewardController.getRewardsByUser);
router.put('/update/:rewardId', rewardController.updateReward);
router.delete('/delete/:rewardId', rewardController.deleteReward);
router.post('/buy/:id', rewardController.buyReward);

module.exports = router;
