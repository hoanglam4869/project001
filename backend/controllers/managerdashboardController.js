const { Booking, BookingItem, RoomType, Service } = require("../models");
const { Op, fn, col, literal } = require("sequelize");

exports.getManagerDashboard = async (req, res) => {
  try {
    const { hotel_id } = req.query; // Manager gửi hotel_id lên qua params (giống service)
    
    if (!hotel_id) {
      return res.status(400).json({ msg: "Thiếu hotel_id" });
    }

    // Xác định thời gian (Tháng này và Tháng trước)
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // --- 1. CÁC CHỈ SỐ KPI (CARD) ---
    
    // A. Tổng doanh thu tháng này (chỉ tính status: checkout, service_done)
    // Lưu ý: Dùng final_price (sau giảm giá)
    const revenueThisMonth = await Booking.sum('final_price', {
      where: {
        hotel_id,
        status: { [Op.in]: ['checkout', 'service_done'] },
        updatedAt: { [Op.gte]: startOfMonth } // Tính theo ngày hoàn thành (updatedAt)
      }
    }) || 0;

    // B. Doanh thu tháng trước (để so sánh)
    const revenueLastMonth = await Booking.sum('final_price', {
        where: {
          hotel_id,
          status: { [Op.in]: ['checkout', 'service_done'] },
          updatedAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] }
        }
    }) || 0;

    // C. Tổng số Booking tháng này (tất cả trạng thái trừ cancelled)
    const totalBookings = await Booking.count({
        where: {
            hotel_id,
            status: { [Op.ne]: 'cancelled' },
            createdAt: { [Op.gte]: startOfMonth }
        }
    });

    // D. Chi phí khuyến mãi (Voucher) tháng này
    // (Total Price - Final Price)
    const bookingsWithVoucher = await Booking.findAll({
        where: {
            hotel_id,
            voucher_id: { [Op.ne]: null },
            createdAt: { [Op.gte]: startOfMonth }
        },
        attributes: ['total_price', 'final_price']
    });
    
    const voucherCost = bookingsWithVoucher.reduce((sum, b) => sum + (b.total_price - b.final_price), 0);


    // --- 2. DOANH THU THEO NGÀY (30 NGÀY QUA) ---
    // Dùng raw query hoặc group by date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 7);

    const dailyRevenue = await Booking.findAll({
        attributes: [
            [fn('DATE', col('updatedAt')), 'date'],
            [fn('SUM', col('final_price')), 'revenue']
        ],
        where: {
            hotel_id,
            status: { [Op.in]: ['checkout', 'service_done'] },
            updatedAt: { [Op.gte]: thirtyDaysAgo }
        },
        group: [fn('DATE', col('updatedAt'))],
        order: [[fn('DATE', col('updatedAt')), 'ASC']]
    });

    // --- 3. PHÂN TÍCH NGUỒN THU (PHÒNG vs DỊCH VỤ) ---
    // Query bảng BookingItem, join với Booking để lọc theo hotel_id
    const revenueSplit = await BookingItem.findAll({
        attributes: [
            [
                literal(`CASE WHEN room_type_id IS NOT NULL THEN 'Room' ELSE 'Service' END`), 
                'type'
            ],
            [fn('SUM', col('BookingItem.total_price')), 'value']
        ],
        include: [{
            model: Booking,
            attributes: [],
            where: { 
                hotel_id,
                status: { [Op.in]: ['checkout', 'service_done'] }
            }
        }],
        group: [literal(`CASE WHEN room_type_id IS NOT NULL THEN 'Room' ELSE 'Service' END`)]
    });

    // --- 4. TOP 5 DỊCH VỤ BÁN CHẠY ---
    const topServices = await BookingItem.findAll({
        attributes: [
            [fn('COUNT', col('BookingItem.service_id')), 'count'],
            [fn('SUM', col('BookingItem.total_price')), 'total_revenue']
        ],
        include: [
            {
                model: Service,
                attributes: ['name']
            },
            {
                model: Booking,
                attributes: [],
                where: { hotel_id }
            }
        ],
        where: {
            service_id: { [Op.ne]: null }
        },
        group: ['BookingItem.service_id', 'Service.name'], // Group theo ID và Tên
        order: [[fn('COUNT', col('BookingItem.service_id')), 'DESC']],
        limit: 5
    });

    res.json({
        kpi: {
            revenue: revenueThisMonth,
            revenueLastMonth,
            totalBookings,
            voucherCost
        },
        charts: {
            dailyRevenue,
            revenueSplit,
            topServices: topServices.map(s => ({
                name: s.Service ? s.Service.name : "Unknown",
                count: s.dataValues.count,
                revenue: s.dataValues.total_revenue
            }))
        }
    });

  } catch (err) {
    console.error("Manager Dashboard Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};