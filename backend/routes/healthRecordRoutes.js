const express = require("express");
const router = express.Router();
const {
  createHealthRecord,
  getHealthRecords,
  getHealthRecord,
  updateHealthRecord,
  addReportFile,
  deleteHealthRecord,
} = require("../controllers/healthRecordController");
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .post(protect, authorize("doctor"), createHealthRecord)
  .get(protect, authorize("admin", "doctor", "nurse", "patient"), getHealthRecords);

router
  .route("/:id")
  .get(protect, getHealthRecord)
  .put(protect, authorize("doctor"), updateHealthRecord)
  .delete(protect, authorize("admin", "doctor"), deleteHealthRecord);

router.post("/:id/reports", protect, authorize("doctor"), addReportFile);

module.exports = router;
