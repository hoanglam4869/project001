const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token, access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { user_id, role }
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Access denied: Admin only" });
  next();
};

const isManager = (req, res, next) => {
  if (req.user.role === "manager") next();
  else return res.status(403).json({ msg: "Require Manager role" });
};

// Export tất cả middleware cùng 1 lần
module.exports = { verifyToken, isAdmin, isManager };
