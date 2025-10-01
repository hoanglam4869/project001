const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/db");

// Import models
const User = require("./models/User");

// Khởi tạo app
const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const hotelRoutes = require("./routes/hotel");
const roomTypeRoutes = require("./routes/roomType");
const serviceRoutes = require("./routes/service");
const bookingRoutes = require("./routes/booking");
const bookingItemRoutes = require("./routes/bookingItem");

// Gắn routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/roomTypes", roomTypeRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/bookingItems", bookingItemRoutes);

// Test route
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
        password: "123456", // sẽ hash nhờ hook trong User model
        role: "admin"
      });
      console.log("👑 Default admin created");
    }

    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("❌ DB error:", err));
