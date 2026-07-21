const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: "General" },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, default: "tablets" },
    price: { type: Number, required: true, default: 0 },
    expiryDate: { type: Date, required: true },
    manufacturer: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);
