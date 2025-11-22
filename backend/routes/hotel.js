const express = require("express");
const router = express.Router();
const { createHotel, getHotels, getHotelById, updateHotel, deleteHotel } = require("../controllers/hotelController");
const { verifyToken, isAdmin } = require("../middlewares/auth");

// Chỉ admin mới CRUD hotel
router.post("/", verifyToken, isAdmin, createHotel);
router.get("/", verifyToken, getHotels);
router.get("/:id", verifyToken, getHotelById);
router.put("/:id", verifyToken, isAdmin, updateHotel);
router.delete("/:id", verifyToken, isAdmin, deleteHotel);

module.exports = router;

