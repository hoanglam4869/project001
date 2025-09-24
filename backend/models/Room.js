const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Hotel = require("./Hotel");
const RoomType = require("./RoomType");

const Room = sequelize.define("Room", {
  room_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  hotel_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  room_type_id: {
    type: DataTypes.INTEGER,
    allowNull: true // null nếu room type bị xóa
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  area: DataTypes.FLOAT,
  bed: DataTypes.STRING, // 1 giường, 2 giường,...
  interior: DataTypes.STRING, // tv, safe, hair dryer,...
  people: DataTypes.INTEGER,
  status: {
    type: DataTypes.ENUM("available", "booked", "maintenance"),
    defaultValue: "available"
  }
}, {
  tableName: "rooms",
  timestamps: false
});

// Quan hệ
Room.belongsTo(Hotel, { foreignKey: "hotel_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
Hotel.hasMany(Room, { foreignKey: "hotel_id", onDelete: "CASCADE", onUpdate: "CASCADE" });

Room.belongsTo(RoomType, { foreignKey: "room_type_id", onDelete: "SET NULL", onUpdate: "CASCADE" });
RoomType.hasMany(Room, { foreignKey: "room_type_id", onDelete: "SET NULL", onUpdate: "CASCADE" });

module.exports = Room;
