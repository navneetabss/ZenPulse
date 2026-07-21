const express = require("express");
const router = express.Router();
const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  listDoctors,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

router.get("/doctors/list", protect, listDoctors);

router.use(protect, authorize("admin"));
router.route("/").post(createUser).get(getUsers);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
