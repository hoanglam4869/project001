const { BookingItem, Booking, RoomType, Service } = require("../models");

// Lấy tất cả items của 1 booking
exports.getBookingItems = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const booking = await Booking.findByPk(booking_id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    // Customer chỉ xem booking của mình
    if (req.user.role === "customer" && booking.user_id !== req.user.user_id)
      return res.status(403).json({ msg: "Access denied" });

    const items = await BookingItem.findAll({
      where: { booking_id },
      include: [RoomType, Service]
    });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Cập nhật quantity, customer info của item
exports.updateBookingItem = async (req, res) => {
  try {
    const { id } = req.params; // booking_item_id
    const { quantity, customer_name, customer_email, customer_phone } = req.body;

    const item = await BookingItem.findByPk(id);
    if (!item) return res.status(404).json({ msg: "BookingItem not found" });

    const booking = await Booking.findByPk(item.booking_id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    // Chỉ customer của booking mới được update trước khi thanh toán
    if (req.user.role === "customer") {
      if (booking.user_id !== req.user.user_id)
        return res.status(403).json({ msg: "Access denied" });
      if (booking.status !== "pending")
        return res.status(400).json({ msg: "Cannot edit item after payment/confirmation" });
    }

    // Nếu quantity thay đổi thì cập nhật total_price
    if (quantity) {
      item.quantity = quantity;
      item.total_price = item.unit_price * quantity;
    }

    if (customer_name) item.customer_name = customer_name;
    if (customer_email) item.customer_email = customer_email;
    if (customer_phone) item.customer_phone = customer_phone;

    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Xóa item
exports.deleteBookingItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await BookingItem.findByPk(id);
    if (!item) return res.status(404).json({ msg: "BookingItem not found" });

    const booking = await Booking.findByPk(item.booking_id);

    // Customer chỉ xóa item của booking pending
    if (req.user.role === "customer") {
      if (booking.user_id !== req.user.user_id)
        return res.status(403).json({ msg: "Access denied" });
      if (booking.status !== "pending")
        return res.status(400).json({ msg: "Cannot delete item after payment/confirmation" });
    }

    await item.destroy();
    res.json({ msg: "BookingItem deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
