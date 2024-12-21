// frontend/src/pages/Register.js
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

const Register = ({ setToast }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toastState, setToastState] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setToast({ type: "destructive", message: "Harap isi semua field" });
      return;
    }

    if (password !== confirmPassword) {
      setToast({ type: "destructive", message: "Password tidak cocok" });
      return;
    }

    try {
      const res = await axios.post("/api/auth/register", {
        username,
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setToast({ type: "success", message: "Akun berhasil dibuat" });
      navigate("/");
    } catch (error) {
      setToast({
        type: "destructive",
        message: error.response?.data?.message || "Pendaftaran gagal",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Toast */}
      {toastState && (
        <div className="fixed top-5 right-5 z-50">
          <Toast
            title={toastState.type === "success" ? "Success" : "Error"}
            message={toastState.message}
            type={toastState.type}
            onClose={() => setToastState(null)}
          />
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        {/* Logo and Title */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-bold">P</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">PadiPos</span>
        </div>

        <h2 className="text-2xl text-center font-bold text-gray-900 mb-2">
          Welcome Back!
        </h2>
        <p className="text-gray-500 text-sm mb-8 text-center">
          Create your account here!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-gray-700 block"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Username"
              />
            </div>

            {/* Email Field */}
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
                placeholder="Email"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 block"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => {
                    const type =
                      document.getElementById("password").type === "password"
                        ? "text"
                        : "password";
                    document.getElementById("password").type = type;
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {/* Eye Icon */}
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.267-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700 block"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => {
                    const type =
                      document.getElementById("confirmPassword").type ===
                      "password"
                        ? "text"
                        : "password";
                    document.getElementById("confirmPassword").type = type;
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {/* Eye Icon */}
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.267-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Reset Password Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium rounded-xl transition duration-200"
          >
            Create Account
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
