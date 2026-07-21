const express = require("express");
const router = express.Router();
const {
  bookAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  getUpcoming,
  getQueue,
  getTodayForDoctor,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/auth");

router.get("/list/upcoming", protect, getUpcoming);
router.get("/list/queue", protect, authorize("admin", "staff"), getQueue);
router.get("/list/today", protect, authorize("doctor"), getTodayForDoctor);

router
  .route("/")
  .post(protect, authorize("admin", "staff", "patient"), bookAppointment)
  .get(protect, getAppointments);

router
  .route("/:id")
  .get(protect, getAppointment)
  .put(protect, authorize("admin", "staff", "doctor"), updateAppointment);

router.put("/:id/cancel", protect, authorize("admin", "staff", "patient"), cancelAppointment);

module.exports = router;
