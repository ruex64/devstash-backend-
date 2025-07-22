const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

const { 
    createComponent, 
    getComponents, 
    getComponentById,
    updateComponent,
    deleteComponent
} = require('../controllers/componentController');
const { protect } = require('../middleware/authMiddleware');

// The base path for these routes is /api/components

// GET /api/components - Get all components. Can also handle search via query params (e.g., /api/components?keyword=react)
// POST /api/components - Create a new component. This route is protected and requires a user to be logged in.
// The `upload.single('image')` middleware intercepts the request to upload the image file to Cloudinary.
// 'image' must match the `name` attribute of the file input field on the frontend form.
router.route('/')
    .get(getComponents)
    .post(protect, upload.single('image'), createComponent);

// GET /api/components/:id - Get a single component by its ID. This is a public route.
// PUT /api/components/:id - Update a component. Protected route. The controller logic will verify if the user is the owner or an admin.
// DELETE /api/components/:id - Delete a component. Protected route. The controller logic will verify if the user is the owner or an admin.
router.route('/:id')
    .get(getComponentById)
    .put(protect, upload.single('image'), updateComponent)
    .delete(protect, deleteComponent);

module.exports = router;
