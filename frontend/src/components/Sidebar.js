// frontend/src/components/Sidebar.js
import React from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdPointOfSale,
  MdAssessment,
  MdSettings,
} from "react-icons/md";
// Tambah icon Catalog (misal MdRestaurantMenu)
import { MdRestaurantMenu } from "react-icons/md";

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", path: "/", icon: <MdDashboard size={24} /> },
    { name: "Kasir", path: "/kasir", icon: <MdPointOfSale size={24} /> },
    {
      name: "Sales Report",
      path: "/sales-report",
      icon: <MdAssessment size={24} />,
    },
    // Tambah Catalog
    {
      name: "Catalog",
      path: "/catalog",
      icon: <MdRestaurantMenu size={24} />,
    },
    { name: "Settings", path: "/settings", icon: <MdSettings size={24} /> },
  ];

  return (
    <div className="h-screen w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        PadiPos
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end
            className={({ isActive }) =>
              `flex items-center p-2 rounded-lg hover:bg-gray-700 ${
                isActive ? "bg-gray-700" : ""
              }`
            }
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
