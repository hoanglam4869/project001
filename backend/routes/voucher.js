const express = require("express");
const router = express.Router();
const { verifyToken, isStaff } = require("../middlewares/auth");
const {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher
} = require("../controllers/voucherController");

// Staff/Manager tạo voucher
router.post("/", verifyToken, isStaff, createVoucher);

// Lấy tất cả voucher (theo role)
router.get("/", verifyToken, getVouchers);

// Lấy 1 voucher
router.get("/:id", verifyToken, getVoucherById);

// Cập nhật voucher
router.put("/:id", verifyToken, isStaff, updateVoucher);

// Xóa voucher
router.delete("/:id", verifyToken, isStaff, deleteVoucher);

module.exports = router;
