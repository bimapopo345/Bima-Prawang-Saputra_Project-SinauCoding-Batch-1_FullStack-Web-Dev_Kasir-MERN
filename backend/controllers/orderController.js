const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

// Create Order
const createOrder = async (req, res) => {
  const { customerName, tableNumber, orderType, items, receivedAmount } = req.body;
  try {
    if (orderType === "Dine In" && !tableNumber) {
      return res
        .status(400)
        .json({ message: "Table number is required for Dine In" });
    }

    // Calculate Subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res
          .status(404)
          .json({ message: `Menu item with ID ${item.menuItem} not found` });
      }
      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;
      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        note: item.note || "",
      });
    }

    // Calculate Tax and Total
    const tax = Math.round(subtotal * 0.1); // 10% Tax
    const total = subtotal + tax;

    if (receivedAmount < total) {
      return res
        .status(400)
        .json({ message: "Received amount is less than total" });
    }

    const change = receivedAmount - total;

    // Generate Order Number
    const orderNumber = "ORD#" + Date.now().toString().slice(-8);

    const newOrder = new Order({
      user: req.user._id,
      customerName,
      tableNumber: orderType === "Dine In" ? tableNumber : null,
      orderType,
      items: orderItems,
      subtotal,
      tax,
      total,
      receivedAmount,
      change,
      orderNumber,
    });

    await newOrder.save();

    // **Tambahkan Populasi di Sini**
    await newOrder.populate("items.menuItem");

    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get All Orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate(
      "items.menuItem"
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Single Order
const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id).populate("items.menuItem");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Order (e.g., Add/Edit Notes)
const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { items } = req.body;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Update items
    order.items = items;

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete Order
const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await order.remove();
    res.json({ message: "Order removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};