const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateTokens");
const generateSlug = require("../utils/generateSlug"); // <-- Import slug generator

// Register a user (email + password)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const isMainAdmin =
      email === process.env.MAIN_ADMIN_EMAIL &&
      password === process.env.MAIN_ADMIN_PASSWORD;

    const slug = generateSlug(name);

    const user = await User.create({
      name,
      slug,
      email,
      password: hashed,
      role: isMainAdmin ? "admin" : "viewer",
      provider: "local",
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

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
      .json({
        user: {
          id: user._id,
          name: user.name,
          slug: user.slug,
          role: user.role,
        },
      });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login (email + password)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.provider !== "local")
      return res.status(403).json({ message: `Login with ${user.provider}` });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

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
      .json({
        user: {
          id: user._id,
          name: user.name,
          slug: user.slug,
          role: user.role,
        },
      });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout
exports.logout = (req, res) => {
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json({ message: "Logged out successfully" });
};

// Get current user from cookie
exports.getCurrentUser = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.sendStatus(404);

    res.json({ user });
  } catch (err) {
    res.sendStatus(403);
  }
};
