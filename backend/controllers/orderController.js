const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

const createOrder = async (req, res) => {
  try {
    const {
      orderNumber,
      orderDate,
      customerName,
      orderType,
      tableNumber,
      items,
      subtotal,
      tax,
      total,
      receivedAmount,
      change,
      isArchived,
      isPaid,
    } = req.body;

    if (
      !orderNumber ||
      !customerName ||
      !orderType ||
      !items ||
      !subtotal ||
      !tax ||
      !total
    ) {
      return res.status(400).json({ message: "Semua bidang wajib diisi." });
    }

    for (const item of items) {
      if (!item.menuItem || !item.quantity || !item.price) {
        return res
          .status(400)
          .json({
            message:
              "Setiap item harus memiliki menuItem, quantity, dan price.",
          });
      }
      const menuItemExists = await MenuItem.findById(item.menuItem);
      if (!menuItemExists) {
        return res.status(400).json({
          message: `MenuItem dengan ID ${item.menuItem} tidak ditemukan.`,
        });
      }
    }

    const order = new Order({
      user: req.user._id,
      orderNumber,
      orderDate,
      customerName,
      orderType,
      tableNumber,
      items,
      subtotal,
      tax,
      total,
      receivedAmount,
      change,
      isArchived: isArchived || false,
      isPaid: isPaid || false,
    });

    await order.save();

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

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

    order.items = items;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

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

const archiveOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    order.isArchived = true;
    order.isPaid = false;
    await order.save();

    res.json({ message: "Order archived successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const restoreArchivedOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    order.isArchived = false;
    order.isPaid = false;
    await order.save();

    res.json({ message: "Order restored successfully" });
  } catch (error) {
    console.error("Error restoring order:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getArchivedOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      isArchived: true,
    }).populate("items.menuItem");
    res.json(orders);
  } catch (error) {
    console.error("Error fetching archived orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const reorderOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const archivedOrder = await Order.findById(id).populate("items.menuItem");
    if (!archivedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (archivedOrder.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!archivedOrder.isArchived) {
      return res.status(400).json({ message: "Order is not archived." });
    }

    const newOrderNumber = "ORD#" + Date.now().toString().slice(-8);
    const newOrderDate = new Date().toISOString();

    const newItems = archivedOrder.items.map((item) => ({
      menuItem: item.menuItem._id,
      quantity: item.quantity,
      note: item.note || "",
      price: item.price,
    }));

    const subtotal = newItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;

    const newOrder = new Order({
      user: req.user._id,
      orderNumber: newOrderNumber,
      orderDate: newOrderDate,
      customerName: archivedOrder.customerName,
      orderType: archivedOrder.orderType,
      tableNumber: archivedOrder.tableNumber,
      items: newItems,
      subtotal,
      tax,
      total,
      receivedAmount: 0,
      change: 0,
      isArchived: false,
      isPaid: false,
    });

    await newOrder.save();

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error reordering:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  archiveOrder,
  restoreArchivedOrder,
  getArchivedOrders,
  reorderOrder,
};
