const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'members',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [
            { width: 1000, height: 1000, crop: 'limit' }, // ลดขนาดไฟล์
            { quality: 'auto' } // optimize quality
        ],
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // จำกัดขนาดไฟล์ที่ 5MB
    },
    fileFilter: (req, file, cb) => {
        // ตรวจสอบ mime type
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

module.exports = upload;
