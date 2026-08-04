const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
  createUserByAdmin,
  updateUser,
  deleteUser,
  getUserCount,
} = require("../controllers/userController");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", protect, getProfile);
router.get("/count", protect, getUserCount);

// Admin only routes
router.get("/", protect, authorize("admin"), getAllUsers);
router.post("/create", protect, authorize("admin"), createUserByAdmin);
router.put("/:id", protect, authorize("admin"), updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;