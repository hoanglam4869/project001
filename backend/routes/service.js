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

// CRUD service (chỉ manager)
router.post("/", verifyToken, isManager, createService);
router.get("/", getServices);
router.get("/:id", getServiceById);
router.put("/:id", verifyToken, isManager, updateService);
router.delete("/:id", verifyToken, isManager, deleteService);

module.exports = router;
