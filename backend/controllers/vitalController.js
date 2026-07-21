const Vital = require("../models/Vital");
const asyncHandler = require("../utils/asyncHandler");

// @desc   Nurse enters vitals for a patient
// @route  POST /api/vitals
exports.createVital = asyncHandler(async (req, res) => {
  const { patient, bloodPressure, temperature, heartRate, oxygenLevel, wardNotes, medicationGiven, status } = req.body;

  if (!patient || !bloodPressure || temperature === undefined || heartRate === undefined || oxygenLevel === undefined) {
    return res.status(400).json({
      success: false,
      message: "Patient, blood pressure, temperature, heart rate and oxygen level are required",
    });
  }

  const vital = await Vital.create({
    patient,
    nurse: req.user._id,
    bloodPressure,
    temperature,
    heartRate,
    oxygenLevel,
    wardNotes,
    medicationGiven,
    status,
  });

  const populated = await vital.populate("patient", "fullName phone bloodGroup");
  res.status(201).json({ success: true, message: "Vitals recorded successfully", vital: populated });
});

// @desc   Get vitals (ward board) - latest per patient or full history for one patient
// @route  GET /api/vitals?patient=id
exports.getVitals = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "patient") {
    filter.patient = req.user.patientProfile;
  } else if (req.query.patient) {
    filter.patient = req.query.patient;
  }

  const vitals = await Vital.find(filter)
    .populate("patient", "fullName phone bloodGroup age gender")
    .populate("nurse", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: vitals.length, vitals });
});

// @desc   Get the most recent vital entry per patient (ward overview board)
// @route  GET /api/vitals/board/latest
exports.getWardBoard = asyncHandler(async (req, res) => {
  const latest = await Vital.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$patient",
        doc: { $first: "$$ROOT" },
      },
    },
    { $replaceRoot: { newRoot: "$doc" } },
    { $sort: { createdAt: -1 } },
  ]);

  await Vital.populate(latest, [
    { path: "patient", select: "fullName phone bloodGroup age gender" },
    { path: "nurse", select: "name" },
  ]);

  res.json({ success: true, count: latest.length, board: latest });
});

// @desc   Update a vital entry
// @route  PUT /api/vitals/:id
exports.updateVital = asyncHandler(async (req, res) => {
  const vital = await Vital.findById(req.params.id);
  if (!vital) return res.status(404).json({ success: false, message: "Vital record not found" });

  const fields = ["bloodPressure", "temperature", "heartRate", "oxygenLevel", "wardNotes", "medicationGiven", "status"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) vital[f] = req.body[f];
  });

  await vital.save();
  res.json({ success: true, message: "Vitals updated", vital });
});

// @desc   Delete a vital entry
// @route  DELETE /api/vitals/:id
exports.deleteVital = asyncHandler(async (req, res) => {
  const vital = await Vital.findById(req.params.id);
  if (!vital) return res.status(404).json({ success: false, message: "Vital record not found" });
  await vital.deleteOne();
  res.json({ success: true, message: "Vital record deleted" });
});
