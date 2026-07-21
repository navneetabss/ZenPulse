const express = require("express");
const router = express.Router();
const {
  createMedicine,
  getMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
} = require("../controllers/medicineController");
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .post(protect, authorize("admin"), createMedicine)
  .get(protect, authorize("admin", "doctor", "nurse", "staff"), getMedicines);

router
  .route("/:id")
  .get(protect, authorize("admin", "doctor", "nurse", "staff"), getMedicine)
  .put(protect, authorize("admin"), updateMedicine)
  .delete(protect, authorize("admin"), deleteMedicine);

module.exports = router;
