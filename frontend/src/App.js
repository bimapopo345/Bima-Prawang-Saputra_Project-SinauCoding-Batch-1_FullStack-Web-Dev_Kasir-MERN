import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Toast from "./components/Toast";
import Dashboard from "./pages/Dashboard";
import Kasir from "./pages/Kasir";
import SalesReport from "./pages/SalesReport";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ConfirmResetPassword from "./pages/ConfirmResetPassword";
import OrderArchiveModal from "./components/OrderArchiveModal";
import Catalog from "./pages/Catalog"; // Pastikan file ini ada

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function App() {
  const [toast, setToast] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOrderArchiveOpen, setIsOrderArchiveOpen] = useState(false);
  const [archivedOrders, setArchivedOrders] = useState([]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToast({ type: "info", message: "Logged out successfully" });
    window.location.href = "/login";
  };

  const handleOrderArchive = () => {
    setArchivedOrders([
      {
        _id: "ORD#12345678",
        orderNumber: "ORD#12345678",
        orderType: "Dine In",
        user: { username: "Anisa" },
        tableNumber: 1,
        total: 65000,
        orderDate: "2024-09-30T12:30:00Z",
      },
      {
        _id: "ORD#87654321",
        orderNumber: "ORD#87654321",
        orderType: "Take Away",
        user: { username: "Budi" },
        tableNumber: null,
        total: 45000,
        orderDate: "2024-10-01T14:15:00Z",
      },
    ]);
    setIsOrderArchiveOpen(true);
  };

  return (
    <Router>
      <AppContent
        toast={toast}
        setToast={setToast}
        isSidebarOpen={isSidebarOpen}
        handleSidebarToggle={handleSidebarToggle}
        handleLogout={handleLogout}
        isOrderArchiveOpen={isOrderArchiveOpen}
        setIsOrderArchiveOpen={setIsOrderArchiveOpen}
        archivedOrders={archivedOrders}
        handleOrderArchive={handleOrderArchive}
      />
    </Router>
  );
}

const AppContent = ({
  toast,
  setToast,
  isSidebarOpen,
  handleSidebarToggle,
  handleLogout,
  isOrderArchiveOpen,
  setIsOrderArchiveOpen,
  archivedOrders,
  handleOrderArchive,
}) => {
  const location = useLocation();
  const authPaths = [
    "/login",
    "/register",
    "/reset-password",
    "/reset-password/confirm",
  ];
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <div className="flex">
      {!isAuthPage && <Sidebar />}

      <div className="flex-1 flex flex-col">
        {!isAuthPage && (
          <Header
            onSidebarToggle={handleSidebarToggle}
            onLogout={handleLogout}
            onOrderArchive={handleOrderArchive}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4">
          {toast && (
            <div
              className={`fixed top-5 right-5 z-50 ${
                toast.type === "success"
                  ? "bg-green-500"
                  : toast.type === "error"
                  ? "bg-red-500"
                  : "bg-blue-500"
              } text-white px-4 py-2 rounded`}
            >
              {toast.message}
            </div>
          )}

          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard setToast={setToast} />
                </PrivateRoute>
              }
            />

            <Route
              path="/kasir"
              element={
                <PrivateRoute>
                  <Kasir setToast={setToast} />
                </PrivateRoute>
              }
            />

            <Route
              path="/sales-report"
              element={
                <PrivateRoute>
                  <SalesReport setToast={setToast} />
                </PrivateRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings setToast={setToast} />
                </PrivateRoute>
              }
            />

            <Route
              path="/catalog"
              element={
                <PrivateRoute>
                  <Catalog setToast={setToast} />
                </PrivateRoute>
              }
            />

            <Route path="/login" element={<Login setToast={setToast} />} />
            <Route
              path="/register"
              element={<Register setToast={setToast} />}
            />
            <Route
              path="/reset-password"
              element={<ResetPassword setToast={setToast} />}
            />
            <Route
              path="/reset-password/confirm"
              element={<ConfirmResetPassword setToast={setToast} />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      <OrderArchiveModal
        isOpen={isOrderArchiveOpen}
        onClose={() => setIsOrderArchiveOpen(false)}
        onRestore={() => {}}
      />
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

export default App;
