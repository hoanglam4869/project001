const express = require("express");
const router = express.Router();
const { getStaffDashboard } = require("../controllers/staffdashboardController");
const { verifyToken, isStaff } = require("../middlewares/auth");

// Route: GET /api/dashboard/staff
// Yêu cầu: Phải có Token và Role là Staff (hoặc Manager nếu muốn dùng chung)
router.get("/staff", verifyToken, isStaff, getStaffDashboard);

module.exports = router;