// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  resetPasswordRequest,
  resetPassword,
  updateProfile,
  changePassword,
  getProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Reset Password Request (Mengirim Email)
router.post("/reset-password", resetPasswordRequest);

// Reset Password (Setelah Konfirmasi Email)
router.post("/reset-password/confirm", resetPassword);

// Update Profile
router.put("/profile", protect, updateProfile);

// Get Profile
router.get("/profile", protect, getProfile);

// Change Password
router.post("/change-password", protect, changePassword);

module.exports = router;
