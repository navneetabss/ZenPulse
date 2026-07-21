// Run with: npm run seed
// Creates a default admin account and standard departments if they don't already exist.
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Department = require("../models/Department");

const DEFAULT_DEPARTMENTS = ["General", "Cardiology", "Orthopedics", "Neurology", "Pediatrics", "ENT", "Dermatology"];

const seed = async () => {
  await connectDB();

  // Departments
  for (const name of DEFAULT_DEPARTMENTS) {
    const exists = await Department.findOne({ name });
    if (!exists) {
      await Department.create({ name, description: `${name} department` });
      console.log(`Created department: ${name}`);
    }
  }

  // Default admin
  const adminEmail = "admin@healthcarepro.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "System Admin",
      email: adminEmail,
      password: "Admin@123",
      role: "admin",
      phone: "9999999999",
    });
    console.log(`Created default admin: ${adminEmail} / Admin@123`);
  } else {
    console.log("Default admin already exists");
  }

  console.log("Seeding complete.");
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
