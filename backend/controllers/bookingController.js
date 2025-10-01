const { Booking, BookingItem, RoomType, Service } = require("../models");

// Tạo booking (customer)
exports.createBooking = async (req, res) => {
  try {
    const { hotel_id, checkin_date, checkout_date, items } = req.body;
    const user_id = req.user.user_id;

    if (!items || items.length === 0)
      return res.status(400).json({ msg: "No items provided" });

    // Validate mỗi item thuộc hotel và lấy giá từ DB
    let total_price = 0;
    const bookingItemsData = [];

    for (const item of items) {
      let unit_price = 0;

      if (item.room_type_id) {
        const roomType = await RoomType.findByPk(item.room_type_id);
        if (!roomType)
          return res.status(400).json({ msg: `RoomType ${item.room_type_id} not found` });
        if (roomType.hotel_id !== hotel_id)
          return res.status(400).json({ msg: `RoomType ${item.room_type_id} does not belong to this hotel` });
        unit_price = roomType.price;
      }

      if (item.service_id) {
        const service = await Service.findByPk(item.service_id);
        if (!service)
          return res.status(400).json({ msg: `Service ${item.service_id} not found` });
        if (service.hotel_id !== hotel_id)
          return res.status(400).json({ msg: `Service ${item.service_id} does not belong to this hotel` });
        unit_price = service.price;
      }

      const total_item_price = unit_price * item.quantity;
      total_price += total_item_price;

      bookingItemsData.push({
        room_type_id: item.room_type_id || null,
        service_id: item.service_id || null,
        quantity: item.quantity,
        unit_price,
        total_price: total_item_price,
        customer_name: item.customer_name || req.user.name,
        customer_email: item.customer_email || req.user.email,
        customer_phone: item.customer_phone || "",
      });
    }

    // Tạo booking
    const booking = await Booking.create({
      user_id,
      hotel_id,
      checkin_date,
      checkout_date,
      total_price,
      room_number: null,
      status: "pending"
    });

    // Tạo booking items
    const bookingItems = await Promise.all(
      bookingItemsData.map(item => BookingItem.create({
        booking_id: booking.booking_id,
        ...item
      }))
    );

    res.status(201).json({ booking, bookingItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Lấy booking của customer
exports.getMyBookings = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const bookings = await Booking.findAll({
      where: { user_id },
      include: [{ model: BookingItem, include: [RoomType, Service] }]
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Lấy tất cả booking (staff/manager)
exports.getAllBookings = async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role === "staff" || req.user.role === "manager") {
      whereClause.hotel_id = req.user.hotel_id;
    }
    const bookings = await Booking.findAll({
      where: whereClause,
      include: [{ model: BookingItem, include: [RoomType, Service] }]
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Staff cập nhật trạng thái booking và room_number
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, room_number } = req.body;

    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    if (req.user.role === "staff" && req.user.hotel_id !== booking.hotel_id) {
      return res.status(403).json({ msg: "You can only update bookings of your hotel" });
    }

    if (status) booking.status = status;
    if (room_number) booking.room_number = room_number;

    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Xóa booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    // Customer chỉ được xóa nếu là đơn của mình và status = pending
    if (req.user.role === "customer") {
      if (booking.user_id !== req.user.user_id)
        return res.status(403).json({ msg: "You can only delete your own bookings" });
      if (booking.status !== "pending")
        return res.status(400).json({ msg: "You can only delete pending bookings" });
    }

    // Staff có thể xóa booking của khách sạn mình
    if (req.user.role === "staff") {
      if (booking.hotel_id !== req.user.hotel_id)
        return res.status(403).json({ msg: "You can only delete bookings of your hotel" });
    }

    await BookingItem.destroy({ where: { booking_id: id } });
    await booking.destroy();

    res.json({ msg: "Booking deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
