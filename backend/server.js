// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const menuRoutes = require("./routes/menuRoutes");
const { protect } = require("./middleware/authMiddleware");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Agar folder /uploads bisa diakses
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Koneksi ke MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", protect, orderRoutes);
app.use("/api/menu", protect, menuRoutes);

// Root Endpoint
app.get("/", (req, res) => {
  res.send("API PadiPos");
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
