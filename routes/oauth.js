const router = require("express").Router();
const passport = require("passport");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ✅ Google OAuth entry point
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

// ✅ Google callback
router.get("/google/callback", passport.authenticate("google", {
  failureRedirect: `${CLIENT_URL}/login`,
  session: false,
}), (req, res) => {
  const accessToken = generateAccessToken(req.user);
  const refreshToken = generateRefreshToken(req.user);

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    })
    .redirect(`${CLIENT_URL}`);
});

// ✅ GitHub OAuth entry point
router.get("/github", passport.authenticate("github", {
  scope: ["user:email"]
}));

// ✅ GitHub callback
router.get("/github/callback", passport.authenticate("github", {
  failureRedirect: `${CLIENT_URL}/login`,
  session: false,
}), (req, res) => {
  const accessToken = generateAccessToken(req.user);
  const refreshToken = generateRefreshToken(req.user);

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    })
    .redirect(`${CLIENT_URL}`);
});

module.exports = router;
