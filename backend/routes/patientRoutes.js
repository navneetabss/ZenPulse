const express = require("express");
const router = express.Router();
const {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient,
  getMyAssignedPatients,
} = require("../controllers/patientController");
const { protect, authorize } = require("../middleware/auth");

router.get("/my/assigned", protect, authorize("doctor"), getMyAssignedPatients);

router
  .route("/")
  .post(protect, authorize("admin", "staff"), createPatient)
  .get(protect, authorize("admin", "doctor", "nurse", "staff"), getPatients);

router
  .route("/:id")
  .get(protect, authorize("admin", "doctor", "nurse", "staff"), getPatient)
  .put(protect, authorize("admin", "staff", "doctor"), updatePatient)
  .delete(protect, authorize("admin"), deletePatient);

module.exports = router;
