const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mailer");
// ✅ SỬA 1: Import Op đúng cách
const { Op } = require("sequelize"); 

// Register khách hàng
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exist = await User.findOne({ where: { email } });
    if (exist) return res.status(400).json({ msg: "Email already exists" });

    const user = await User.create({
      name,
      email,
      password, 
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      {
        user_id: user.user_id,
        name: user.name, 
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

// 1. Gửi yêu cầu quên mật khẩu
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ msg: "Email không tồn tại trong hệ thống" });
    }

    // Tạo token ngẫu nhiên
    const token = crypto.randomBytes(20).toString("hex");

    // ✅ SỬA 2: Dùng new Date() để lưu đúng định dạng DATETIME vào DB
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 giờ
    
    await user.save();

    // Debug log để kiểm tra
    console.log("Debug Forgot - Token:", token);
    console.log("Debug Forgot - Expires:", user.resetPasswordExpires);

    // Lưu ý: Cổng 5173 cho Frontend Dev, 5000 cho Production. Hãy chắc chắn bạn đang dùng đúng cổng.
    const resetLink = `http://localhost:5173/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Yêu cầu đặt lại mật khẩu - Hotel Management",
      text: `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu.\n\n
      Vui lòng click vào link bên dưới để đặt lại mật khẩu:\n\n
      ${resetLink}\n\n
      Nếu bạn không yêu cầu, vui lòng bỏ qua email này.`
    };

    await transporter.sendMail(mailOptions);

    res.json({ msg: "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// 2. Đặt lại mật khẩu mới
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Debug log để xem server nhận được gì
    console.log("Debug Reset - Token nhận:", token);
    console.log("Debug Reset - Giờ hiện tại:", new Date());

    // ✅ SỬA 3: Dùng new Date() để so sánh thời gian trong Database
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() } // Lớn hơn thời gian hiện tại
      }
    });

    if (!user) {
      console.log("❌ Không tìm thấy user khớp token hoặc token hết hạn.");
      return res.status(400).json({ msg: "Token không hợp lệ hoặc đã hết hạn." });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    
    await user.save();

    res.json({ msg: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};