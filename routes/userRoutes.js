const express = require('express');
const router = express.Router();
const { 
    getUsers, 
    updateUserRole, 
    getUserProfile,
    updateUserProfile
} = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// The base path for these routes is /api/users

// --- Admin Routes ---
// GET /api/users - Get all users (requires admin privileges)
router.route('/').get(protect, isAdmin, getUsers);

// PUT /api/users/:id/role - Update a specific user's role (requires admin privileges)
router.route('/:id/role').put(protect, isAdmin, updateUserRole);

// --- Authenticated User Routes ---
// PUT /api/users/profile - Update the logged-in user's own profile (bio, socials, etc.)
router.route('/profile').put(protect, updateUserProfile);

// --- Public Routes ---
// GET /api/users/:id/profile - Get a specific user's public profile and their components
router.route('/:id/profile').get(getUserProfile);

module.exports = router;
