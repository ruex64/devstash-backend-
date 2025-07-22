const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    googleLogin, 
    forgotPassword, 
    resetPassword 
} = require('../controllers/authController');

// @route   /api/auth
router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
