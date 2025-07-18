const jwt = require("jsonwebtoken");

exports.verifyAccessToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

exports.requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) return res.status(403).json({ message: "Forbidden" });
    next();
  };
};
