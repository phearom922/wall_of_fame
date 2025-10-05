const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const controller = require('../controllers/memberController');






router.get('/', controller.getAllMembers);
router.get('/stats', controller.getStats);
router.get('/:id', controller.getMemberById);

router.post('/', verifyToken, async (req, res, next) => {
    try {
        // 1. Check for duplicate memberId first
        const { memberId } = req.body;
        if (!memberId) {
            return res.status(400).json({
                message: 'Member ID is required',
                field: 'memberId'
            });
        }

        const existingMember = await Member.findOne({ memberId: memberId.trim() });
        if (existingMember) {
            return res.status(409).json({
                message: 'Member ID already exists',
                field: 'memberId'
            });
        }

        // 2. Then handle file upload
        upload.single('image')(req, res, function (err) {
            if (err) {
                return res.status(400).json({
                    message: err.message || 'Upload failed',
                    field: 'image'
                });
            }
            controller.createMember(req, res).catch(next);
        });
    } catch (error) {
        next(error);
    }
});


router.put('/:id', verifyToken, (req, res, next) => {
    upload.single('image')(req, res, function (err) {
        if (err) {
            return res.status(400).json({ message: err.message || 'Upload failed' });
        }
        controller.updateMember(req, res).catch(next);
    });
});


router.delete('/:id', verifyToken, controller.deleteMember);

// 🔥 Bulk reorder within a pin
router.put('/reorder/bulk', verifyToken, controller.bulkReorder);
router.put('/:id/toggle', verifyToken, controller.toggleMember);


module.exports = router;
