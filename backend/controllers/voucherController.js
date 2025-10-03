const Voucher = require("../models/Voucher");

// Create Voucher (staff/manager)
exports.createVoucher = async (req, res) => {
  try {
    const { name, description, type, voucher_value, start_date, end_date } = req.body;

    // chỉ staff/manager tạo được voucher cho hotel của mình
    if (req.user.role !== "staff" && req.user.role !== "manager") {
      return res.status(403).json({ msg: "Only staff or manager can create vouchers" });
    }

    const voucher = await Voucher.create({
      hotel_id: req.user.hotel_id,
      name,
      description,
      type,
      voucher_value,
      start_date,
      end_date,
    });

    res.status(201).json(voucher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Get all vouchers of hotel
exports.getVouchers = async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role === "staff" || req.user.role === "manager") {
      whereClause.hotel_id = req.user.hotel_id;
    }
    const vouchers = await Voucher.findAll({ where: whereClause });
    res.json(vouchers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get voucher by ID
exports.getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await Voucher.findByPk(id);
    if (!voucher) return res.status(404).json({ msg: "Voucher not found" });

    if ((req.user.role === "staff" || req.user.role === "manager") && voucher.hotel_id !== req.user.hotel_id) {
      return res.status(403).json({ msg: "You can only view vouchers of your hotel" });
    }

    res.json(voucher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update voucher
exports.updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await Voucher.findByPk(id);
    if (!voucher) return res.status(404).json({ msg: "Voucher not found" });

    if ((req.user.role === "staff" || req.user.role === "manager") && voucher.hotel_id !== req.user.hotel_id) {
      return res.status(403).json({ msg: "You can only update vouchers of your hotel" });
    }

    const { name, description, type, voucher_value, start_date, end_date } = req.body;

    voucher.name = name || voucher.name;
    voucher.description = description || voucher.description;
    voucher.type = type || voucher.type;
    voucher.voucher_value = voucher_value || voucher.voucher_value;
    voucher.start_date = start_date || voucher.start_date;
    voucher.end_date = end_date || voucher.end_date;

    await voucher.save();
    res.json(voucher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete voucher
exports.deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await Voucher.findByPk(id);
    if (!voucher) return res.status(404).json({ msg: "Voucher not found" });

    if ((req.user.role === "staff" || req.user.role === "manager") && voucher.hotel_id !== req.user.hotel_id) {
      return res.status(403).json({ msg: "You can only delete vouchers of your hotel" });
    }

    await voucher.destroy();
    res.json({ msg: "Voucher deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
