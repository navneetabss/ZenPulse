const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: [true, "Password is required"], minlength: 6, select: false },
    role: {
      type: String,
      enum: ["admin", "doctor", "nurse", "staff", "patient"],
      default: "patient",
    },
    phone: { type: String, trim: true },
    profilePhoto: { type: String, default: "" },
    // Doctor-specific
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    specialization: { type: String, trim: true },
    // Link to patient record if role === 'patient'
    patientProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    isActive: { type: Boolean, default: true },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
