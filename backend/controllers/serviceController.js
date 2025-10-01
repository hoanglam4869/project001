const Service = require("../models/Service");

// Tạo service
exports.createService = async (req, res) => {
  try {
    const { hotel_id, name, description, price } = req.body;

    // Chỉ manager hotel_id của mình mới được tạo
    if (req.user.role !== "manager" || req.user.hotel_id !== hotel_id) {
      return res.status(403).json({ msg: "You can only create services for your hotel" });
    }

    const service = await Service.create({ hotel_id, name, description, price });
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Lấy tất cả services theo hotel
exports.getServices = async (req, res) => {
  try {
    const { hotel_id } = req.query;
    const services = await Service.findAll({ where: { hotel_id } });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Lấy service theo id
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

// Update service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);

    if (!service) return res.status(404).json({ msg: "Service not found" });
    if (req.user.role !== "manager" || req.user.hotel_id !== service.hotel_id) {
      return res.status(403).json({ msg: "You can only update your hotel's services" });
    }

    await service.update(req.body);
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);

    if (!service) return res.status(404).json({ msg: "Service not found" });
    if (req.user.role !== "manager" || req.user.hotel_id !== service.hotel_id) {
      return res.status(403).json({ msg: "You can only delete your hotel's services" });
    }

    await service.destroy();
    res.json({ msg: "Service deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
