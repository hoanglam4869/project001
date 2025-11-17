const express = require("express");
const router = express.Router();
const { verifyToken, isStaff } = require("../middlewares/auth");
const { 
  createBooking, 
  getMyBookings, 
  getAllBookings, 
  updateBookingStatus, 
  deleteBooking, 
  createQR, 
  payOSWebhook,
  getBookingById // Import hàm mới
} = require("../controllers/bookingController");

// Customer tạo booking
router.post("/", verifyToken, createBooking);

// Customer lấy booking CỦA MÌNH (danh sách)
router.get("/my", verifyToken, getMyBookings);

// Staff/Manager lấy TẤT CẢ booking (của hotel họ)
router.get("/", verifyToken, isStaff, getAllBookings);

// (HÀM MỚI) Lấy MỘT booking chi tiết
// Phải đặt sau "/my" để "my" không bị nhầm là "id"
// verifyToken là đủ, vì logic phân quyền đã ở trong controller
router.get("/:id", verifyToken, getBookingById); 

// Staff cập nhật trạng thái booking
router.put("/:id", verifyToken, isStaff, updateBookingStatus);

// Xóa booking (SỬA LỖ HỔNG: Thêm isStaff)
router.delete("/:id", verifyToken, isStaff, deleteBooking);

// Tạo QR (SỬA: Vẫn là verifyToken, nhưng controller đã check quyền)
router.post("/:id/payment-payos", verifyToken, createQR);

// PayOS callback (webhook)
router.post("/payos/webhook", payOSWebhook);

module.exports = router;