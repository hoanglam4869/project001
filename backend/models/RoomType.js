// models/RoomType.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Hotel = require("./Hotel");

const RoomType = sequelize.define("RoomType", {
  room_type_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  hotel_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  furniture: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  available: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: "room_types",
  timestamps: false
});

// Quan hệ
Hotel.hasMany(RoomType, { foreignKey: "hotel_id", onDelete: "CASCADE" });
RoomType.belongsTo(Hotel, { foreignKey: "hotel_id" });

module.exports = RoomType;
