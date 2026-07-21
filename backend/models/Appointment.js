const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g. "10:30 AM"
    tokenNumber: { type: Number },
    reason: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
