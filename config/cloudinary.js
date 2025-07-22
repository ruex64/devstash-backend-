const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with credentials from your .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer-storage-cloudinary
// This tells multer to upload files to your Cloudinary account
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'devstash', // The name of the folder in Cloudinary
        format: async (req, file) => 'png', // Sets the image format to png
        public_id: (req, file) => file.fieldname + '-' + Date.now(), // Creates a unique public ID for the file
    },
});

module.exports = { cloudinary, storage };
