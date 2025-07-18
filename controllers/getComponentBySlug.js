exports.getComponentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const component = await Component.findOne({ slug }).populate("creator", "name avatar");

    if (!component) {
      return res.status(404).json({ message: "Component not found" });
    }

    res.json(component);
  } catch (error) {
    console.error("Fetch Component Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
