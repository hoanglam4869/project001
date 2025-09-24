const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register khách hàng
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email đã tồn tại
    const exist = await User.findOne({ where: { email } });
    if (exist) return res.status(400).json({ msg: "Email already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user với role = customer
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "customer", // tự động
      hotel_id: null,   // customer không thuộc hotel
    });

    res.status(201).json({ msg: "Register success", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", err });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Tạo token JWT, thêm hotel_id để manager CRUD theo hotel
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
        hotel_id: user.hotel_id, // manager/staff mới có hotel_id
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ msg: "Login success", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", err });
  }
};
