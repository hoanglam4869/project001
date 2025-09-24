const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/db");

// Import models
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
// User
const userRoutes = require("./routes/user");
app.use("/api/users", userRoutes);
// Hotel
const hotelRoutes = require("./routes/hotel");
app.use("/api/hotels", hotelRoutes);
// // room
const roomRoutes = require("./routes/room");
const roomTypeRoutes = require("./routes/roomType");

app.use("/api/roomTypes", roomTypeRoutes);
app.use("/api/rooms", roomRoutes);








app.get("/", (req, res) => {
  res.send("Hotel Management API running...");
});

// Sync DB + start server
sequelize.sync()
  .then(async () => {
    console.log("✅ MySQL Synced");

    // 👑 Tạo admin mặc định nếu chưa có
    const adminEmail = "admin@example.com";
    const existAdmin = await User.findOne({ where: { email: adminEmail } });
    if (!existAdmin) {
      await User.create({
        name: "Admin",
        email: "admin@example.com",
        password: "123456", // bcrypt hash nhờ hook trong model User
        role: "admin"
      });
    }

    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("❌ DB error:", err));
