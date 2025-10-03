const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define("Booking", {
  booking_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  hotel_id: { type: DataTypes.INTEGER, allowNull: false },
  room_number: { type: DataTypes.STRING, allowNull: true }, // nhân viên gán
  checkin_date: { type: DataTypes.DATE, allowNull: true },
  checkout_date: { type: DataTypes.DATE, allowNull: true },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "checkin", "checkout", "service_done", "cancelled"),
    defaultValue: "pending"
  },
  total_price: { type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0 },
  voucher_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  final_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, // sau khi áp dụng voucher
  },
}, {
  tableName: "bookings",
  timestamps: true
});

module.exports = Booking;
