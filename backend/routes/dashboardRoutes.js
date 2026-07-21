const express = require("express");
const router = express.Router();
const {
  getAdminStats,
  getDoctorStats,
  getNurseStats,
  getStaffStats,
  getPatientStats,
} = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/auth");

router.get("/admin", protect, authorize("admin"), getAdminStats);
router.get("/doctor", protect, authorize("doctor"), getDoctorStats);
router.get("/nurse", protect, authorize("nurse"), getNurseStats);
router.get("/staff", protect, authorize("staff"), getStaffStats);
router.get("/patient", protect, authorize("patient"), getPatientStats);

module.exports = router;
