const { User, Hotel } = require("../models");
const bcrypt = require("bcrypt");

// Admin tạo tài khoản (staff/manager/admin)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, hotel_id } = req.body;

    const exist = await User.findOne({ where: { email } });
    if (exist) return res.status(400).json({ msg: "Email already exists" });

    // Logic: Nếu role là customer/admin thì hotel_id phải là null
    let finalHotelId = hotel_id;
    if (role === 'customer' || role === 'admin') {
        finalHotelId = null;
    }

    const user = await User.create({ 
        name, 
        email, 
        password, 
        role, 
        hotel_id: finalHotelId 
    });
    
    // Trả về user kèm thông tin Hotel (nếu có) để frontend hiển thị ngay
    const createdUser = await User.findByPk(user.user_id, {
        include: [{ model: Hotel, attributes: ["name"] }]
    });

    res.json({ msg: "User created", user: createdUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Lấy danh sách user
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Hotel,
          attributes: ["name"], 
        },
      ],
      order: [["user_id", "DESC"]] 
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      include: [{ model: Hotel, attributes: ["name", "address"] }] // Kèm thông tin khách sạn
    });

    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Cập nhật user (Cho phép sửa Name, Email, Role, Hotel)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Lấy tất cả các trường có thể update
    const { name, email, role, hotel_id } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Cập nhật thông tin cơ bản
    if (name) user.name = name;
    if (email) user.email = email;

    // Logic Role & Hotel:
    // Nếu role gửi lên khác undefined, ta cập nhật role
    if (role) {
        user.role = role;
    }

    // Nếu là customer/admin => hotel_id luôn null
    if (user.role === 'customer' || user.role === 'admin') {
        user.hotel_id = null;
    } else {
        // Nếu là staff/manager, cập nhật hotel_id nếu có gửi lên
        if (hotel_id !== undefined) {
            user.hotel_id = hotel_id;
        }
    }

    await user.save();

    // Trả về data mới nhất kèm Hotel info
    const updatedUser = await User.findByPk(id, {
        include: [{ model: Hotel, attributes: ["name"] }]
    });

    res.json({ msg: "User updated", user: updatedUser });
  } catch (err) {
    console.error(err);
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