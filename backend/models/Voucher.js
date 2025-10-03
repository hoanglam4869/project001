// models/Voucher.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Voucher = sequelize.define(
  "Voucher",
  {
    voucher_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hotel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("percent", "amount"),
      allowNull: false,
    },
    voucher_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "vouchers",
    timestamps: true,
  }
);

module.exports = Voucher;
