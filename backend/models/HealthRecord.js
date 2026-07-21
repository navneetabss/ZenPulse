const mongoose = require("mongoose");

const prescriptionItemSchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true },
    dosage: { type: String, default: "" }, // e.g. "1-0-1"
    duration: { type: String, default: "" }, // e.g. "5 days"
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const healthRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    diagnosis: { type: String, trim: true, default: "" },
    prescription: [prescriptionItemSchema],
    notes: { type: String, trim: true, default: "" },
    reportFiles: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthRecord", healthRecordSchema);
