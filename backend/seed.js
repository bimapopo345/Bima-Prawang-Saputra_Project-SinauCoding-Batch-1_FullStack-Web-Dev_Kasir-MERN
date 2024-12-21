// backend/seed.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const MenuItem = require("./models/MenuItem"); // Pastikan path ini benar
const connectDB = require("./config/db"); // Pastikan path ini benar

dotenv.config();

const menuItems = [
  {
    name: "Nasi Goreng Spesial",
    description: "Nasi goreng dengan ayam, telur, dan sayuran segar",
    price: 25000,
    image: "https://via.placeholder.com/300x200.png?text=Nasi+Goreng+Spesial",
    category: "Food",
  },
  {
    name: "Es Teh Manis",
    description: "Es teh manis segar",
    price: 8000,
    image: "https://via.placeholder.com/300x200.png?text=Es+Teh+Manis",
    category: "Beverages",
  },
  {
    name: "Kue Lapis",
    description: "Kue lapis tradisional",
    price: 15000,
    image: "https://via.placeholder.com/300x200.png?text=Kue+Lapis",
    category: "Dessert",
  },
  // Tambahkan lebih banyak item sesuai kebutuhan
];

const importData = async () => {
  try {
    await connectDB();
    await MenuItem.deleteMany(); // Hapus semua data menu yang ada
    await MenuItem.insertMany(menuItems); // Masukkan data baru
    console.log("Data berhasil diimpor!");
    process.exit();
  } catch (error) {
    console.error("Gagal mengimpor data:", error);
    process.exit(1);
  }
};

importData();
