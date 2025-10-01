const express = require("express");
const router = express.Router();
const { createRoomType, getRoomTypes, getRoomTypeById, updateRoomType, deleteRoomType } = require("../controllers/roomTypeController");
const { verifyToken, isManager } = require("../middlewares/auth");

// Manager CRUD room types của khách sạn mình
router.post("/", verifyToken, isManager, createRoomType);
router.get("/", getRoomTypes);
router.get("/:id", getRoomTypeById);
router.put("/:id", verifyToken, isManager, updateRoomType);
router.delete("/:id", verifyToken, isManager, deleteRoomType);

module.exports = router;
