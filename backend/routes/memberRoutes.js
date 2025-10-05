const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const controller = require('../controllers/memberController');

router.get('/', controller.getAllMembers);
router.get('/stats', controller.getStats);
router.get('/:id', controller.getMemberById);

router.post('/', verifyToken, upload.single('image'), controller.createMember);
router.put('/:id', verifyToken, (req, res, next) => {
    upload.single('image')(req, res, function (err) {
        if (err) return res.status(400).json({ message: err.message || 'Upload failed' });
        controller.updateMember(req, res).catch(next);
    });
});

router.delete('/:id', verifyToken, controller.deleteMember);

// 🔥 Bulk reorder within a pin
router.put('/reorder/bulk', verifyToken, controller.bulkReorder);
router.put('/:id/toggle', verifyToken, controller.toggleMember);


module.exports = router;
