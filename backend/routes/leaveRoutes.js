const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");

const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  deleteLeave,
  getLeaveCount,
} = require("../controllers/leaveController");

router.post("/add", protect, applyLeave);
router.post("/apply", protect, applyLeave);
router.get("/my-leaves", protect, getMyLeaves);
router.get("/", protect, getAllLeaves);
router.put("/:id", protect, authorize("admin"), updateLeaveStatus);
router.delete("/:id", protect, deleteLeave);
router.get("/count", protect, getLeaveCount);

module.exports = router;