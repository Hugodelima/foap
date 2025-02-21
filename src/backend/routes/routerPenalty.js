const express = require('express');
const router = express.Router();
const penaltyController = require('../controllers/penaltyController');

router.post('/create', penaltyController.createPenalty);
router.get('/:id_usuario', penaltyController.getPenaltiesByUser);
router.delete('/delete/:id', penaltyController.deletePenalty);
router.put('/update/:id', penaltyController.updatePenalty);
router.put('/overcome/:id', penaltyController.overcomePenalty);
router.put('/reset/:id_missao', penaltyController.resetPenaltiesByMission);
router.put('/update-multiple', penaltyController.updateMultiplePenalties);
router.get('/all/:id_usuario', penaltyController.getAllPenalties);

module.exports = router;
