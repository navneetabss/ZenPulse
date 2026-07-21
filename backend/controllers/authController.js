const crypto = require("crypto");
const User = require("../models/User");
const Patient = require("../models/Patient");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, department, specialization, age, gender, bloodGroup } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email and password are required" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: "An account with this email already exists" });
  }

  // Only allow safe self-registration roles from the public form; admin can create doctor/nurse/staff via Manage Users
  const allowedSelfRoles = ["patient"];
  const finalRole = allowedSelfRoles.includes(role) ? role : "patient";

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: finalRole,
    phone,
    department: department || undefined,
    specialization,
  });

  // Self-registered patients get a linked Patient record right away so they can
  // book appointments and see their dashboard without staff intervention.
  if (finalRole === "patient") {
    const patient = await Patient.create({
      user: user._id,
      fullName: name,
      age: age || 0,
      gender: gender || "Other",
      bloodGroup: bloodGroup || "O+",
      phone: phone || "",
      email: email.toLowerCase(),
      registeredBy: user._id,
    });
    user.patientProfile = patient._id;
    await user.save();
  }

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token,
    user: sanitizeUser(user),
  });
});

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: "This account has been deactivated. Contact admin." });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: "Login successful",
    token,
    user: sanitizeUser(user),
  });
});

// @desc   Get logged-in user profile
// @route  GET /api/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("department", "name");
  res.json({ success: true, user: sanitizeUser(user) });
});

// @desc   Forgot password - generates reset token
// @route  POST /api/auth/forgot-password
// @access Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });

  // Always respond success (avoid leaking which emails are registered)
  if (!user) {
    return res.json({
      success: true,
      message: "If an account with that email exists, a reset link has been generated.",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save({ validateBeforeSave: false });

  // In production this would be emailed. For this project we return it directly
  // so the frontend Reset Password page can be demoed without an email service.
  res.json({
    success: true,
    message: "Reset token generated. In production this would be emailed to the user.",
    resetToken,
  });
});

// @desc   Reset password using token
// @route  PUT /api/auth/reset-password/:resetToken
// @access Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpire");

  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = generateToken(user._id);

  res.json({ success: true, message: "Password reset successful", token, user: sanitizeUser(user) });
});

// @desc   Update own profile
// @route  PUT /api/auth/profile
// @access Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, specialization } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (specialization && ["doctor"].includes(user.role)) user.specialization = specialization;

  await user.save();
  res.json({ success: true, message: "Profile updated", user: sanitizeUser(user) });
});

// @desc   Change own password
// @route  PUT /api/auth/change-password
// @access Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    return res.status(401).json({ success: false, message: "Current password is incorrect" });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: "Password changed successfully" });
});

// @desc   Upload / update profile photo (base64 data URL string)
// @route  PUT /api/auth/profile-photo
// @access Private
exports.uploadProfilePhoto = asyncHandler(async (req, res) => {
  const { photo } = req.body; // expects base64 data URL from frontend
  if (!photo) {
    return res.status(400).json({ success: false, message: "No photo data provided" });
  }
  const user = await User.findById(req.user._id);
  user.profilePhoto = photo;
  await user.save();
  res.json({ success: true, message: "Profile photo updated", profilePhoto: user.profilePhoto });
});

function sanitizeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    profilePhoto: user.profilePhoto,
    department: user.department,
    specialization: user.specialization,
    patientProfile: user.patientProfile,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}
