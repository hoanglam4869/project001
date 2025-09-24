const User = require("../models/User");
const bcrypt = require("bcrypt");

// Admin tạo tài khoản (staff/manager/admin)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, hotel_id } = req.body;

    const exist = await User.findOne({ where: { email } });
    if (exist) return res.status(400).json({ msg: "Email already exists" });

    const user = await User.create({ name, email, password, role, hotel_id });
    res.json({ msg: "User created", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Lấy danh sách user
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Cập nhật role
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, hotel_id } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.role = role || user.role;
    user.hotel_id = hotel_id || user.hotel_id;
    await user.save();

    res.json({ msg: "User updated", user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Xóa user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    await user.destroy();
    res.json({ msg: "User deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
