const User = require("../models/User");
const Component = require("../models/Component");

exports.getUserProfile = async (req, res) => {
  try {
    const { slug } = req.params;

    const user = await User.findOne({ slug }).lean(); // slug-based lookup

    if (!user) return res.status(404).json({ message: "User not found" });

    const components = await Component.find({ creator: user._id }).select(
      "name slug tags image version"
    );

    res.json({
      user: {
        name: user.name,
        avatar: user.avatar,
        bio: user.bio || "",
        social: user.social || {},
        slug: user.slug,
      },
      components,
    });
  } catch (err) {
    console.error("User Profile Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
