// src/pages/SalesReport.js
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Calendar, RefreshCcw, Download, X } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Komponen modal: Detail satu order (TransactionDetail)
 * Menampilkan item dengan price & quantity, dsb.
 */
const TransactionDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  const orderDateStr = new Date(order.orderDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative w-[350px] md:w-[400px] bg-white rounded-md shadow-md p-6">
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">
          Transaction Detail
        </h2>

        {/* Info Order */}
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <strong>No Order:</strong> {order.orderNumber}
          </p>
          <p>
            <strong>Order Date:</strong> {order.orderDate ? orderDateStr : ""}
          </p>
          <p>
            <strong>Customer Name:</strong> {order.customerName}
          </p>
          <p>
            <strong>Order Type:</strong> {order.orderType}
            {order.tableNumber ? ` • Meja ${order.tableNumber}` : ""}
          </p>
        </div>

        <hr className="my-3" />

        {/* Items dengan price & quantity */}
        <div>
          {order.items.map((item, idx) => (
            <div key={idx} className="mb-3 text-sm">
              <div className="flex justify-between">
                <span>{item.menuItem.name}</span>
                <span>Rp {item.menuItem.price?.toLocaleString() || "0"}</span>
              </div>
              <div className="text-xs text-gray-500">
                {item.quantity} x Rp {item.menuItem.price?.toLocaleString() || "0"}
              </div>
            </div>
          ))}
        </div>

        <hr className="my-3" />

        {/* Subtotal & Tax */}
        <div className="flex justify-between text-sm">
          <span>Sub Total</span>
          <span>Rp {order.subtotal?.toLocaleString() || "0"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>Rp {order.tax?.toLocaleString() || "0"}</span>
        </div>

        <hr className="my-3" />

        {/* Total, Diterima, Kembalian */}
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>Rp {order.total?.toLocaleString() || "0"}</span>
        </div>
        <div className="mt-2 text-sm flex justify-between">
          <span>Diterima</span>
          <span>Rp {order.receivedAmount?.toLocaleString() || "0"}</span>
        </div>
        <div className="text-sm flex justify-between">
          <span>Kembalian</span>
          <span>Rp {order.change?.toLocaleString() || "0"}</span>
        </div>
      </div>
    </div>
  );
};
const CategorySummaryModal = ({ categoryName, itemsData, onClose }) => {
  // itemsData = [{name: "Gado-gado Spesial", total: 10}, ...]

  const [searchTerm, setSearchTerm] = useState("");

  // Filter by search
  const filtered = itemsData.filter((it) =>
    it.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative w-[400px] bg-white rounded-md shadow-md p-6">
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">{categoryName}</h2>

        {/* Search input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter the keyword here..."
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabel ringkasan */}
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
                  <td colSpan="2" className="py-4 text-center text-gray-500">
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

const SalesReport = () => {
  // Filter state
  const [startDate, setStartDate] = useState(null);
  const [finishDate, setFinishDate] = useState(null);
  const [category, setCategory] = useState("");
  const [orderType, setOrderType] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Data original
  const [orders, setOrders] = useState([]);

  // Data flatten (tiap item = satu baris)
  const [flatSales, setFlatSales] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    totalOrder: 0,
    totalOmzet: 0,
    allMenuSales: 0,
    foods: 0,
    beverages: 0,
    desserts: 0,
  });

  // Modal Detail Transaksi
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Modal Kategori (Foods / Beverages / Desserts)
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [categoryItems, setCategoryItems] = useState([]);

  // Datepicker Refs
  const startCalendarRef = useRef(null);
  const endCalendarRef = useRef(null);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPageOptions = [10, 20, 50];
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    fetchSalesData();
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line
  }, [startDate, finishDate, category, orderType, searchKeyword]);

  // Menutup datepicker
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

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];

      setOrders(data);

      // Flatten the orders
      const flat = flattenOrders(data);
      setFlatSales(flat);

      // Calculate statistics using the flattened data
      calculateStats(flat);

      // Apply filters on the flattened data
      const filtered = applySearchAndFilter(
        flat,
        searchKeyword,
        category,
        orderType,
        startDate,
        finishDate
      );
      setFilteredData(filtered);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
    }
  };

  // Flatten
  const flattenOrders = (ordersArr) => {
    return ordersArr.flatMap((ord) =>
      ord.items.map((it) => ({
        _orderId: ord._id,
        originalOrder: ord,
        orderNumber: ord.orderNumber,
        orderDate: ord.orderDate,
        orderType: ord.orderType,
        customerName: ord.customerName,
        tableNumber: ord.tableNumber,
        itemName: it.menuItem.name,
        itemCategory: it.menuItem.category,
        price: it.menuItem.price,    // Ensure price is mapped
        quantity: it.quantity,        // Ensure quantity is mapped
      }))
    );
  };

  const calculateStats = (data) => {
    // Calculate the number of unique orders
    const totalOrder = new Set(data.map((item) => item._orderId)).size;

    // Calculate total omzet (revenue)
    const totalOmzet = data.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Calculate total menu sales
    const allMenuSales = data.reduce((acc, item) => acc + item.quantity, 0);

    // Initialize counters
    let countFoods = 0;
    let countBeverages = 0;
    let countDesserts = 0;

    // Calculate counts based on category
    data.forEach((item) => {
      const cat = (item.itemCategory || "").toLowerCase();
      if (cat.includes("food")) {
        countFoods += item.quantity;
      } else if (cat.includes("beverage")) {
        countBeverages += item.quantity;
      } else if (cat.includes("dessert")) {
        countDesserts += item.quantity;
      }
    });

    // Update the stats state
    setStats({
      totalOrder,
      totalOmzet,
      allMenuSales,
      foods: countFoods,
      beverages: countBeverages,
      desserts: countDesserts,
    });
  };

  const applySearchAndFilter = (
    flatData,
    keyword,
    cat,
    oType,
    startDt,
    endDt
  ) => {
    const lowerKeyword = keyword.toLowerCase();

    return flatData.filter((row) => {
      // Filter tanggal
      const rowDate = new Date(row.orderDate).setHours(0, 0, 0, 0);
      if (startDt) {
        const startTime = new Date(startDt).setHours(0, 0, 0, 0);
        if (rowDate < startTime) return false;
      }
      if (endDt) {
        const endTime = new Date(endDt).setHours(23, 59, 59, 999);
        if (rowDate > endTime) return false;
      }

      // Filter category
      if (cat && cat !== "") {
        if (!row.itemCategory?.toLowerCase().includes(cat.toLowerCase())) {
          return false;
        }
      }

      // Filter orderType
      if (oType && oType !== "") {
        if (!row.orderType.toLowerCase().includes(oType.toLowerCase())) {
          return false;
        }
      }

      // Search
      const matchOrderNumber = row.orderNumber
        .toLowerCase()
        .includes(lowerKeyword);
      const matchCustomerName = row.customerName
        .toLowerCase()
        .includes(lowerKeyword);
      const matchItemName = row.itemName.toLowerCase().includes(lowerKeyword);
      const matchItemCategory = row.itemCategory
        .toLowerCase()
        .includes(lowerKeyword);

      return (
        matchOrderNumber ||
        matchCustomerName ||
        matchItemName ||
        matchItemCategory
      );
    });
  };

  // Tanggal
  const handleDateSelect = (date, type) => {
    if (type === "start") {
      setStartDate(date);
      setShowStartCalendar(false);
    } else {
      setFinishDate(date);
      setShowEndCalendar(false);
    }
  };

  // Reset
  const resetFilters = () => {
    setStartDate(null);
    setFinishDate(null);
    setCategory("");
    setOrderType("");
    setSearchKeyword("");
    setCurrentPage(1);

    setFilteredData(flatSales);
  };

  // Tekan tombol search
  const handleSearch = () => {
    const filtered = applySearchAndFilter(
      flatSales,
      searchKeyword,
      category,
      orderType,
      startDate,
      finishDate
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Export Excel (tambahkan kolom price & quantity)
  const exportToExcel = () => {
    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }
    const exportData = [];
    let index = 1;
    filteredData.forEach((row) => {
      const dateStr = new Date(row.orderDate).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      exportData.push({
        No: index,
        "Order Number": row.orderNumber,
        "Order Date": dateStr,
        "Order Type": row.orderType,
        Category: row.itemCategory,
        "Customer Name": row.customerName,
        Price: `Rp ${row.price.toLocaleString()}`,
        Quantity: row.quantity,
      });
      index++;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SalesReport");
    XLSX.writeFile(wb, "SalesReport.xlsx");
  };

  // Export PDF (punya price & quantity)
  const exportToPDF = () => {
    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }
    const doc = new jsPDF();
    doc.text("Sales Report", 14, 20);
    doc.setFontSize(12);

    const dateStr = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.text(dateStr, 14, 30);

    const tableColumn = [
      "No",
      "Order Number",
      "Order Date",
      "Order Type",
      "Category",
      "Customer Name",
      "Price",
      "Quantity",
    ];

    const tableRows = [];
    let index = 1;
    filteredData.forEach((row) => {
      tableRows.push([
        index,
        row.orderNumber,
        row.orderDate
          ? new Date(row.orderDate).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        row.orderType,
        row.itemCategory,
        row.customerName,
        `Rp ${row.price.toLocaleString()}`,
        row.quantity,
      ]);
      index++;
    });

    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 40 });
    doc.save("SalesReport.pdf");
  };

  // Buka modal detail order
  const openDetailModal = (originalOrder) => {
    setSelectedOrder(originalOrder);
    setShowDetailModal(true);
  };

  // Tutup detail order
  const closeDetailModal = () => {
    setSelectedOrder(null);
    setShowDetailModal(false);
  };

  // Buka modal ringkasan per kategori (Foods, dsb.)
  // Kita akan membuat summary => {name, total}, lalu set ke state.
  const handleOpenCategorySummary = (catType) => {
    // catType = "Foods" atau "Beverages" atau "Desserts"
    let catLower = catType.toLowerCase(); // "foods" => "food"

    // 1) Kumpulkan items dari `orders`
    //    yang termasuk category itu (food / beverage / dessert).
    // 2) Buat summary by itemName => total quantity
    const summaryMap = new Map(); // key = itemName, value = total

    orders.forEach((ord) => {
      ord.items.forEach((it) => {
        const c = (it.menuItem.category || "").toLowerCase();
        // Samakan logika dengan stats
        if (catLower.includes("food") && c.includes("food")) {
          summaryMap.set(it.menuItem.name, (summaryMap.get(it.menuItem.name) || 0) + it.quantity);
        } else if (catLower.includes("beverage") && c.includes("beverage")) {
          summaryMap.set(it.menuItem.name, (summaryMap.get(it.menuItem.name) || 0) + it.quantity);
        } else if (catLower.includes("dessert") && c.includes("dessert")) {
          summaryMap.set(it.menuItem.name, (summaryMap.get(it.menuItem.name) || 0) + it.quantity);
        }
      });
    });

    // 3) Konversi summaryMap => array of {name, total}
    const catArr = [];
    for (let [key, val] of summaryMap.entries()) {
      catArr.push({ name: key, total: val });
    }
    // 4) Urutkan (descending)
    catArr.sort((a, b) => b.total - a.total);

    // 5) Tampilkan modal
    setCategoryTitle(catType); // "Foods" dsb.
    setCategoryItems(catArr);
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setCategoryTitle("");
    setCategoryItems([]);
  };

  // Pagination calculations
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredData.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}

      {/* Main Content */}
      <main className="p-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Sales Report</h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">Total Order</div>
            <div className="text-2xl font-semibold">{stats.totalOrder}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">Total Omzet</div>
            <div className="text-2xl font-semibold">
              Rp {stats.totalOmzet.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">All Menu Sales</div>
            <div className="text-2xl font-semibold">{stats.allMenuSales}</div>
          </div>

          {/* Kotak Foods --> onClick => buka modal ringkasan Foods */}
          <div
            className="rounded-lg border p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => handleOpenCategorySummary("Foods")}
          >
            <div className="text-sm text-gray-500">Foods</div>
            <div className="text-2xl font-semibold">{stats.foods}</div>
          </div>

          {/* Kotak Beverages --> buka modal ringkasan Beverages */}
          <div
            className="rounded-lg border p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => handleOpenCategorySummary("Beverages")}
          >
            <div className="text-sm text-gray-500">Beverages</div>
            <div className="text-2xl font-semibold">{stats.beverages}</div>
          </div>

          {/* Kotak Desserts --> buka modal ringkasan Desserts */}
          <div
            className="rounded-lg border p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => handleOpenCategorySummary("Desserts")}
          >
            <div className="text-sm text-gray-500">Desserts</div>
            <div className="text-2xl font-semibold">{stats.desserts}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center gap-4 relative">
          {/* Start Date */}
          <div className="relative" ref={startCalendarRef}>
            <div className="mb-2 text-sm font-medium">Start</div>
            <button
              onClick={() => setShowStartCalendar(!showStartCalendar)}
              className="w-full md:w-[200px] border rounded-md px-3 py-2 text-left flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Calendar className="mr-2 h-4 w-4 text-gray-400" />
              <span>
                {startDate
                  ? startDate.toLocaleDateString("id-ID")
                  : "Select date"}
              </span>
            </button>
            {showStartCalendar && (
              <div className="absolute mt-1 bg-white border rounded-lg shadow-lg p-4 z-10">
                <div className="grid grid-cols-7 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-500"
                      >
                        {day}
                      </div>
                    )
                  )}
                  {Array.from({ length: 31 }).map((_, i) => (
                    <button
                      key={i}
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
                      className={`text-sm py-1 rounded-md ${
                        startDate &&
                        startDate.getDate() === i + 1 &&
                        startDate.getMonth() === new Date().getMonth()
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Finish Date */}
          <div className="relative" ref={endCalendarRef}>
            <div className="mb-2 text-sm font-medium">Finish</div>
            <button
              onClick={() => setShowEndCalendar(!showEndCalendar)}
              className="w-full md:w-[200px] border rounded-md px-3 py-2 text-left flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Calendar className="mr-2 h-4 w-4 text-gray-400" />
              <span>
                {finishDate
                  ? finishDate.toLocaleDateString("id-ID")
                  : "Select date"}
              </span>
            </button>
            {showEndCalendar && (
              <div className="absolute mt-1 bg-white border rounded-lg shadow-lg p-4 z-10">
                <div className="grid grid-cols-7 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-500"
                      >
                        {day}
                      </div>
                    )
                  )}
                  {Array.from({ length: 31 }).map((_, i) => (
                    <button
                      key={i}
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
                      className={`text-sm py-1 rounded-md ${
                        finishDate &&
                        finishDate.getDate() === i + 1 &&
                        finishDate.getMonth() === new Date().getMonth()
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <div className="mb-2 text-sm font-medium">Category</div>
            <select
              className="w-full md:w-[200px] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              <option value="Food">Food</option>
              <option value="Beverages">Beverages</option>
              <option value="Dessert">Dessert</option>
            </select>
          </div>

          {/* Order Type */}
          <div>
            <div className="mb-2 text-sm font-medium">Order Type</div>
            <select
              className="w-full md:w-[200px] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
            >
              <option value="">Select order type</option>
              <option value="Dine In">Dine In</option>
              <option value="Take Away">Take Away</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 mt-7">
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <RefreshCcw size={16} />
              Search
            </button>
            <button
              onClick={resetFilters}
              className="border rounded-md p-2 flex items-center justify-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Reset Filters"
            >
              <RefreshCcw size={16} />
            </button>
            <button
              onClick={exportToExcel}
              className="border rounded-md p-2 flex items-center justify-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Export to Excel"
            >
              <Download size={16} />
            </button>
            <button
              onClick={exportToPDF}
              className="border rounded-md p-2 flex items-center justify-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Export to PDF"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        {/* Tabel utama: HANYA menampilkan kolom ringkas, tanpa Price & Quantity */}
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="text-left p-3">No Order</th>
                <th className="text-left p-3">Order Date</th>
                <th className="text-left p-3">Order Type</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Customer Name</th>
                <th className="w-[80px] p-3">Detail</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.length > 0 ? (
                currentEntries.map((row, idx) => {
                  const dateStr = new Date(row.orderDate).toLocaleDateString(
                    "id-ID",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );
                  return (
                    <tr
                      key={`${row._orderId}-${idx}`}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3">{row.orderNumber}</td>
                      <td className="p-3">{dateStr}</td>
                      <td className="p-3">{row.orderType}</td>
                      <td className="p-3">{row.itemCategory}</td>
                      <td className="p-3">{row.customerName}</td>
                      <td className="p-3">
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          onClick={() => openDetailModal(row.originalOrder)}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="py-4 px-6 text-center text-gray-500"
                  >
                    No sales data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Show:</span>
            <select
              className="w-[70px] border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
            >
              {entriesPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500">Entries</span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`border rounded-md w-8 h-8 p-0 ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL DETAIL ORDER */}
      {showDetailModal && (
        <TransactionDetailModal
          order={selectedOrder}
          onClose={closeDetailModal}
        />
      )}

      {/* MODAL CATEGORY SUMMARY */}
      {showCategoryModal && (
        <CategorySummaryModal
          categoryName={categoryTitle}
          itemsData={categoryItems} // array of {name, total}
          onClose={closeCategoryModal}
        />
      )}
    </div>
  );
};

export default SalesReport;
