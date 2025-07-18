const User = require("../models/User");
const Component = require("../models/Component");

// GET user profile by slug (username)
exports.getUserProfile = async (req, res) => {
  try {
    const { slug } = req.params;

    const user = await User.findOne({ name: slug }).lean(); // using name as slug
    if (!user) return res.status(404).json({ message: "User not found" });

    const components = await Component.find({ creator: user._id }).select(
      "name slug tags image version"
    );

    res.json({
      user: {
        name: user.name,
        avatar: user.avatar || "",
        bio: user.bio || "",
        social: user.social || {
          github: "",
          linkedin: "",
          instagram: "",
          blog: "",
          email: "",
        },
      },
      components,
    });
  } catch (err) {
    console.error("User Profile Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// PUT update authenticated user's profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { bio, avatar, social = {} } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        bio,
        avatar,
        social: {
          github: social.github || "",
          linkedin: social.linkedin || "",
          instagram: social.instagram || "",
          blog: social.blog || "",
          email: social.email || "",
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        name: updatedUser.name,
        avatar: updatedUser.avatar || "",
        bio: updatedUser.bio || "",
        social: updatedUser.social || {},
      },
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// PUT admin: promote/demote user
exports.changeUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const allowedRoles = ["viewer", "collaborator", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Role updated", user });
  } catch (err) {
    console.error("Role Update Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET admin: fetch all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role provider avatar");
    res.json({ users });
  } catch (err) {
    console.error("Get All Users Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
