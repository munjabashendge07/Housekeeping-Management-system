const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  addActivity,
  getAllActivities,
  updateActivity,
  deleteActivity,
  getActivityCount,
} = require("../controllers/activityController");

router.post("/add", protect, addActivity);
router.get("/", protect, getAllActivities);
router.put("/:id", protect, updateActivity);
router.delete("/:id", protect, deleteActivity);
router.get("/count", protect, getActivityCount);

module.exports = router;