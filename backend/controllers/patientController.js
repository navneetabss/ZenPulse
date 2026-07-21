const Patient = require("../models/Patient");
const asyncHandler = require("../utils/asyncHandler");

// @desc   Add a new patient (Staff/Receptionist or Admin)
// @route  POST /api/patients
exports.createPatient = asyncHandler(async (req, res) => {
  const {
    fullName,
    age,
    gender,
    bloodGroup,
    phone,
    email,
    address,
    emergencyContact,
    medicalHistory,
    department,
    assignedDoctor,
  } = req.body;

  if (!fullName || !age || !gender || !bloodGroup || !phone) {
    return res.status(400).json({
      success: false,
      message: "Full name, age, gender, blood group and phone are required",
    });
  }

  const patient = await Patient.create({
    fullName,
    age,
    gender,
    bloodGroup,
    phone,
    email,
    address,
    emergencyContact,
    medicalHistory,
    department: department || undefined,
    assignedDoctor: assignedDoctor || undefined,
    registeredBy: req.user._id,
  });

  res.status(201).json({ success: true, message: "Patient added successfully", patient });
});

// @desc   Get all patients (search + pagination)
// @route  GET /api/patients?search=&page=&limit=
exports.getPatients = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const filter = {};

  if (req.query.search) {
    filter.$or = [
      { fullName: { $regex: req.query.search, $options: "i" } },
      { phone: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }
  if (req.query.doctor) filter.assignedDoctor = req.query.doctor;
  if (req.query.department) filter.department = req.query.department;

  const total = await Patient.countDocuments(filter);
  const patients = await Patient.find(filter)
    .populate("assignedDoctor", "name specialization")
    .populate("department", "name")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    count: patients.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    patients,
  });
});

// @desc   Get single patient details
// @route  GET /api/patients/:id
exports.getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id)
    .populate("assignedDoctor", "name specialization")
    .populate("department", "name");
  if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
  res.json({ success: true, patient });
});

// @desc   Update patient
// @route  PUT /api/patients/:id
exports.updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

  const fields = [
    "fullName",
    "age",
    "gender",
    "bloodGroup",
    "phone",
    "email",
    "address",
    "emergencyContact",
    "medicalHistory",
    "department",
    "assignedDoctor",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) patient[f] = req.body[f];
  });

  await patient.save();
  res.json({ success: true, message: "Patient updated successfully", patient });
});

// @desc   Delete patient
// @route  DELETE /api/patients/:id
exports.deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
  await patient.deleteOne();
  res.json({ success: true, message: "Patient deleted successfully" });
});

// @desc   Get patients assigned to logged in doctor
// @route  GET /api/patients/my/assigned
exports.getMyAssignedPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find({ assignedDoctor: req.user._id })
    .populate("department", "name")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: patients.length, patients });
});
