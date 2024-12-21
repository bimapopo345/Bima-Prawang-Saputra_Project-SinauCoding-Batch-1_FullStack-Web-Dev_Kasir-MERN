// backend/controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
require("dotenv").config(); // Pastikan dotenv dikonfigurasi

// Konfigurasi Multer Storage untuk upload profile (sudah ada)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
}).single("profileImage");

// Fungsi untuk generate JWT
const generateToken = (userId, expiresIn = "1h") => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
};

// Konfigurasi Nodemailer dengan Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // "smtp.gmail.com"
  port: process.env.EMAIL_PORT, // 587 untuk TLS
  secure: false, // true untuk port 465 (SSL)
  auth: {
    user: process.env.EMAIL_USER, // Email Gmail Anda
    pass: process.env.EMAIL_PASS, // App Password Gmail Anda
  },
});

// Fungsi untuk mengirim email reset password
const sendResetEmail = async (toEmail, resetLink) => {
  const mailOptions = {
    from: `"PadiPos" <${process.env.EMAIL_USER}>`, // Sender address
    to: toEmail, // Recipient
    subject: "Reset Password Instructions", // Subject line
    html: `
      <p>Halo,</p>
      <p>Kamu telah meminta untuk mereset password. Klik link berikut untuk mereset passwordmu:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>Jika kamu tidak meminta ini, silakan abaikan email ini.</p>
      <p>Salam,<br>PadiPos Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Register User
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User sudah ada" });
    }

    user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = generateToken(user._id);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Reset Password Request (Mengirim Email)
const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User tidak ditemukan" });
    }

    // Buat token reset password (JWT dengan masa berlaku 15 menit)
    const resetToken = generateToken(user._id, "15m");

    // Buat link reset password yang akan dikirim melalui email
    const resetLink = `http://localhost:3000/reset-password/confirm?token=${resetToken}`;

    // Kirim email menggunakan Nodemailer
    await sendResetEmail(email, resetLink);

    res.json({
      message: "Password reset instructions have been sent to your email",
    });
  } catch (error) {
    console.error("resetPasswordRequest error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Reset Password (Setelah Konfirmasi Email)
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifikasi token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({ message: "User tidak ditemukan" });
    }

    // Ubah password user
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: err });
    }
    const { username, email } = req.body;
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        user.username = username || user.username;
        user.email = email || user.email;
        if (req.file) {
          user.profileImage = `/uploads/${req.file.filename}`;
        }
        if (req.body.profileImage === null) {
          user.profileImage = "/uploads/default-profile.png";
        }
        await user.save();
        res.json({
          message: "Profile updated successfully",
          user: {
            username: user.username,
            email: user.email,
            profileImage: user.profileImage,
          },
        });
      } else {
        res.status(404).json({ message: "User tidak ditemukan" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  });
};

// Change Password
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Password lama salah" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password berhasil diubah" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (user) {
      res.json({ user });
    } else {
      res.status(404).json({ message: "User tidak ditemukan" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  resetPasswordRequest,
  resetPassword,
  updateProfile,
  changePassword,
  getProfile,
};
