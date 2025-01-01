// frontend/src/components/Header.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const Header = ({ onSidebarToggle, onLogout, onOrderArchive }) => {
  const [profileImage, setProfileImage] = useState(
    "/uploads/default-profile.png"
  );
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data.user;
        // user: { _id, username, email, role, profileImage, ...}

        setProfileImage(
          `http://127.0.0.1:5000${user.profileImage}` ||
            "/uploads/default-profile.png"
        );
        setUsername(user.username || "Unknown User");
        setRole(user.role || "Cashier");
        // Atur default role “Cashier” bila role kosong.
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between">
      {/* Kiri: Sidebar toggle (mobile) + Search bar */}
      <div className="flex items-center gap-4">
        {/* Sidebar Trigger (Mobile) */}
        <button
          onClick={onSidebarToggle}
          className="md:hidden text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Search Bar */}
        <div className="relative w-[400px]">
          <input
            type="text"
            placeholder="Enter the keyword here..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Ikon magnifying glass */}
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35m0 0a7 7 0 111.41-1.41l4.35 4.35z"
            />
          </svg>
        </div>
      </div>

      {/* Kanan: Order Archive, Profile, Logout */}
      <div className="flex items-center gap-4">
        {/* Order Archive */}
        <button
          onClick={onOrderArchive}
          className="hidden md:flex items-center text-gray-600 hover:text-blue-600 focus:outline-none"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 5v14l7-5 7 5V5z"
            />
          </svg>
          <span>Order Archive</span>
        </button>

        {/* Profile (foto + username + role) */}
        <div className="flex items-center gap-2">
          <img
            src={profileImage}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex flex-col text-right">
            <span className="font-medium">{username}</span>
            <span className="text-xs text-gray-400">{role}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
          title="Logout"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4M21 12H7m6 4v1
                 a3 3 0 01-3 3H6a3 3 0 01-3-3V7
                 a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
