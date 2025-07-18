const router = require("express").Router();
const passport = require("passport");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens");

// Google OAuth entry point
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback
router.get("/google/callback", passport.authenticate("google", {
  failureRedirect: `${process.env.CLIENT_URL}/login`,
  session: false,
}), (req, res) => {
  const accessToken = generateAccessToken(req.user);
  const refreshToken = generateRefreshToken(req.user);

  res
    .cookie("accessToken", accessToken, { httpOnly: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true })
    .redirect(`${process.env.CLIENT_URL}/auth/redirect`);
});

// GitHub OAuth entry point
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

// GitHub callback
router.get("/github/callback", passport.authenticate("github", {
  failureRedirect: `${process.env.CLIENT_URL}/login`,
  session: false,
}), (req, res) => {
  const accessToken = generateAccessToken(req.user);
  const refreshToken = generateRefreshToken(req.user);

  res
    .cookie("accessToken", accessToken, { httpOnly: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true })
    .redirect(`${process.env.CLIENT_URL}/auth/redirect`);
});

module.exports = router;
