const express = require("express");
const router = express.Router();
const { getManagerDashboard } = require("../controllers/managerdashboardController");
const { verifyToken, isManager } = require("../middlewares/auth");

// Route: GET /api/dashboard/manager
router.get("/manager", verifyToken, isManager, getManagerDashboard);

module.exports = router;