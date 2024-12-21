// src/pages/Dashboard.js
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Calendar, X } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Modal ringkasan kategori
 */
const CategorySummaryModal = ({ categoryName, itemsData, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = itemsData.filter((it) =>
    it.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative w-[400px] bg-white rounded-md shadow-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">{categoryName}</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter the keyword here..."
            className="border px-3 py-2 rounded-md w-full text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="text-left p-3">Menu Name</th>
                <th className="text-left p-3">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3">{row.name}</td>
                    <td className="p-3">{row.total}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="p-3 text-center text-gray-500">
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  // States filter
  const [startDate, setStartDate] = useState(null);
  const [finishDate, setFinishDate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Data orders (full)
  const [orders, setOrders] = useState([]);

  // Data filtered (local)
  const [filteredOrders, setFilteredOrders] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalOmzet: 0,
    allMenuOrders: 0,
    foods: 0,
    beverages: 0,
    desserts: 0,
  });

  // Chart
  const [chartData, setChartData] = useState(null);

  // Modal category
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [categoryItems, setCategoryItems] = useState([]);

  // Calendar refs
  const startCalendarRef = useRef(null);
  const endCalendarRef = useRef(null);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  // UseEffect => fetch once
  useEffect(() => {
    fetchAllOrders();
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line
  }, []);

  // UseEffect => apply filter every time startDate/finishDate/selectedCategory changes
  useEffect(() => {
    const filtered = applyLocalFilter(
      orders,
      startDate,
      finishDate,
      selectedCategory
    );
    setFilteredOrders(filtered);

    // Hitung stats & chart pakai data filtered
    const newStats = calculateStats(filtered);
    setStats(newStats);

    const newChartData = buildChartData(filtered);
    setChartData(newChartData);
  }, [orders, startDate, finishDate, selectedCategory]);

  const handleClickOutside = (e) => {
    if (
      startCalendarRef.current &&
      !startCalendarRef.current.contains(e.target)
    ) {
      setShowStartCalendar(false);
    }
    if (endCalendarRef.current && !endCalendarRef.current.contains(e.target)) {
      setShowEndCalendar(false);
    }
  };

  // Fungsi untuk mengambil semua data pesanan
  const fetchAllOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Token tidak ditemukan. Silakan login kembali.");
        window.location.href = "/login";
        return;
      }

      const res = await axios.get("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response && error.response.status === 401) {
        alert("Token tidak valid atau telah kadaluarsa. Silakan login kembali.");
        window.location.href = "/login";
      } else {
        alert(
          error.response?.data?.message ||
            "Terjadi kesalahan saat mengambil data pesanan."
        );
      }
    }
  };

  // Fungsi untuk memfilter data pesanan berdasarkan filter yang dipilih
  const applyLocalFilter = (ordersArr, stDate, finDate, cat) => {
    return ordersArr.filter((ord) => {
      // Tanggal
      const orderDay = new Date(ord.orderDate).setHours(0, 0, 0, 0);

      if (stDate) {
        const st = new Date(stDate).setHours(0, 0, 0, 0);
        if (orderDay < st) return false;
      }
      if (finDate) {
        const fn = new Date(finDate).setHours(23, 59, 59, 999);
        if (orderDay > fn) return false;
      }

      // Category => cek di items
      if (cat && cat !== "") {
        const matchItem = ord.items.some((it) =>
          (it.menuItem.category || "").toLowerCase().includes(cat.toLowerCase())
        );
        if (!matchItem) return false;
      }

      return true;
    });
  };

  // Fungsi untuk menghitung statistik
  const calculateStats = (filteredArr) => {
    const totalOrders = filteredArr.length;
    const totalOmzet = filteredArr.reduce((sum, o) => sum + o.total, 0);
    let allMenuOrders = 0,
      foods = 0,
      beverages = 0,
      desserts = 0;

    filteredArr.forEach((o) => {
      o.items.forEach((it) => {
        allMenuOrders += it.quantity;
        const cat = (it.menuItem.category || "").toLowerCase();
        if (cat.includes("food")) foods += it.quantity;
        else if (cat.includes("beverage")) beverages += it.quantity;
        else if (cat.includes("dessert")) desserts += it.quantity;
      });
    });

    return {
      totalOrders,
      totalOmzet,
      allMenuOrders,
      foods,
      beverages,
      desserts,
    };
  };

  // Fungsi untuk membangun data chart
  const buildChartData = (filteredArr) => {
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyMap = {};
    dayLabels.forEach((d) => {
      dailyMap[d] = { food: 0, beverage: 0, dessert: 0 };
    });
    const dayOfWeekMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    filteredArr.forEach((ord) => {
      const d = new Date(ord.orderDate);
      const dow = d.getDay(); // 0 = Sunday
      const label = dayOfWeekMap[dow];

      ord.items.forEach((it) => {
        const cat = (it.menuItem.category || "").toLowerCase();
        const revenue = it.menuItem.price * it.quantity;
        if (dailyMap[label]) {
          if (cat.includes("food")) {
            dailyMap[label].food += revenue;
          } else if (cat.includes("beverage")) {
            dailyMap[label].beverage += revenue;
          } else if (cat.includes("dessert")) {
            dailyMap[label].dessert += revenue;
          }
        }
      });
    });

    // Compose data array
    const foodData = dayLabels.map((d) => dailyMap[d].food);
    const beverageData = dayLabels.map((d) => dailyMap[d].beverage);
    const dessertData = dayLabels.map((d) => dailyMap[d].dessert);

    return {
      labels: dayLabels,
      datasets: [
        { label: "Food", data: foodData, backgroundColor: "#3B82F6" },
        { label: "Beverage", data: beverageData, backgroundColor: "#1E40AF" },
        { label: "Dessert", data: dessertData, backgroundColor: "#93C5FD" },
      ],
    };
  };

  // Fungsi untuk membuka modal ringkasan kategori
  const handleOpenCategorySummary = (catType) => {
    const cat = catType.toLowerCase();
    const summaryMap = new Map();

    // Gunakan filteredOrders agar sesuai filter
    filteredOrders.forEach((ord) => {
      ord.items.forEach((it) => {
        const c = (it.menuItem.category || "").toLowerCase();
        if (
          (cat.includes("food") && c.includes("food")) ||
          (cat.includes("beverage") && c.includes("beverage")) ||
          (cat.includes("dessert") && c.includes("dessert"))
        ) {
          summaryMap.set(
            it.menuItem.name,
            (summaryMap.get(it.menuItem.name) || 0) + it.quantity
          );
        }
      });
    });

    const arr = [];
    for (let [menuName, total] of summaryMap.entries()) {
      arr.push({ name: menuName, total });
    }
    arr.sort((a, b) => b.total - a.total);

    setCategoryTitle(catType);
    setCategoryItems(arr);
    setShowCategoryModal(true);
  };
  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setCategoryTitle("");
    setCategoryItems([]);
  };

  // Handler date pick
  const handleStartDateClick = () => {
    setShowStartCalendar(!showStartCalendar);
  };
  const handleEndDateClick = () => {
    setShowEndCalendar(!showEndCalendar);
  };
  const handleDateSelect = (date, type) => {
    if (type === "start") {
      setStartDate(date);
      setShowStartCalendar(false);
    } else {
      setFinishDate(date);
      setShowEndCalendar(false);
    }
  };
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: false },
    },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Tanggal di pojok kanan */}
      <div className="flex justify-end mb-2 text-sm text-gray-500">
        Today, Kamis 19 Desember 2024
      </div>

      <h1 className="text-xl font-bold mb-4">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {/* Total Orders */}
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-gray-500">Total Orders</div>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
        </div>
        {/* Total Omzet */}
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-gray-500">Total Omzet</div>
          <div className="text-2xl font-bold">
            Rp {stats.totalOmzet.toLocaleString()}
          </div>
        </div>
        {/* All Menu Orders */}
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-gray-500">All Menu Orders</div>
          <div className="text-2xl font-bold">{stats.allMenuOrders}</div>
        </div>
        {/* Foods -> onClick => buka modal */}
        <div
          className="border rounded-lg p-4 bg-white cursor-pointer hover:bg-gray-50"
          onClick={() => handleOpenCategorySummary("Food")}
        >
          <div className="text-sm text-gray-500">Foods</div>
          <div className="text-2xl font-bold">{stats.foods}</div>
        </div>
        {/* Beverages */}
        <div
          className="border rounded-lg p-4 bg-white cursor-pointer hover:bg-gray-50"
          onClick={() => handleOpenCategorySummary("Beverage")}
        >
          <div className="text-sm text-gray-500">Beverages</div>
          <div className="text-2xl font-bold">{stats.beverages}</div>
        </div>
        {/* Desserts */}
        <div
          className="border rounded-lg p-4 bg-white cursor-pointer hover:bg-gray-50"
          onClick={() => handleOpenCategorySummary("Dessert")}
        >
          <div className="text-sm text-gray-500">Desserts</div>
          <div className="text-2xl font-bold">{stats.desserts}</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Total Omzet</h2>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
          {/* Start date */}
          <div className="relative" ref={startCalendarRef}>
            <label className="text-sm font-medium mb-2 block">Start date</label>
            <button
              onClick={handleStartDateClick}
              className="flex items-center border rounded-md px-3 py-2 text-left focus:outline-none"
            >
              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
              <span>
                {startDate
                  ? startDate.toLocaleDateString("id-ID")
                  : "Select date"}
              </span>
            </button>
            {/* Datepicker manual */}
            {showStartCalendar && (
              <div className="absolute bg-white border rounded-md p-3 mt-1 z-50">
                {Array.from({ length: 31 }).map((_, i) => (
                  <button
                    key={i}
                    className="px-2 py-1 text-sm hover:bg-gray-100 block"
                    onClick={() =>
                      handleDateSelect(
                        new Date(
                          new Date().getFullYear(),
                          new Date().getMonth(),
                          i + 1
                        ),
                        "start"
                      )
                    }
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Finish date */}
          <div className="relative" ref={endCalendarRef}>
            <label className="text-sm font-medium mb-2 block">
              Finish date
            </label>
            <button
              onClick={() => setShowEndCalendar(!showEndCalendar)}
              className="flex items-center border rounded-md px-3 py-2 text-left focus:outline-none"
            >
              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
              <span>
                {finishDate
                  ? finishDate.toLocaleDateString("id-ID")
                  : "Select date"}
              </span>
            </button>
            {showEndCalendar && (
              <div className="absolute bg-white border rounded-md p-3 mt-1 z-50">
                {Array.from({ length: 31 }).map((_, i) => (
                  <button
                    key={i}
                    className="px-2 py-1 text-sm hover:bg-gray-100 block"
                    onClick={() =>
                      handleDateSelect(
                        new Date(
                          new Date().getFullYear(),
                          new Date().getMonth(),
                          i + 1
                        ),
                        "finish"
                      )
                    }
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Select Category */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Select Category</label>
            <select
              className="border rounded-md px-3 py-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Beverage">Beverage</option>
              <option value="Dessert">Dessert</option>
            </select>
          </div>
        </div>

        {/* The Bar Chart */}
        {chartData ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="text-center text-gray-500 mt-4">Loading chart...</div>
        )}
      </div>

      {/* Modal Category Summary */}
      {showCategoryModal && (
        <CategorySummaryModal
          categoryName={categoryTitle}
          itemsData={categoryItems}
          onClose={closeCategoryModal}
        />
      )}
    </div>
  );
};

export default Dashboard;
