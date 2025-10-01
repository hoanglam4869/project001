const express = require("express");
const router = express.Router();
const { verifyToken, isStaff } = require("../middlewares/auth");
const { createBooking, getMyBookings, getAllBookings, updateBookingStatus, deleteBooking } = require("../controllers/bookingController");

// Customer tạo booking
router.post("/", verifyToken, createBooking);

// Customer lấy booking của mình
router.get("/my", verifyToken, getMyBookings);

// Staff/Manager lấy tất cả booking
router.get("/", verifyToken, getAllBookings);

// Staff cập nhật trạng thái booking
router.put("/:id", verifyToken, isStaff, updateBookingStatus);

// Xóa booking
router.delete("/:id", verifyToken, deleteBooking);


module.exports = router;
