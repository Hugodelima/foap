const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attributeController');

router.post('/create', attributeController.createAttribute);
router.get('/:id_usuario', attributeController.getUserAttributes);
router.put('/:id_usuario', attributeController.updateAttributeValue);
router.delete('/delete/:id', attributeController.deleteAttribute);

module.exports = router;
