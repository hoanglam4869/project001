const RoomType = require("../models/RoomType");
const Room = require("../models/Room");
const Hotel = require("../models/Hotel");

// Create RoomType (manager only, hotel họ quản lý)
exports.createRoomType = async (req, res) => {
  try {
    const { name, description, basic_price } = req.body;

    // lấy hotel_id từ user
    const hotel_id = req.user.hotel_id;
    if (!hotel_id) return res.status(403).json({ msg: "You don't manage any hotel" });

    const roomType = await RoomType.create({ name, description, basic_price, hotel_id });
    res.json({ msg: "RoomType created", roomType });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getRoomTypes = async (req, res) => {
  try {
    const hotel_id = req.user.hotel_id;
    const roomTypes = await RoomType.findAll({ where: { hotel_id } });
    res.json(roomTypes);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updateRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, basic_price } = req.body;
    const hotel_id = req.user.hotel_id;

    const roomType = await RoomType.findOne({ where: { room_type_id: id, hotel_id } });
    if (!roomType) return res.status(404).json({ msg: "RoomType not found" });

    roomType.name = name || roomType.name;
    roomType.description = description || roomType.description;
    roomType.basic_price = basic_price || roomType.basic_price;
    await roomType.save();

    res.json({ msg: "RoomType updated", roomType });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.deleteRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel_id = req.user.hotel_id;

    const roomType = await RoomType.findOne({ where: { room_type_id: id, hotel_id } });
    if (!roomType) return res.status(404).json({ msg: "RoomType not found" });

    await roomType.destroy();
    res.json({ msg: "RoomType deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
