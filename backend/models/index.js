const sequelize = require("../config/db");
const User = require("./User");
const Hotel = require("./Hotel");
const RoomType = require("./RoomType");
const Booking = require("./Booking");
const BookingItem = require("./BookingItem");
const Service = require("./Service");
const Voucher = require("./Voucher");


// Quan hệ Hotel ↔ User
Hotel.hasMany(User, { foreignKey: "hotel_id", onDelete: "SET NULL", onUpdate: "CASCADE" });
User.belongsTo(Hotel, { foreignKey: "hotel_id", onDelete: "SET NULL", onUpdate: "CASCADE" });

// Booking ↔ User
User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });

// Booking ↔ Hotel
Hotel.hasMany(Booking, { foreignKey: "hotel_id" });
Booking.belongsTo(Hotel, { foreignKey: "hotel_id" });

// Booking ↔ BookingItem
Booking.hasMany(BookingItem, { foreignKey: "booking_id" });
BookingItem.belongsTo(Booking, { foreignKey: "booking_id" });

// BookingItem ↔ RoomType
RoomType.hasMany(BookingItem, { foreignKey: "room_type_id" });
BookingItem.belongsTo(RoomType, { foreignKey: "room_type_id" });

// BookingItem ↔ Service
Service.hasMany(BookingItem, { foreignKey: "service_id" });
BookingItem.belongsTo(Service, { foreignKey: "service_id" });

// Voucher belongsTo Hotel
Voucher.belongsTo(Hotel, { foreignKey: "hotel_id" });
Hotel.hasMany(Voucher, { foreignKey: "hotel_id" });

// Booking belongsTo Voucher
Booking.belongsTo(Voucher, { foreignKey: "voucher_id" });
Voucher.hasMany(Booking, { foreignKey: "voucher_id" });


module.exports = {
  sequelize,
  User,
  Hotel,
  RoomType,
  Service,
  Booking,
  BookingItem,
  Voucher,
};

