import React, { useState, useEffect } from "react";
import axios from "axios";

const Settings = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    role: "",
    status: "",
    language: "English",
    profileImage: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("username", user.username);
      formData.append("email", user.email);
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }
      await axios.put("/api/auth/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      // Refresh user data
      const res = await axios.get("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      alert("Profile updated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/auth/change-password",
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setPasswordData({ oldPassword: "", newPassword: "" });
      alert("Password changed successfully");
    } catch (error) {
      console.error(error);
      alert(
        error.response && error.response.data.message
          ? error.response.data.message
          : "Failed to change password"
      );
    }
  };

  const handlePasswordInputChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleDeletePicture = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "/api/auth/profile",
        { profileImage: null },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setUser({ ...user, profileImage: "/uploads/default-profile.png" });
      alert("Profile picture deleted");
    } catch (error) {
      console.error(error);
      alert("Failed to delete profile picture");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <form onSubmit={handleProfileSubmit}>
        {/* Account Section */}
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Account</h2>
          <div className="flex items-start gap-4 mb-6">
            <img
              src={
                `http://127.0.0.1:5000${user.profileImage}` ||
                "/uploads/default-profile.png"
              }
              alt="Profile"
              className="w-24 h-24 rounded-full"
            />
            <div className="space-y-2">
              <input
                type="file"
                onChange={handleImageChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              />
              <button
                type="button"
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
                onClick={handleDeletePicture}
              >
                Delete Picture
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={user.username}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                value={user.role}
                disabled
                className="w-full p-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <input
                type="text"
                value={user.status}
                disabled
                className="w-full p-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                name="language"
                value={user.language}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              >
                <option>English</option>
                <option>Indonesia</option>
              </select>
            </div>
          </div>
        </section>

        {/* Save Profile Changes */}
        <button
          type="submit"
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Save Profile Changes
        </button>
      </form>

      {/* Password Section */}
      <form onSubmit={handlePasswordChange} className="mt-12">
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Password</h2>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Old Password
            </label>
            <input
              type="password"
              name="oldPassword"
              value={passwordData.oldPassword}
              onChange={handlePasswordInputChange}
              className="w-full p-2 border rounded-lg mb-2"
              required
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordInputChange}
              className="w-full p-2 border rounded-lg mb-2"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Change Password
            </button>
          </div>
        </section>
      </form>

      {/* Appearance Section */}
      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4">Appearance</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preference Mode
            </label>
            <select className="w-full p-2 border rounded-lg">
              <option>Light Mode</option>
              <option>Dark Mode</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size
            </label>
            <select className="w-full p-2 border rounded-lg">
              <option>16 px</option>
              <option>18 px</option>
              <option>20 px</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zoom Display
            </label>
            <select className="w-full p-2 border rounded-lg">
              <option>100 (Normal)</option>
              <option>125</option>
              <option>150</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
