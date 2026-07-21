const HealthRecord = require("../models/HealthRecord");
const asyncHandler = require("../utils/asyncHandler");

// @desc   Doctor adds a health record (diagnosis + prescription + notes) for a patient
// @route  POST /api/health-records
exports.createHealthRecord = asyncHandler(async (req, res) => {
  const { patient, appointment, diagnosis, prescription, notes } = req.body;
  if (!patient) return res.status(400).json({ success: false, message: "Patient is required" });

  const record = await HealthRecord.create({
    patient,
    doctor: req.user._id,
    appointment,
    diagnosis,
    prescription,
    notes,
  });

  res.status(201).json({ success: true, message: "Health record created", record });
});

// @desc   Get health records for a patient (medical history / prescriptions)
// @route  GET /api/health-records?patient=id
exports.getHealthRecords = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "patient") {
    filter.patient = req.user.patientProfile;
  } else {
    if (req.query.patient) filter.patient = req.query.patient;
    if (req.query.doctor) filter.doctor = req.query.doctor;
  }

  const records = await HealthRecord.find(filter)
    .populate("patient", "fullName phone")
    .populate("doctor", "name specialization")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: records.length, records });
});

// @desc   Get single health record
// @route  GET /api/health-records/:id
exports.getHealthRecord = asyncHandler(async (req, res) => {
  const record = await HealthRecord.findById(req.params.id)
    .populate("patient", "fullName phone bloodGroup age gender")
    .populate("doctor", "name specialization");
  if (!record) return res.status(404).json({ success: false, message: "Health record not found" });
  res.json({ success: true, record });
});

// @desc   Update health record (edit diagnosis/prescription/notes)
// @route  PUT /api/health-records/:id
exports.updateHealthRecord = asyncHandler(async (req, res) => {
  const record = await HealthRecord.findById(req.params.id);
  if (!record) return res.status(404).json({ success: false, message: "Health record not found" });

  const fields = ["diagnosis", "prescription", "notes"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) record[f] = req.body[f];
  });

  await record.save();
  res.json({ success: true, message: "Health record updated", record });
});

// @desc   Upload a report file link (stored as base64/url string) to a health record
// @route  POST /api/health-records/:id/reports
exports.addReportFile = asyncHandler(async (req, res) => {
  const { fileName, fileUrl } = req.body;
  if (!fileName || !fileUrl) {
    return res.status(400).json({ success: false, message: "fileName and fileUrl are required" });
  }

  const record = await HealthRecord.findById(req.params.id);
  if (!record) return res.status(404).json({ success: false, message: "Health record not found" });

  record.reportFiles.push({ fileName, fileUrl });
  await record.save();
  res.status(201).json({ success: true, message: "Report uploaded", record });
});

// @desc   Delete a health record
// @route  DELETE /api/health-records/:id
exports.deleteHealthRecord = asyncHandler(async (req, res) => {
  const record = await HealthRecord.findById(req.params.id);
  if (!record) return res.status(404).json({ success: false, message: "Health record not found" });
  await record.deleteOne();
  res.json({ success: true, message: "Health record deleted" });
});
