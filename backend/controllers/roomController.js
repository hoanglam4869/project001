const Room = require("../models/Room");
const RoomType = require("../models/RoomType");
const Hotel = require("../models/Hotel");

// Create Room (manager only)
exports.createRoom = async (req, res) => {
  try {
    const { name, description, area, bed, interior, people, status, room_type_id } = req.body;
    const hotel_id = req.user.hotel_id;
    if (!hotel_id) return res.status(403).json({ msg: "You don't manage any hotel" });

    const room = await Room.create({ name, description, area, bed, interior, people, status, room_type_id, hotel_id });
    res.json({ msg: "Room created", room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const hotel_id = req.user.hotel_id;
    const rooms = await Room.findAll({ where: { hotel_id } });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel_id = req.user.hotel_id;

    const room = await Room.findOne({ where: { room_id: id, hotel_id } });
    if (!room) return res.status(404).json({ msg: "Room not found" });

    const { name, description, area, bed, interior, people, status, room_type_id } = req.body;
    room.name = name || room.name;
    room.description = description || room.description;
    room.area = area || room.area;
    room.bed = bed || room.bed;
    room.interior = interior || room.interior;
    room.people = people || room.people;
    room.status = status || room.status;
    room.room_type_id = room_type_id || room.room_type_id;

    await room.save();
    res.json({ msg: "Room updated", room });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel_id = req.user.hotel_id;

    const room = await Room.findOne({ where: { room_id: id, hotel_id } });
    if (!room) return res.status(404).json({ msg: "Room not found" });

    await room.destroy();
    res.json({ msg: "Room deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
