const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail", // Hoặc dùng SMTP của host khác
  auth: {
    user: process.env.EMAIL_USER ||"hoanglam4869@gmail.com", // Email của bạn (VD: admin@hotel.com)
    pass: process.env.EMAIL_PASS || "irqf mifm qixn gxca" // Mật khẩu ứng dụng (App Password), KHÔNG phải mật khẩu đăng nhập gmail
  },
});

module.exports = transporter;