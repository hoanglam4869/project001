const Service = require("../models/Service");

// 1. Tạo service (Cần Token & Role Manager)
exports.createService = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    
    // Lấy thông tin từ Token (đã qua middleware verifyToken)
    const { role, hotel_id } = req.user;

    // Kiểm tra kỹ hơn: Phải là manager và đã được gán hotel_id
    if (role !== "manager" || !hotel_id) {
      return res.status(403).json({ msg: "Bạn không có quyền tạo dịch vụ (Thiếu hotel_id hoặc sai role)." });
    }

    const service = await Service.create({ 
        hotel_id, // Tự động lấy từ token của manager
        name, 
        description, 
        price 
    });
    
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// 2. Lấy danh sách services (PUBLIC - Không dùng req.user)
exports.getServices = async (req, res) => {
  try {
    // Lấy hotel_id từ URL (Query Params)
    // Ví dụ: GET /api/services?hotel_id=2
    const { hotel_id } = req.query;
    
    let whereClause = {};
    
    // Nếu URL có hotel_id thì lọc, không thì trả về hết (hoặc rỗng tùy logic bạn muốn)
    if (hotel_id) {
        whereClause.hotel_id = hotel_id;
    }

    const services = await Service.findAll({ where: whereClause });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// 3. Lấy service theo id (PUBLIC)
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ msg: "Service not found" });
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// 4. Update service (Cần Token & Check quyền sở hữu)
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);

    if (!service) return res.status(404).json({ msg: "Service not found" });
    
    // Check: Manager đang đăng nhập có quản lý khách sạn sở hữu dịch vụ này không?
    if (req.user.role !== "manager" || req.user.hotel_id !== service.hotel_id) {
      return res.status(403).json({ msg: "Bạn chỉ có thể chỉnh sửa dịch vụ của khách sạn mình quản lý." });
    }

    const { name, description, price } = req.body;
    
    await service.update({ name, description, price });
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// 5. Delete service (Cần Token & Check quyền sở hữu)
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);

    if (!service) return res.status(404).json({ msg: "Service not found" });
    
    // Check quyền sở hữu
    if (req.user.role !== "manager" || req.user.hotel_id !== service.hotel_id) {
      return res.status(403).json({ msg: "Bạn chỉ có thể xóa dịch vụ của khách sạn mình quản lý." });
    }

    await service.destroy();
    res.json({ msg: "Service deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};