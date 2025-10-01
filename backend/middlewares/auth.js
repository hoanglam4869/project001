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

const isManagerOfHotel = (req, res, next) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ msg: "Require Manager role" });
  }

  // Nếu body hoặc params có hotel_id, so sánh với hotel_id của manager
  if (req.user.hotel_id && req.body.hotel_id && req.user.hotel_id !== req.body.hotel_id) {
    return res.status(403).json({ msg: "You can only manage your own hotel" });
  }

  next();
};

const isStaff = (req, res, next) => {
  if (req.user.role === "staff") next();
  else return res.status(403).json({ msg: "Require Staff role" });
};

module.exports = { verifyToken, isAdmin, isManager, isStaff };

