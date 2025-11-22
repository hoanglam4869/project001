const express = require("express");
const router = express.Router();
const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService
} = require("../controllers/serviceController");
const { verifyToken, isManager } = require("../middlewares/auth");

// --- PUBLIC ROUTES (Ai cũng xem được, không cần đăng nhập) ---
router.get("/", getServices);
router.get("/:id", getServiceById);

// --- PROTECTED ROUTES (Chỉ Manager mới được thao tác) ---
router.post("/", verifyToken, isManager, createService);
router.put("/:id", verifyToken, isManager, updateService);
router.delete("/:id", verifyToken, isManager, deleteService);

module.exports = router;