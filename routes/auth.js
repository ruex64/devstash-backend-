const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { body } = require("express-validator");

router.post("/register", [
  body("name").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 })
], authController.register);

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authController.getCurrentUser);

module.exports = router;
