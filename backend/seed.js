// backend/seed.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const MenuItem = require("./models/MenuItem");
const User = require("./models/User");
const connectDB = require("./config/db");

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
  // Bisa tambah lebih banyak item sesuai kebutuhan...
];

// Fungsi untuk seed data menu items
async function seedMenuItems() {
  await MenuItem.deleteMany();
  await MenuItem.insertMany(menuItems);
  console.log("MenuItems seeded!");
}

// Fungsi untuk membuat user admin jika belum ada
async function seedAdmin() {
  const adminEmail = "admin@example.com"; // Silakan ganti sesuai keinginan
  const adminUsername = "admin"; // Silakan ganti sesuai keinginan
  const adminPassword = "admin123"; // Silakan ganti sesuai keinginan

  // Cek apakah sudah ada user dengan role Admin
  const existingAdmin = await User.findOne({ role: "Admin" });
  if (existingAdmin) {
    console.log("Admin user already exists. Skipping creation...");
    return;
  }

  // Jika belum ada, buat user Admin baru
  const newAdmin = new User({
    username: adminUsername,
    email: adminEmail,
    password: adminPassword,
    role: "Admin",
  });
  await newAdmin.save();
  console.log(`Admin user created: ${adminEmail} / pass: ${adminPassword}`);
}

// Import data function
async function importData() {
  try {
    await connectDB();
    // Seed Menu Items
    await seedMenuItems();
    // Seed Admin
    await seedAdmin();

    console.log("All seeding done!");
    process.exit();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

importData();
