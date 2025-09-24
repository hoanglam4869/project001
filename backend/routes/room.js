const express = require("express");
const router = express.Router();
const { createRoom, getRooms, updateRoom, deleteRoom } = require("../controllers/roomController");
const { verifyToken, isManager } = require("../middlewares/auth");

router.post("/", verifyToken, isManager, createRoom);
router.get("/", verifyToken, isManager, getRooms);
router.put("/:id", verifyToken, isManager, updateRoom);
router.delete("/:id", verifyToken, isManager, deleteRoom);

module.exports = router;
