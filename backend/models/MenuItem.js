// backend/models/MenuItem.js
const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true }, // e.g., Food, Beverages, Dessert
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", MenuItemSchema);
