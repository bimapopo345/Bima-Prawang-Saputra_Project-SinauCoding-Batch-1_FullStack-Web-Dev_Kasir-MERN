// backend/controllers/menuController.js
const MenuItem = require("../models/MenuItem");
const multer = require("multer");
const path = require("path");

/* -----------------------------------------
   A) Multer config untuk upload file
------------------------------------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, "menu-" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* -----------------------------------------
   B) Endpoint upload (/api/menu/upload)
------------------------------------------ */
const uploadMenuImage = (req, res) => {
  upload.single("imageFile")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imagePath = "/uploads/" + req.file.filename;
    return res.json({ imagePath });
  });
};

/* -----------------------------------------
   C) Fungsi CRUD Menu
------------------------------------------ */
// 1. Get All Menu Items
const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({});
    res.json(menuItems);
  } catch (error) {
    console.error("Error getAllMenuItems:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. Create Menu Item
const createMenuItem = async (req, res) => {
  const { name, description, price, image, category } = req.body;
  try {
    const newItem = new MenuItem({ name, description, price, image, category });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error createMenuItem:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. Update Menu Item
const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, category } = req.body;
  try {
    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    item.name = name || item.name;
    item.description = description || item.description;
    item.price = price || item.price;
    item.image = image || item.image;
    item.category = category || item.category;

    await item.save();
    res.json(item);
  } catch (error) {
    console.error("Error updateMenuItem:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 4. Delete Menu Item
// backend/controllers/menuController.js (bagian deleteMenuItem)
const deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    console.log("Deleting ID:", id);
    const item = await MenuItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Ganti item.remove() => item.deleteOne()
    await item.deleteOne();

    res.json({ message: "Menu item removed" });
  } catch (error) {
    console.error("Error deleteMenuItem:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Exports
module.exports = {
  uploadMenuImage,
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
