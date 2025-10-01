const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register khách hàng (role tự động = customer)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email đã tồn tại
    const exist = await User.findOne({ where: { email } });
    if (exist) return res.status(400).json({ msg: "Email already exists" });

    // Tạo user (password sẽ được hash bởi hook beforeSave)
    const user = await User.create({
      name,
      email,
      password, // raw password
      role: "customer",
      hotel_id: null
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

    // So sánh password raw với hashed password trong DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Tạo token JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
        hotel_id: user.hotel_id
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
