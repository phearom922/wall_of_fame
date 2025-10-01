const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const uploadPinLogo = require('../middleware/uploadPinLogo');
const ctrl = require('../controllers/pinController');

// public
router.get('/', ctrl.listPins);
router.get('/:id', ctrl.getPin);

// admin
router.post('/', verifyToken, uploadPinLogo.single('logo'), ctrl.createPin);
router.put('/reorder', verifyToken, ctrl.reorderPins);
router.put('/:id', verifyToken, uploadPinLogo.single('logo'), ctrl.updatePin);
router.delete('/:id', verifyToken, ctrl.deletePin);

module.exports = router;
