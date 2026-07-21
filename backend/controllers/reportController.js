const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Medicine = require("../models/Medicine");
const asyncHandler = require("../utils/asyncHandler");

// @desc   Patient report - list with optional date range
// @route  GET /api/reports/patients?from=&to=
exports.patientReport = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
  }

  const patients = await Patient.find(filter).populate("department", "name").populate("assignedDoctor", "name");
  const byGender = await Patient.aggregate([{ $match: filter }, { $group: { _id: "$gender", count: { $sum: 1 } } }]);
  const byBloodGroup = await Patient.aggregate([{ $match: filter }, { $group: { _id: "$bloodGroup", count: { $sum: 1 } } }]);

  res.json({ success: true, total: patients.length, byGender, byBloodGroup, patients });
});

// @desc   Appointment report - status breakdown + list
// @route  GET /api/reports/appointments?from=&to=&status=
exports.appointmentReport = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.from || req.query.to) {
    filter.date = {};
    if (req.query.from) filter.date.$gte = new Date(req.query.from);
    if (req.query.to) filter.date.$lte = new Date(req.query.to);
  }
  if (req.query.status) filter.status = req.query.status;

  const appointments = await Appointment.find(filter)
    .populate("patient", "fullName phone")
    .populate("doctor", "name")
    .populate("department", "name")
    .sort({ date: -1 });

  const byStatus = await Appointment.aggregate([{ $match: filter }, { $group: { _id: "$status", count: { $sum: 1 } } }]);
  const byDepartment = await Appointment.aggregate([
    { $match: filter },
    { $group: { _id: "$department", count: { $sum: 1 } } },
  ]);

  res.json({ success: true, total: appointments.length, byStatus, byDepartment, appointments });
});

// @desc   Monthly report - patients registered + appointments booked per month (last 12 months)
// @route  GET /api/reports/monthly
exports.monthlyReport = asyncHandler(async (req, res) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const [patientsMonthly, appointmentsMonthly] = await Promise.all([
    Patient.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
    Appointment.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
  ]);

  const format = (arr) => arr.map((x) => ({ label: `${monthNames[x._id.m - 1]} ${x._id.y}`, count: x.count }));

  res.json({
    success: true,
    patientsMonthly: format(patientsMonthly),
    appointmentsMonthly: format(appointmentsMonthly),
  });
});

// @desc   Medicine report - stock/expiry overview
// @route  GET /api/reports/medicines
exports.medicineReport = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find().sort({ expiryDate: 1 });
  const now = new Date();
  const soon = new Date();
  soon.setDate(soon.getDate() + 30);

  const lowStock = medicines.filter((m) => m.stock <= 10);
  const expired = medicines.filter((m) => m.expiryDate < now);
  const expiringSoon = medicines.filter((m) => m.expiryDate >= now && m.expiryDate <= soon);
  const totalInventoryValue = medicines.reduce((sum, m) => sum + m.price * m.stock, 0);

  res.json({
    success: true,
    total: medicines.length,
    totalInventoryValue,
    lowStockCount: lowStock.length,
    expiredCount: expired.length,
    expiringSoonCount: expiringSoon.length,
    lowStock,
    expired,
    expiringSoon,
    medicines,
  });
});
