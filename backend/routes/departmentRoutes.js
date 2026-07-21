const express = require("express");
const router = express.Router();
const {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, getDepartments); // all roles can view (dropdowns etc.)
router.post("/", protect, authorize("admin"), createDepartment);
router.put("/:id", protect, authorize("admin"), updateDepartment);
router.delete("/:id", protect, authorize("admin"), deleteDepartment);

module.exports = router;
