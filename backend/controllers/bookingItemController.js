const { BookingItem, RoomType, Service, Booking } = require("../models");

// ✅ CHỈ LẤY ITEMS CỦA NGƯỜI DÙNG ĐANG ĐĂNG NHẬP
exports.getBookingItems = async (req, res) => {
  try {
    const booking_id = req.params.booking_id;
    const user_id = req.user.user_id;

    // Kiểm tra xem booking này có thuộc về người dùng đang đăng nhập không
    const booking = await Booking.findOne({
      where: { booking_id, user_id }
    });

    if (!booking) {
      return res.status(403).json({ msg: "Bạn không có quyền xem booking này." });
    }

    const items = await BookingItem.findAll({
      where: { booking_id },
      include: [RoomType, Service],
    });

    res.json(items);
  } catch (error) {
    console.error("❌ getBookingItems error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ✅ CẬP NHẬT ITEM (chỉ được cập nhật item thuộc về booking của mình)
exports.updateBookingItem = async (req, res) => {
  try {
    const item = await BookingItem.findByPk(req.params.id, {
      include: [{ model: Booking }]
    });

    if (!item) return res.status(404).json({ msg: "Booking item not found" });

    // Kiểm tra quyền sở hữu
    if (item.Booking.user_id !== req.user.user_id) {
      return res.status(403).json({ msg: "Bạn không có quyền chỉnh sửa item này" });
    }

    item.quantity = req.body.quantity || item.quantity;
    await item.save();

    res.json({ msg: "Booking item updated", item });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ✅ XÓA ITEM (chỉ xóa được item thuộc về booking của mình)
exports.deleteBookingItem = async (req, res) => {
  try {
    const item = await BookingItem.findByPk(req.params.id, {
      include: [{ model: Booking }]
    });

    if (!item) return res.status(404).json({ msg: "Booking item not found" });

    if (item.Booking.user_id !== req.user.user_id) {
      return res.status(403).json({ msg: "Bạn không có quyền xóa item này" });
    }

    await item.destroy();
    res.json({ msg: "Booking item deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
