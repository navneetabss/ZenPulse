const mongoose = require("mongoose");

const vitalSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    nurse: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bloodPressure: { type: String, required: true }, // "120/80"
    temperature: { type: Number, required: true }, // Fahrenheit
    heartRate: { type: Number, required: true }, // bpm
    oxygenLevel: { type: Number, required: true }, // %
    wardNotes: { type: String, trim: true, default: "" },
    medicationGiven: {
      type: String,
      enum: ["Pending", "Given", "Skipped"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["Stable", "Critical", "Under Observation", "Recovering"],
      default: "Stable",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vital", vitalSchema);
