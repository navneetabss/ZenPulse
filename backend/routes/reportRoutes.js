const express = require("express");
const router = express.Router();
const {
  patientReport,
  appointmentReport,
  monthlyReport,
  medicineReport,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/auth");

router.get("/patients", protect, authorize("admin"), patientReport);
router.get("/appointments", protect, authorize("admin"), appointmentReport);
router.get("/monthly", protect, authorize("admin"), monthlyReport);
router.get("/medicines", protect, authorize("admin"), medicineReport);

module.exports = router;
