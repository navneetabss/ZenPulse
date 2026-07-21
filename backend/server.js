const path = require("path");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");
console.log("MONGO_URI =", process.env.MONGO_URI);
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "10mb" })); // higher limit to allow base64 profile photo / report uploads
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));
app.use("/api/patients", require("./routes/patientRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/medicines", require("./routes/medicineRoutes"));
app.use("/api/health-records", require("./routes/healthRecordRoutes"));
app.use("/api/vitals", require("./routes/vitalRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HealthCare Pro API is running",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});
app.get("/api/info", (req, res) => {
  res.status(200).json({
    success: true,
    project: "ZenPulse Healthcare Management System",
    version: "1.0.0",
    backend: "Node.js + Express",
    database: "MongoDB",
    author: "Group 31",
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HealthCare Pro API running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
