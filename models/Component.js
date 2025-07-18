const mongoose = require("mongoose");

const componentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String, // Cloudinary URL
      default: "",
    },
    version: {
      type: String,
      default: "1.0.0",
    },
    tags: {
      type: [String],
      default: [],
    },
    commands: {
      type: String,
      default: "",
    },
    fileType: {
      type: String,
      default: "js", // fallback fileType for the main file
    },
    codeFiles: [
      {
        filename: { type: String, required: true },
        fileType: { type: String, required: true },
        code: { type: String, required: true },
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ Reference to original component (if remixed)
    remixedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Component",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Component", componentSchema);
