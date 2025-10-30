const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const BookingItem = sequelize.define("BookingItem", {
  booking_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_id: { type: DataTypes.INTEGER, allowNull: false },
  room_type_id: { type: DataTypes.INTEGER, allowNull: true },
  service_id: { type: DataTypes.INTEGER, allowNull: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unit_price: { type: DataTypes.DECIMAL, allowNull: false },
  total_price: { type: DataTypes.DECIMAL, allowNull: false }
}, {
  tableName: "booking_items",
  timestamps: true
});

module.exports = BookingItem;
