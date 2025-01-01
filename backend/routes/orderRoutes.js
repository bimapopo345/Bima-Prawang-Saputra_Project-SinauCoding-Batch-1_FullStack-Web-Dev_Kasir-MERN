// backend/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  archiveOrder,
  restoreArchivedOrder,
  getArchivedOrders,
  reorderOrder,
} = require("../controllers/orderController");

// Middleware otentikasi sudah diterapkan di server.js:
// app.use("/api/orders", protect, orderRoutes);

// Route CRUD untuk Orders
router.post("/", createOrder); // Create Order
router.get("/", getAllOrders); // Get All Orders
router.get("/archived", getArchivedOrders); // Get Archived Orders
router.get("/:id", getOrderById); // Get Single Order
router.put("/:id", updateOrder); // Update Order
router.delete("/:id", deleteOrder); // Delete Order

// Routes tambahan untuk arsip
router.post("/:id/archive", archiveOrder); // Archive Order
router.post("/:id/restore", restoreArchivedOrder); // Restore Archived Order

router.post("/:id/reorder", reorderOrder); // Reorder Order

module.exports = router;
