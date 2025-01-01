// backend/routes/menuRoutes.js
const express = require("express");
const router = express.Router();
const {
  uploadMenuImage,
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Route upload (POST /api/menu/upload)
router.post("/upload", protect, adminOnly, uploadMenuImage);

// CRUD Menu
router.get("/", protect, getAllMenuItems);
router.post("/", protect, adminOnly, createMenuItem);
router.put("/:id", protect, adminOnly, updateMenuItem);
router.delete("/:id", protect, adminOnly, deleteMenuItem);

module.exports = router;
