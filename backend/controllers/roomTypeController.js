const RoomType = require("../models/RoomType");

// Tạo RoomType
exports.createRoomType = async (req, res) => {
  try {
    const { hotel_id, name, description, furniture, price, capacity } = req.body;

    if (req.user.role !== "manager" || req.user.hotel_id !== hotel_id) {
      return res.status(403).json({ msg: "You can only create room type for your hotel" });
    }

    const roomType = await RoomType.create({
      hotel_id,
      name,
      description,
      furniture,
      price,
      capacity,
      available: capacity
    });

    res.json(roomType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Lấy tất cả RoomType theo hotel
exports.getRoomTypes = async (req, res) => {
  try {
    const { hotel_id } = req.query;
    const roomTypes = await RoomType.findAll({ where: { hotel_id } });
    res.json(roomTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Lấy 1 RoomType theo id
exports.getRoomTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const roomType = await RoomType.findByPk(id);

    if (!roomType) return res.status(404).json({ msg: "RoomType not found" });

    res.json(roomType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update RoomType
exports.updateRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    const roomType = await RoomType.findByPk(id);

    if (!roomType) return res.status(404).json({ msg: "RoomType not found" });
    if (req.user.role !== "manager" || req.user.hotel_id !== roomType.hotel_id) {
      return res.status(403).json({ msg: "You can only update your hotel room types" });
    }

    await roomType.update(req.body);
    res.json(roomType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete RoomType
exports.deleteRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    const roomType = await RoomType.findByPk(id);

    if (!roomType) return res.status(404).json({ msg: "RoomType not found" });
    if (req.user.role !== "manager" || req.user.hotel_id !== roomType.hotel_id) {
      return res.status(403).json({ msg: "You can only delete your hotel room types" });
    }

    await roomType.destroy();
    res.json({ msg: "RoomType deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
