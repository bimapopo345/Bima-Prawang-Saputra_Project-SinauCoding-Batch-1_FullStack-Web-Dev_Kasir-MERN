// frontend/src/pages/ResetPassword.js
import React, { useState } from "react";
import axios from "axios";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setToast({
        type: "error",
        message: "Silakan masukkan alamat email Anda",
      });
      return;
    }

    try {
      const res = await axios.post("/api/auth/reset-password", { email });
      setToast({ type: "success", message: res.data.message });
      setEmail("");
    } catch (error) {
      setToast({
        type: "error",
        message:
          error.response?.data?.message || "Gagal mengirim instruksi reset",
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
          Reset Password
        </h3>
        <p className="text-gray-500 text-sm mb-6 text-center">
          Silakan masukkan email terdaftar Anda
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 block"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Masukkan email Anda"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
