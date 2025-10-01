const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Hotel = require("./Hotel");

const Service = sequelize.define("Service", {
  service_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  hotel_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, {
  tableName: "services",
  timestamps: false
});

// Quan hệ với Hotel
Hotel.hasMany(Service, { foreignKey: "hotel_id" });
Service.belongsTo(Hotel, { foreignKey: "hotel_id" });

module.exports = Service;
