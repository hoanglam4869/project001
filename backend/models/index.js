const sequelize = require("../config/db");
const User = require("./User");
const Hotel = require("./Hotel");
const RoomType = require("./RoomType");
const Room = require("./Room");


// Quan hệ Hotel ↔ User
Hotel.hasMany(User, { foreignKey: "hotel_id", onDelete: "SET NULL", onUpdate: "CASCADE" });
User.belongsTo(Hotel, { foreignKey: "hotel_id", onDelete: "SET NULL", onUpdate: "CASCADE" });



module.exports = {
  sequelize,
  User,
  Hotel,
  RoomType,
  Room,
};
