// backend/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

// Middleware otentikasi sudah diterapkan di server.js:
// app.use("/api/orders", protect, orderRoutes);

// Route CRUD untuk Orders
router.post("/", createOrder); // Create Order
router.get("/", getAllOrders); // Get All Orders
router.get("/:id", getOrderById); // Get Single Order
router.put("/:id", updateOrder); // Update Order
router.delete("/:id", deleteOrder); // Delete Order

module.exports = router;
