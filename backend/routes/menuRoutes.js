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

// Route upload (POST /api/menu/upload)
router.post("/upload", uploadMenuImage);

// CRUD
router.get("/", getAllMenuItems);
router.post("/", createMenuItem);
router.put("/:id", updateMenuItem);
router.delete("/:id", deleteMenuItem);

module.exports = router;
