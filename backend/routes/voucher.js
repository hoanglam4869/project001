const express = require("express");
const router = express.Router();
const { verifyToken, isStaff } = require("../middlewares/auth");
const {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  applyVoucher // 1. Import hàm mới
} = require("../controllers/voucherController");

// Staff/Manager tạo voucher
router.post("/", verifyToken, isStaff, createVoucher);

// Lấy tất cả voucher (theo role)
router.get("/", verifyToken, getVouchers);

// 2. THÊM ROUTE MỚI TẠI ĐÂY
// (Phải đặt TRƯỚC route "/:id")
router.get("/apply", verifyToken, applyVoucher);

// Lấy 1 voucher
router.get("/:id", verifyToken, getVoucherById);

// Cập nhật voucher
router.put("/:id", verifyToken, isStaff, updateVoucher);

// Xóa voucher
router.delete("/:id", verifyToken, isStaff, deleteVoucher);

module.exports = router;