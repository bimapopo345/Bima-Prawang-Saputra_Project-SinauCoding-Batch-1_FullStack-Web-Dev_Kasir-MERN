// src/layouts/AuthLayout.js
import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div>
      {/* Hanya <Outlet />, tanpa Header/Sidebar */}
      <Outlet />
    </div>
  );
};

export default AuthLayout;
