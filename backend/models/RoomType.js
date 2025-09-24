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
  description: DataTypes.TEXT,
  basic_price: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: "room_types",
  timestamps: false
});

// Quan hệ
RoomType.belongsTo(Hotel, { foreignKey: "hotel_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
Hotel.hasMany(RoomType, { foreignKey: "hotel_id", onDelete: "CASCADE", onUpdate: "CASCADE" });

module.exports = RoomType;
