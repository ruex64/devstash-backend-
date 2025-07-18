const express = require("express");
const router = express.Router();
const { getUserProfile, updateProfile } = require("../controllers/userController");
const { verifyAccessToken } = require("../middleware/auth");

// Public route to fetch user profile by slug (username)
router.get("/:slug", getUserProfile);

// Private route to update own profile
router.put("/profile", verifyAccessToken, updateProfile);

module.exports = router;
