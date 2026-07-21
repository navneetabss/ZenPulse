const Medicine = require("../models/Medicine");
const asyncHandler = require("../utils/asyncHandler");

exports.createMedicine = asyncHandler(async (req, res) => {
  const { name, category, stock, unit, price, expiryDate, manufacturer } = req.body;
  if (!name || price === undefined || !expiryDate) {
    return res.status(400).json({ success: false, message: "Name, price and expiry date are required" });
  }

  const medicine = await Medicine.create({ name, category, stock, unit, price, expiryDate, manufacturer });
  res.status(201).json({ success: true, message: "Medicine added successfully", medicine });
});

exports.getMedicines = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };

  const medicines = await Medicine.find(filter).sort({ name: 1 });

  const now = new Date();
  const soon = new Date();
  soon.setDate(soon.getDate() + 30);

  const enriched = medicines.map((m) => ({
    ...m.toObject(),
    isLowStock: m.stock <= 10,
    isExpired: m.expiryDate < now,
    isExpiringSoon: m.expiryDate >= now && m.expiryDate <= soon,
  }));

  res.json({ success: true, count: medicines.length, medicines: enriched });
});

exports.getMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found" });
  res.json({ success: true, medicine });
});

exports.updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found" });

  const fields = ["name", "category", "stock", "unit", "price", "expiryDate", "manufacturer"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) medicine[f] = req.body[f];
  });

  await medicine.save();
  res.json({ success: true, message: "Medicine updated successfully", medicine });
});

exports.deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found" });
  await medicine.deleteOne();
  res.json({ success: true, message: "Medicine deleted successfully" });
});
