const express = require("express");
const router = express.Router();
const { changeUserRole, getAllUsers } = require("../controllers/userController");
const { verifyAccessToken, requireRole } = require("../middleware/auth");

router.get("/users", verifyAccessToken, requireRole("admin"), getAllUsers);
router.put("/user/role", verifyAccessToken, requireRole("admin"), changeUserRole);

module.exports = router;
