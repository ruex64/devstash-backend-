const Component = require("../models/Component");
const slugify = require("slugify");

// Generate a unique slug
const generateUniqueSlug = async (name) => {
  const baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;
  let count = 1;

  while (await Component.findOne({ slug })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
};

// ✅ 1. Create a new component (not remix)
exports.createComponent = async (req, res) => {
  try {
    const {
      name,
      tags = [],
      image,
      version = "1.0.0",
      commands = "",
      description = "",
      codeFiles = [],
    } = req.body;

    if (!name || !Array.isArray(codeFiles) || codeFiles.length === 0) {
      return res.status(400).json({ message: "Name and at least one code file are required." });
    }

    for (const file of codeFiles) {
      if (!file.filename || !file.fileType || !file.code) {
        return res.status(400).json({
          message: "Each code file must include filename, fileType, and code.",
        });
      }
    }

    const slug = await generateUniqueSlug(name);

    const component = await Component.create({
      name,
      slug,
      description,
      image,
      tags: Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim()),
      version,
      commands,
      fileType: codeFiles[0]?.fileType || "js",
      codeFiles,
      creator: req.user.id || req.user._id,
    });

    res.status(201).json(component);
  } catch (error) {
    console.error("Create Component Error:", error);
    res.status(500).json({ message: "Failed to create component" });
  }
};

// Remix a component
exports.remixComponent = async (req, res) => {
  try {
    const { slug } = req.params;

    const original = await Component.findOne({ slug });
    if (!original) {
      return res.status(404).json({ message: "Original component not found" });
    }

    const {
      name,
      tags = [],
      image = original.image,
      version = "1.0.0",
      commands = original.commands,
      description = original.description,
      codeFiles = original.codeFiles,
    } = req.body;

    if (!name || !Array.isArray(codeFiles) || codeFiles.length === 0) {
      return res.status(400).json({ message: "Name and at least one code file are required." });
    }

    const newSlug = await generateUniqueSlug(name);

    const remix = await Component.create({
      name,
      slug: newSlug,
      description,
      image,
      tags: Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim()),
      version,
      commands,
      fileType: codeFiles[0]?.fileType || "js",
      codeFiles,
      creator: req.user.id || req.user._id,
      remixedFrom: original._id,
    });

    res.status(201).json(remix);
  } catch (err) {
    console.error("Remix Component Error:", err);
    res.status(500).json({ message: "Failed to remix component" });
  }
};


// ✅ 3. Get All Components
exports.getAllComponents = async (req, res) => {
  try {
    const search = req.query.search || "";
    const searchRegex = new RegExp(search, "i");

    const query = search
      ? {
          $or: [{ name: searchRegex }, { tags: { $in: [search] } }],
        }
      : {};

    const components = await Component.find(query).populate("creator", "name avatar");
    res.json(components);
  } catch (error) {
    console.error("Get All Components Error:", error);
    res.status(500).json({ message: "Failed to fetch components" });
  }
};

// ✅ 4. Get a Component by Slug (with remix origin info)
exports.getComponentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const component = await Component.findOne({ slug })
      .populate("creator", "name avatar")
      .populate("remixedFrom", "name slug");

    if (!component) {
      return res.status(404).json({ message: "Component not found" });
    }

    res.json(component);
  } catch (error) {
    console.error("Get Component Error:", error);
    res.status(500).json({ message: "Failed to fetch component" });
  }
};

// ✅ 5. Delete Component
exports.deleteComponent = async (req, res) => {
  try {
    const { slug } = req.params;

    const component = await Component.findOne({ slug });
    if (!component) {
      return res.status(404).json({ message: "Component not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = component.creator.toString() === (req.user.id || req.user._id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Unauthorized to delete this component" });
    }

    await Component.deleteOne({ _id: component._id });

    res.status(200).json({ message: "Component deleted successfully" });
  } catch (error) {
    console.error("Delete Component Error:", error);
    res.status(500).json({ message: "Failed to delete component" });
  }
};
