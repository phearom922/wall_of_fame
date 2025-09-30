const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'members',
        allowed_formats: ['jpg', 'png'],
    },
});

const upload = multer({ storage });

module.exports = upload;
