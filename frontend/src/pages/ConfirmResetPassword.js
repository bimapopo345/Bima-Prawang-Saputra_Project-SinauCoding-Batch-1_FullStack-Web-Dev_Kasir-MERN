// frontend/src/pages/ConfirmResetPassword.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";

const ConfirmResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Mengambil token dari query param
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!token) {
      setToast({
        type: "error",
        message: "Token tidak valid atau telah kadaluarsa.",
      });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setToast({ type: "error", message: "Silakan isi semua field." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({ type: "error", message: "Password tidak cocok." });
      return;
    }

    try {
      const res = await axios.post("/api/auth/reset-password/confirm", {
        token,
        newPassword,
      });
      setToast({ type: "success", message: res.data.message });
      setNewPassword("");
      setConfirmPassword("");

      // Redirect ke halaman login setelah berhasil
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Gagal mereset password.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white px-4 py-2 rounded`}
        >
          {toast.message}
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-center items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-xl font-bold">P</span>
          </div>
          <h2 className="ml-4 text-2xl font-bold text-gray-900">PadiPos</h2>
        </div>

        <h3 className="text-3xl font-semibold text-gray-900 mb-2 text-center">
          Konfirmasi Reset Password
        </h3>
        <p className="text-gray-500 text-sm mb-6 text-center">
          Silakan masukkan password baru Anda
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="text-sm font-medium text-gray-700 block"
            >
              Password Baru
            </label>
            <input
              id="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Masukkan password baru"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700 block"
            >
              Konfirmasi Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Konfirmasi password baru"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConfirmResetPassword;
