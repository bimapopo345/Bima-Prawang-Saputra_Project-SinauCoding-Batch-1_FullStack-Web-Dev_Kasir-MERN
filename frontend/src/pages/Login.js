// frontend/src/pages/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Toast from "../components/Toast";

const Login = ({ setToast }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toastState, setToastState] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setToast({
        type: "destructive",
        message: "Please enter both username and password",
      });
      return;
    }

    try {
      const res = await axios.post("/api/auth/login", {
        email: username,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setToast({ type: "success", message: "Login berhasil" });
      navigate("/");
    } catch (error) {
      setToast({
        type: "destructive",
        message: error.response?.data?.message || "Login gagal",
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

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Logo and Title */}
        <div className="flex items-center mb-8 justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">P</span>
          </div>
          <h2 className="ml-4 text-2xl font-bold text-gray-900">PadiPos</h2>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome Back!
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          Please enter your username and password here!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 block"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your password"
            />
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              to="/reset-password"
              className="text-blue-600 hover:underline text-sm"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            Login
          </button>

          <div className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
