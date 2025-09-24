const express = require("express");
const router = express.Router();
const { createRoomType, getRoomTypes, updateRoomType, deleteRoomType } = require("../controllers/roomTypeController");
const { verifyToken, isManager } = require("../middlewares/auth");

router.post("/", verifyToken, isManager, createRoomType);
router.get("/", verifyToken, isManager, getRoomTypes);
router.put("/:id", verifyToken, isManager, updateRoomType);
router.delete("/:id", verifyToken, isManager, deleteRoomType);

module.exports = router;
