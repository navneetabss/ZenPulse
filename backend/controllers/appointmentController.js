const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

// @desc   Book a new appointment (generates a daily token number per department)
// @route  POST /api/appointments
exports.bookAppointment = asyncHandler(async (req, res) => {
  const { doctor, department, date, time, reason } = req.body;
  const patient = req.user.role === "patient" ? req.user.patientProfile : req.body.patient;

  if (!patient || !department || !date || !time) {
    return res.status(400).json({ success: false, message: "Patient, department, date and time are required" });
  }

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const countToday = await Appointment.countDocuments({
    department,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $ne: "Cancelled" },
  });

  const appointment = await Appointment.create({
    patient,
    doctor: doctor || undefined,
    department,
    date,
    time,
    reason,
    tokenNumber: countToday + 1,
    bookedBy: req.user._id,
  });

  const populated = await appointment.populate([
    { path: "patient", select: "fullName phone" },
    { path: "doctor", select: "name specialization" },
    { path: "department", select: "name" },
  ]);

  res.status(201).json({ success: true, message: "Appointment booked successfully", appointment: populated });
});

// @desc   Get all appointments (filters: status, doctor, patient, date, department)
// @route  GET /api/appointments
exports.getAppointments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "patient") {
    filter.patient = req.user.patientProfile;
  } else if (req.query.patient) {
    filter.patient = req.query.patient;
  }
  if (req.query.status) filter.status = req.query.status;
  if (req.query.doctor) filter.doctor = req.query.doctor;
  if (req.query.department) filter.department = req.query.department;
  if (req.query.date) {
    const dayStart = new Date(req.query.date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(req.query.date);
    dayEnd.setHours(23, 59, 59, 999);
    filter.date = { $gte: dayStart, $lte: dayEnd };
  }

  const appointments = await Appointment.find(filter)
    .populate("patient", "fullName phone bloodGroup")
    .populate("doctor", "name specialization")
    .populate("department", "name")
    .sort({ date: 1, tokenNumber: 1 });

  res.json({ success: true, count: appointments.length, appointments });
});

// @desc   Get appointment by id
// @route  GET /api/appointments/:id
exports.getAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("patient")
    .populate("doctor", "name specialization")
    .populate("department", "name");
  if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
  res.json({ success: true, appointment });
});

// @desc   Update / edit appointment
// @route  PUT /api/appointments/:id
exports.updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

  const fields = ["doctor", "department", "date", "time", "reason", "status"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) appointment[f] = req.body[f];
  });

  await appointment.save();
  res.json({ success: true, message: "Appointment updated successfully", appointment });
});

// @desc   Cancel appointment
// @route  PUT /api/appointments/:id/cancel
exports.cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

  if (req.user.role === "patient" && String(appointment.patient) !== String(req.user.patientProfile)) {
    return res.status(403).json({ success: false, message: "You can only cancel your own appointments" });
  }

  appointment.status = "Cancelled";
  await appointment.save();
  res.json({ success: true, message: "Appointment cancelled", appointment });
});

// @desc   Upcoming appointments for logged-in patient (via ?patient=id) or all upcoming
// @route  GET /api/appointments/list/upcoming
exports.getUpcoming = asyncHandler(async (req, res) => {
  const filter = {
    date: { $gte: new Date() },
    status: { $in: ["Pending", "Confirmed"] },
  };
  if (req.query.patient) filter.patient = req.query.patient;
  if (req.query.doctor) filter.doctor = req.query.doctor;

  const appointments = await Appointment.find(filter)
    .populate("patient", "fullName phone")
    .populate("doctor", "name specialization")
    .populate("department", "name")
    .sort({ date: 1 });

  res.json({ success: true, count: appointments.length, appointments });
});

// @desc   Today's queue for a department (staff/receptionist token board)
// @route  GET /api/appointments/list/queue
exports.getQueue = asyncHandler(async (req, res) => {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date();
  dayEnd.setHours(23, 59, 59, 999);

  const filter = { date: { $gte: dayStart, $lte: dayEnd }, status: { $ne: "Cancelled" } };
  if (req.query.department) filter.department = req.query.department;
  if (req.query.doctor) filter.doctor = req.query.doctor;

  const appointments = await Appointment.find(filter)
    .populate("patient", "fullName phone")
    .populate("doctor", "name")
    .populate("department", "name")
    .sort({ tokenNumber: 1 });

  res.json({ success: true, count: appointments.length, appointments });
});

// @desc   Today's appointments for logged-in doctor
// @route  GET /api/appointments/list/today
exports.getTodayForDoctor = asyncHandler(async (req, res) => {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date();
  dayEnd.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    doctor: req.user._id,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $ne: "Cancelled" },
  })
    .populate("patient", "fullName phone bloodGroup age gender")
    .populate("department", "name")
    .sort({ tokenNumber: 1 });

  res.json({ success: true, count: appointments.length, appointments });
});
