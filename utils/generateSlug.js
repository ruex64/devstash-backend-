const slugify = require("slugify");

const generateSlug = (name) => {
  return slugify(name, { lower: true, strict: true });
};

module.exports = generateSlug;
