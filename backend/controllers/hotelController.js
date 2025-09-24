const Hotel = require("../models/Hotel");

// Admin tạo khách sạn
exports.createHotel = async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    const hotel = await Hotel.create({ name, address, phone });
    res.json({ msg: "Hotel created", hotel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Lấy danh sách khách sạn
exports.getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.findAll();
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Cập nhật khách sạn
exports.updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone } = req.body;

    const hotel = await Hotel.findByPk(id);
    if (!hotel) return res.status(404).json({ msg: "Hotel not found" });

    hotel.name = name || hotel.name;
    hotel.address = address || hotel.address;
    hotel.phone = phone || hotel.phone;
    await hotel.save();

    res.json({ msg: "Hotel updated", hotel });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Xóa khách sạn
exports.deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findByPk(id);
    if (!hotel) return res.status(404).json({ msg: "Hotel not found" });

    await hotel.destroy();
    res.json({ msg: "Hotel deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
