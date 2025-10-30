const { Booking, BookingItem, RoomType, Service, Voucher } = require("../models");
const { Op } = require("sequelize");
const payos = require('../config/payos');
const db = require("../config/db");

exports.createBooking = async (req, res) => {
  try {
    const {
      hotel_id,
      checkin_date,
      checkout_date,
      items,
      voucher_id,
      customer_name,
      customer_email,
      customer_phone,
    } = req.body;

    const user_id = req.user.user_id;

    if (!items || items.length === 0)
      return res.status(400).json({ msg: "No booking items provided" });

    if (!checkin_date || !checkout_date)
      return res.status(400).json({ msg: "Missing check-in or check-out date" });

    if (!customer_name || !customer_email || !customer_phone)
      return res.status(400).json({ msg: "Missing customer information" });

    let total_price = 0;
    const bookingItemsData = [];

    for (const item of items) {
      let unit_price = 0;

      // ====== ROOM TYPE ======
      if (item.room_type_id) {
        const roomType = await RoomType.findByPk(item.room_type_id);
        if (!roomType)
          return res.status(400).json({ msg: `Room type ${item.room_type_id} not found` });
        if (roomType.hotel_id !== hotel_id)
          return res.status(400).json({ msg: `Room type ${item.room_type_id} not in this hotel` });

        // kiểm tra trùng ngày
        const overlappingBookings = await Booking.findAll({
          where: {
            hotel_id,
            status: { [Op.notIn]: ["cancelled"] },
            checkin_date: { [Op.lt]: checkout_date },
            checkout_date: { [Op.gt]: checkin_date },
          },
          include: {
            model: BookingItem,
            where: { room_type_id: item.room_type_id },
          },
        });

        const bookedCount = overlappingBookings.reduce(
          (total, b) => total + b.BookingItems.reduce((sum, i) => sum + i.quantity, 0),
          0
        );

        const availableRooms = roomType.capacity - bookedCount;

        if (availableRooms < item.quantity)
          return res.status(400).json({
            msg: `Not enough rooms available for ${roomType.name}. Only ${availableRooms} left in this date range.`,
          });

        unit_price = roomType.price;
      }

      // ====== SERVICE ======
      if (item.service_id) {
        const service = await Service.findByPk(item.service_id);
        if (!service)
          return res.status(400).json({ msg: `Service ${item.service_id} not found` });
        if (service.hotel_id !== hotel_id)
          return res.status(400).json({ msg: `Service ${item.service_id} not in this hotel` });

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
      });
    }

    // ====== VOUCHER ======
    let final_price = total_price;
    let appliedVoucherId = null;

    if (voucher_id) {
      const voucher = await Voucher.findOne({ where: { voucher_id, hotel_id } });
      if (!voucher)
        return res.status(400).json({ msg: "Voucher not found or invalid" });

      const now = new Date();
      if (now < voucher.start_date || now > voucher.end_date)
        return res.status(400).json({ msg: "Voucher expired or inactive" });

      let discount = 0;
      if (voucher.type === "percent")
        discount = (total_price * voucher.voucher_value) / 100;
      else if (voucher.type === "amount")
        discount = voucher.voucher_value;

      final_price = Math.max(total_price - discount, 0);
      appliedVoucherId = voucher.voucher_id;
    }

    // ====== TẠO BOOKING ======
    const booking = await Booking.create({
      user_id,
      hotel_id,
      checkin_date,
      checkout_date,
      total_price,
      final_price,
      voucher_id: appliedVoucherId,
      status: "pending",
      customer_name,
      customer_email,
      customer_phone,
    });

    // ====== TẠO BOOKING ITEMS ======
    for (const item of bookingItemsData) {
      await BookingItem.create({
        booking_id: booking.booking_id,
        ...item,
      });
    }

    const bookingWithItems = await Booking.findByPk(booking.booking_id, {
      include: [
        { model: BookingItem, include: [RoomType, Service] },
        { model: Voucher },
      ],
    });

    res.status(201).json(bookingWithItems);
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const bookings = await Booking.findAll({
      where: { user_id },
      include: [
        { model: BookingItem, include: [RoomType, Service] },
        { model: Voucher },
      ],
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: BookingItem, include: [RoomType, Service] },
        { model: Voucher },
      ],
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    booking.status = req.body.status || booking.status;
    await booking.save();
    res.json({ msg: "Booking status updated", booking });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    await BookingItem.destroy({ where: { booking_id: booking.booking_id } });
    await booking.destroy();
    res.json({ msg: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.createQR = async (req, res) => {
  try {
    const id = req.params.id || req.body.booking_id;

    if (!id) {
      return res.status(400).json({ message: "Missing booking ID" });
    }

    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const amount = Math.round(booking.final_price || booking.total_price);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    // ✅ Tạo yêu cầu thanh toán trên PayOS
    const response = await payos.paymentRequests.create({
      orderCode: booking.booking_id, // ✅ đúng tên trường
      amount,
      description: `Booking payment #${booking.booking_id}`,
      returnUrl: `http://localhost:5173/success?orderId=${booking.booking_id}`,
      cancelUrl: `http://localhost:5173/cancel?orderId=${booking.booking_id}`,
    });

    res.json({ paymentUrl: response.checkoutUrl });
  } catch (error) {
    console.error("❌ Lỗi PayOS:", error.response?.data || error.message || error);
    res.status(500).json({ message: "Payment failed", error: error.message });
  }
};


exports.payOSWebhook = async (req, res) => {
  try {
    console.log("📩 Webhook received:", req.body);

    const signature = req.headers["x-signature"];
    const verified = await payos.webhooks.verify(req.body, signature);

    if (!verified) {
      console.warn("❌ Invalid signature");
      return res.status(400).json({ message: "Invalid signature" });
    }

    const orderCode = req.body.data?.orderCode;
    if (!orderCode) {
      return res.status(400).json({ message: "Missing orderCode" });
    }

    const booking = await Booking.findByPk(orderCode);
    if (!booking) {
      console.warn(`⚠️ Booking #${orderCode} not found`);
      return res.status(404).json({ message: "Booking not found" });
    }

    if (req.body.code === "00" && req.body.success) {
      console.log(`✅ Thanh toán thành công cho booking #${orderCode}`);
      if (booking.status === "pending") {
        booking.status = "accepted";
        await booking.save();
      }
    } else {
      console.log(`❌ Thanh toán thất bại hoặc bị hủy cho booking #${orderCode}`);
      booking.status = "cancelled";
      await booking.save();
    }

    res.json({ message: "Webhook processed successfully" });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(500).json({ message: "Webhook error", error: err.message });
  }
};
