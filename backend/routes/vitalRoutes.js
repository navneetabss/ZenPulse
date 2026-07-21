const express = require("express");
const router = express.Router();
const {
  createVital,
  getVitals,
  getWardBoard,
  updateVital,
  deleteVital,
} = require("../controllers/vitalController");
const { protect, authorize } = require("../middleware/auth");

router.get("/board/latest", protect, authorize("admin", "nurse", "doctor"), getWardBoard);

router
  .route("/")
  .post(protect, authorize("nurse"), createVital)
  .get(protect, authorize("admin", "nurse", "doctor", "patient"), getVitals);

router
  .route("/:id")
  .put(protect, authorize("nurse"), updateVital)
  .delete(protect, authorize("admin", "nurse"), deleteVital);

module.exports = router;
