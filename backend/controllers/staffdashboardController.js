const { Booking, RoomType } = require("../models");
const { Op } = require("sequelize");

exports.getStaffDashboard = async (req, res) => {
  try {
    const { hotel_id } = req.user; // Lấy hotel_id từ token (middleware verifyToken)

    if (!hotel_id) {
      return res.status(403).json({ msg: "Nhân viên chưa được gán vào khách sạn nào." });
    }

    // Xác định khoảng thời gian hôm nay
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Xác định 7 ngày trước cho biểu đồ
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // --- 1. NHÓM VẬN HÀNH (OPERATIONS) ---
    // Dùng Promise.all để chạy song song cho nhanh
    const [
      arrivals, 
      departures, 
      staying, 
      pending, 
      overdue
    ] = await Promise.all([
      // Khách sắp đến (Check-in hôm nay & status = accepted)
      Booking.count({
        where: {
          hotel_id,
          status: 'accepted',
          checkin_date: { [Op.between]: [startOfDay, endOfDay] }
        }
      }),
      // Khách sắp đi (Check-out hôm nay & status = checkin)
      Booking.count({
        where: {
          hotel_id,
          status: 'checkin',
          checkout_date: { [Op.between]: [startOfDay, endOfDay] }
        }
      }),
      // Khách đang ở (Status = checkin)
      Booking.count({
        where: { hotel_id, status: 'checkin' }
      }),
      // Đơn chờ xử lý (Status = pending)
      Booking.count({
        where: { hotel_id, status: 'pending' }
      }),
      // Quá hạn trả phòng (Checkout < Hiện tại & Status = checkin)
      Booking.count({
        where: {
          hotel_id,
          status: 'checkin',
          checkout_date: { [Op.lt]: new Date() } // lt: less than (nhỏ hơn giờ hiện tại)
        }
      })
    ]);

    // --- 2. NHÓM CÔNG SUẤT (OCCUPANCY) ---
    // Lấy tổng số lượng phòng (Capacity) và Số phòng trống (Available) từ bảng RoomType
    // Lưu ý: Ở bài trước ta đã chốt logic: 'capacity' là tổng phòng, 'available' là phòng trống hiện tại
    const roomStats = await RoomType.findAll({
      where: { hotel_id },
      attributes: ['capacity', 'available']
    });

    let totalRooms = 0;
    let totalAvailable = 0;

    roomStats.forEach(rt => {
      totalRooms += rt.capacity;
      totalAvailable += rt.available;
    });

    const occupancyRate = totalRooms > 0 
      ? Math.round(((totalRooms - totalAvailable) / totalRooms) * 100) 
      : 0;

    // --- 4. NHÓM BIỂU ĐỒ TUẦN (WEEKLY BOOKINGS CHART) ---
    // Lấy tất cả booking được TẠO (createdAt) trong 7 ngày qua
    const weeklyData = await Booking.findAll({
      where: {
        hotel_id,
        createdAt: { [Op.gte]: sevenDaysAgo } // gte: greater than or equal
      },
      attributes: ['createdAt']
    });

    // Xử lý dữ liệu để trả về mảng cho Frontend vẽ biểu đồ
    // Tạo mảng 7 ngày mặc định là 0
    const chartData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Đếm số booking trong ngày đó
      const count = weeklyData.filter(b => 
        b.createdAt.toISOString().split('T')[0] === dateString
      ).length;

      chartData.unshift({ date: dateString, bookings: count }); // Đẩy vào đầu để ngày cũ bên trái
    }

    // --- TRẢ VỀ KẾT QUẢ ---
    res.json({
      operations: {
        arrivals,
        departures,
        staying,
        pending,
        overdue
      },
      occupancy: {
        totalRooms,
        available: totalAvailable,
        occupied: totalRooms - totalAvailable,
        rate: occupancyRate
      },
      chart: chartData
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ msg: "Lỗi Server khi tải Dashboard." });
  }
};