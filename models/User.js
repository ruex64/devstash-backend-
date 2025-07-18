const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true }, // 👈 Add this
    email: { type: String, unique: true, required: true },
    password: { type: String },
    avatar: String,
    role: {
      type: String,
      enum: ["viewer", "collaborator", "admin"],
      default: "viewer",
    },
    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    bio: {
      type: String,
      default: "",
    },
    social: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
      blog: { type: String, default: "" },
      email: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
