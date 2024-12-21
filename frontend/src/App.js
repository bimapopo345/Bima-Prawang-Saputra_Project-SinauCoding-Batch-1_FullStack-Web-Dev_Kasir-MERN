// frontend/src/App.js
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

// Interceptor untuk menambahkan token ke setiap request
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
    // Redirect ke /login (pakai reload agar bersih)
    window.location.href = "/login";
  };

  const handleOrderArchive = () => {
    // Contoh data statis
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

/**
 * Pisahkan isi utama ke komponen supaya kita bisa
 * memakai useLocation di level "dalam" tanpa merusak struktur.
 */
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
  // Cek path
  const location = useLocation();
  // Halaman2 auth di mana header & sidebar tidak ditampilkan:
  const authPaths = [
    "/login",
    "/register",
    "/reset-password",
    "/reset-password/confirm",
  ];
  // Boolean => true jika di route auth
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <div className="flex">
      {/* Jika BUKAN halaman auth, tampilkan Sidebar */}
      {!isAuthPage && <Sidebar /* boleh pakai isSidebarOpen dsb. */ />}

      {/* Bagian kanan: Header + main */}
      <div className="flex-1 flex flex-col">
        {/* Jika BUKAN halaman auth, tampilkan Header */}
        {!isAuthPage && (
          <Header
            onSidebarToggle={handleSidebarToggle}
            onLogout={handleLogout}
            onOrderArchive={handleOrderArchive}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4">
          {/* Toast */}
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

          {/* Routes */}
          <Routes>
            {/* Dashboard */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard setToast={setToast} />
                </PrivateRoute>
              }
            />

            {/* Kasir */}
            <Route
              path="/kasir"
              element={
                <PrivateRoute>
                  <Kasir setToast={setToast} />
                </PrivateRoute>
              }
            />

            {/* Sales Report */}
            <Route
              path="/sales-report"
              element={
                <PrivateRoute>
                  <SalesReport setToast={setToast} />
                </PrivateRoute>
              }
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings setToast={setToast} />
                </PrivateRoute>
              }
            />

            {/* Catalog */}
            <Route
              path="/catalog"
              element={
                <PrivateRoute>
                  <Catalog setToast={setToast} />
                </PrivateRoute>
              }
            />

            {/* Auth pages */}
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

            {/* Redirect semua route yang tidak dikenali ke Dashboard atau Login */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      {/* Order Archive Modal */}
      <OrderArchiveModal
        isOpen={isOrderArchiveOpen}
        onClose={() => setIsOrderArchiveOpen(false)}
        orders={archivedOrders}
      />
    </div>
  );
};

// Private Route
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

export default App;
