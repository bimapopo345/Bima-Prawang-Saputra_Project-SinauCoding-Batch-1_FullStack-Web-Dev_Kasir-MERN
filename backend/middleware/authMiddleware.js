// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Ambil token dari header Authorization
      token = req.headers.authorization.split(" ")[1];
      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Cari user di DB (minus password)
      req.user = await User.findById(decoded.userId).select("-password");

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Middleware khusus Admin
const adminOnly = (req, res, next) => {
  // Pastikan user sudah di-set oleh protect
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Not authorized, user data not found" });
  }
  // Cek role
  if (req.user.role === "Admin") {
    return next();
  } else {
    return res.status(403).json({ message: "Forbidden. Admin only." });
  }
};

module.exports = { protect, adminOnly };
