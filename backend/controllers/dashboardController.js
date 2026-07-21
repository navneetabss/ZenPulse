const User = require("../models/User");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Department = require("../models/Department");
const Medicine = require("../models/Medicine");
const Vital = require("../models/Vital");
const asyncHandler = require("../utils/asyncHandler");

// @desc   Admin dashboard stats
// @route  GET /api/dashboard/admin
exports.getAdminStats = asyncHandler(async (req, res) => {
  const [totalPatients, totalDoctors, totalNurses, totalStaff, totalAppointments, totalDepartments, recentPatients] =
    await Promise.all([
      Patient.countDocuments(),
      User.countDocuments({ role: "doctor" }),
      User.countDocuments({ role: "nurse" }),
      User.countDocuments({ role: "staff" }),
      Appointment.countDocuments(),
      Department.countDocuments(),
      Patient.find().sort({ createdAt: -1 }).limit(5).select("fullName age gender phone createdAt"),
    ]);

  // Revenue overview: sum of medicine price*stock sold is not tracked, so we approximate
  // revenue from completed appointments (flat consultation fee) + medicine sales value.
  const CONSULTATION_FEE = 500;
  const completedAppointments = await Appointment.countDocuments({ status: "Completed" });
  const revenueFromAppointments = completedAppointments * CONSULTATION_FEE;

  const medicines = await Medicine.find().select("price stock");
  const medicineInventoryValue = medicines.reduce((sum, m) => sum + m.price * m.stock, 0);

  // Monthly registrations (patients) for the last 6 months - for the chart
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyRaw = await Patient.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyRegistrations = monthlyRaw.map((m) => ({
    label: `${monthNames[m._id.month - 1]} ${m._id.year}`,
    count: m.count,
  }));

  const appointmentsByStatus = await Appointment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

  res.json({
    success: true,
    stats: {
      totalPatients,
      totalDoctors,
      totalNurses,
      totalStaff,
      totalAppointments,
      totalDepartments,
      revenue: {
        fromAppointments: revenueFromAppointments,
        medicineInventoryValue,
        total: revenueFromAppointments + medicineInventoryValue,
      },
      recentPatients,
      monthlyRegistrations,
      appointmentsByStatus,
    },
  });
});

// @desc   Doctor dashboard stats
// @route  GET /api/dashboard/doctor
exports.getDoctorStats = asyncHandler(async (req, res) => {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date();
  dayEnd.setHours(23, 59, 59, 999);

  const [todayAppointments, assignedPatientsCount, upcomingCount, completedCount] = await Promise.all([
    Appointment.countDocuments({ doctor: req.user._id, date: { $gte: dayStart, $lte: dayEnd }, status: { $ne: "Cancelled" } }),
    Patient.countDocuments({ assignedDoctor: req.user._id }),
    Appointment.countDocuments({ doctor: req.user._id, date: { $gte: new Date() }, status: { $in: ["Pending", "Confirmed"] } }),
    Appointment.countDocuments({ doctor: req.user._id, status: "Completed" }),
  ]);

  res.json({
    success: true,
    stats: { todayAppointments, assignedPatientsCount, upcomingCount, completedCount },
  });
});

// @desc   Nurse dashboard stats
// @route  GET /api/dashboard/nurse
exports.getNurseStats = asyncHandler(async (req, res) => {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const [vitalsToday, totalVitalsLogged, criticalPatients] = await Promise.all([
    Vital.countDocuments({ nurse: req.user._id, createdAt: { $gte: dayStart } }),
    Vital.countDocuments({ nurse: req.user._id }),
    Vital.countDocuments({ status: "Critical" }),
  ]);

  res.json({ success: true, stats: { vitalsToday, totalVitalsLogged, criticalPatients } });
});

// @desc   Staff / receptionist dashboard stats
// @route  GET /api/dashboard/staff
exports.getStaffStats = asyncHandler(async (req, res) => {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date();
  dayEnd.setHours(23, 59, 59, 999);

  const [patientsRegisteredToday, appointmentsBookedToday, queueToday, totalPatients] = await Promise.all([
    Patient.countDocuments({ registeredBy: req.user._id, createdAt: { $gte: dayStart } }),
    Appointment.countDocuments({ bookedBy: req.user._id, createdAt: { $gte: dayStart } }),
    Appointment.countDocuments({ date: { $gte: dayStart, $lte: dayEnd }, status: { $ne: "Cancelled" } }),
    Patient.countDocuments(),
  ]);

  res.json({ success: true, stats: { patientsRegisteredToday, appointmentsBookedToday, queueToday, totalPatients } });
});

// @desc   Patient dashboard stats
// @route  GET /api/dashboard/patient
exports.getPatientStats = asyncHandler(async (req, res) => {
  const patientId = req.user.patientProfile;
  if (!patientId) {
    return res.json({
      success: true,
      stats: { upcomingAppointments: 0, totalAppointments: 0, totalPrescriptions: 0 },
      message: "No linked patient profile yet",
    });
  }

  const HealthRecord = require("../models/HealthRecord");
  const [upcomingAppointments, totalAppointments, totalPrescriptions] = await Promise.all([
    Appointment.countDocuments({ patient: patientId, date: { $gte: new Date() }, status: { $in: ["Pending", "Confirmed"] } }),
    Appointment.countDocuments({ patient: patientId }),
    HealthRecord.countDocuments({ patient: patientId }),
  ]);

  res.json({ success: true, stats: { upcomingAppointments, totalAppointments, totalPrescriptions } });
});
// @desc Health Check API
// @route GET /api/dashboard/health
exports.healthCheck = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "ZenPulse Backend is running successfully",
    timestamp: new Date(),
  });
};
