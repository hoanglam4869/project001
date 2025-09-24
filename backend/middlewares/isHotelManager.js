const RoomType = require("../models/RoomType");
const Room = require("../models/Room");

// Kiểm tra quyền manager với RoomType
const canManageRoomType = async (req, res, next) => {
  try {
    const { hotel_id } = req.body; // khi tạo RoomType
    if (hotel_id && hotel_id !== req.user.hotel_id) {
      return res.status(403).json({ msg: "You can only manage RoomTypes of your hotel" });
    }

    if (req.params.id) { // khi update/delete
      const roomType = await RoomType.findByPk(req.params.id);
      if (!roomType) return res.status(404).json({ msg: "RoomType not found" });
      if (roomType.hotel_id !== req.user.hotel_id) {
        return res.status(403).json({ msg: "You can only manage RoomTypes of your hotel" });
      }
    }

    next();
  } catch (err) {
    res.status(500).json({ msg: "Server error", err });
  }
};

// Kiểm tra quyền manager với Room
const canManageRoom = async (req, res, next) => {
  try {
    const { hotel_id } = req.body; // khi tạo Room
    if (hotel_id && hotel_id !== req.user.hotel_id) {
      return res.status(403).json({ msg: "You can only manage Rooms of your hotel" });
    }

    if (req.params.id) { // khi update/delete
      const room = await Room.findByPk(req.params.id);
      if (!room) return res.status(404).json({ msg: "Room not found" });
      if (room.hotel_id !== req.user.hotel_id) {
        return res.status(403).json({ msg: "You can only manage Rooms of your hotel" });
      }
    }

    next();
  } catch (err) {
    res.status(500).json({ msg: "Server error", err });
  }
};

module.exports = { canManageRoomType, canManageRoom };
