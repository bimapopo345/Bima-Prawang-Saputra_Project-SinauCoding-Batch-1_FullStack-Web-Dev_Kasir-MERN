// backend/models/Order.js
const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  quantity: { type: Number, required: true, default: 1 },
  note: { type: String, default: "" },
});

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    tableNumber: { type: Number }, // Nullable untuk Take Away
    orderType: { type: String, enum: ["Dine In", "Take Away"], required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    receivedAmount: { type: Number, required: true },
    change: { type: Number, required: true },
    orderNumber: { type: String, required: true, unique: true },
    orderDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
