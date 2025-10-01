const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const { getBookingItems, updateBookingItem, deleteBookingItem } = require("../controllers/bookingItemController");

// Xem tất cả items của 1 booking
router.get("/:booking_id", verifyToken, getBookingItems);

// Cập nhật item
router.put("/:id", verifyToken, updateBookingItem);

// Xóa item
router.delete("/:id", verifyToken, deleteBookingItem);

module.exports = router;
