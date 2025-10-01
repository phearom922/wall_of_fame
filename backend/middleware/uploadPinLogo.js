const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'pin-logos',
        allowed_formats: ['png', 'jpg', 'jpeg', 'webp', 'svg'],
        transformation: [{ quality: 'auto' }],
    },
});

module.exports = multer({ storage });
