const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

// @desc   Admin creates a staff account (doctor / nurse / staff / admin)
// @route  POST /api/users
// @access Private/Admin
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, department, specialization } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: "Name, email, password and role are required" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: "An account with this email already exists" });
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role,
    phone,
    department: department || undefined,
    specialization,
  });

  res.status(201).json({ success: true, message: `${role} account created`, user: sanitize(user) });
});

// @desc   Get all users (filter by role via ?role=doctor)
// @route  GET /api/users
// @access Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const users = await User.find(filter).populate("department", "name").sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users: users.map(sanitize) });
});

// @desc   Get single user
// @route  GET /api/users/:id
// @access Private/Admin
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate("department", "name");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user: sanitize(user) });
});

// @desc   Update a user (admin)
// @route  PUT /api/users/:id
// @access Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
  const { name, phone, role, department, specialization, isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (role) user.role = role;
  if (department) user.department = department;
  if (specialization) user.specialization = specialization;
  if (typeof isActive === "boolean") user.isActive = isActive;

  await user.save();
  res.json({ success: true, message: "User updated", user: sanitize(user) });
});

// @desc   Delete a user
// @route  DELETE /api/users/:id
// @access Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  if (user.role === "admin") {
    return res.status(400).json({ success: false, message: "Cannot delete an admin account" });
  }
  await user.deleteOne();
  res.json({ success: true, message: "User deleted" });
});

// @desc   List doctors (used for dropdowns e.g. assign doctor / book appointment)
// @route  GET /api/users/doctors/list
// @access Private
exports.listDoctors = asyncHandler(async (req, res) => {
  const filter = { role: "doctor", isActive: true };
  if (req.query.department) filter.department = req.query.department;
  const doctors = await User.find(filter).select("name email specialization department").populate("department", "name");
  res.json({ success: true, doctors });
});

function sanitize(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    profilePhoto: user.profilePhoto,
    department: user.department,
    specialization: user.specialization,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}
