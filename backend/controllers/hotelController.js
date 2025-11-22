const Hotel = require("../models/Hotel");
const User = require("../models/User");

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


exports.getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    // Include User để xem danh sách nhân viên của khách sạn này
    const hotel = await Hotel.findByPk(id, {
      include: [{ 
        model: User, 
        attributes: ['user_id', 'name', 'email', 'role'] // Chỉ lấy thông tin cần thiết
      }]
    });

    if (!hotel) return res.status(404).json({ msg: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    console.error(err);
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

    // ✅ B1: set NULL cho tất cả user thuộc khách sạn này
    await User.update(
      { hotel_id: null },
      { where: { hotel_id: id } }
    );

    // ✅ B2: xóa khách sạn
    await hotel.destroy();

    res.json({ msg: "Hotel deleted, all staff/manager unlinked from hotel" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
