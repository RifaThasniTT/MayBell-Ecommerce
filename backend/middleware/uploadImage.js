const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'product_images',
        format: async (req, file) => 'png',
        public_id: (req, file) => `${Date.now()}-${file.originalname}`,
        transformation: [
            {
                width: 600,
                height: 600,
                crop: 'thumb', 
                gravity: 'auto'
            }
        ]
    }
});

const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp/;
    const extname = fileTypes.test(file.originalname.toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        if (!extname) {
            return cb(new Error('Invalid file extension! Please upload a valid image.'));
        } else if (!mimetype) {
            return cb(new Error('Invalid file type! Please upload an image.'));
        }
    }
};

const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;