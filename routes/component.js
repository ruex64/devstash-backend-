const express = require("express");
const router = express.Router();
const {
  createComponent,
  getAllComponents,
  getComponentBySlug,
  deleteComponent,
  remixComponent,
} = require("../controllers/componentController");

const { verifyAccessToken } = require("../middleware/auth");

// @route   POST /api/components
// @desc    Create a new component (Authenticated)
router.post("/", verifyAccessToken, createComponent);

// @route   GET /api/components
// @desc    Get all components (Public, with optional search via query param)
router.get("/", getAllComponents);

// @route   GET /api/components/:slug
// @desc    Get a single component by slug (Public)
router.get("/:slug", getComponentBySlug);

// @route   DELETE /api/components/:slug
// @desc    Delete a component (Admin or Owner only)
router.delete("/:slug", verifyAccessToken, deleteComponent);

// ✅ NEW: Remix a component
// @route   POST /api/components/:slug/remix
// @desc    Remix a component (Authenticated)
router.post("/:slug/remix", verifyAccessToken, remixComponent);

module.exports = router;
