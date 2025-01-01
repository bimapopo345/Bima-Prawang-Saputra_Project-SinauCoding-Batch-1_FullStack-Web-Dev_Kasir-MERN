import React, { useEffect, useState } from "react";
import axios from "axios";
import EditNoteModal from "../components/EditNoteModal";
import SuccessModal from "../components/SuccessModal";
import OrderArchiveModal from "../components/OrderArchiveModal";

const Kasir = ({ setToast }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState({});
  const [orderType, setOrderType] = useState("Take Away");
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [receivedAmount, setReceivedAmount] = useState(0);

  const [editNoteModalOpen, setEditNoteModalOpen] = useState(false);
  const [currentEditOrder, setCurrentEditOrder] = useState(null);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);

  const [orderArchiveModalOpen, setOrderArchiveModalOpen] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/menu", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(res.data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setToast({ type: "error", message: "Gagal mengambil data menu" });
    }
  };

  const addToOrder = (item, note = "") => {
    setOrders((prev) => {
      const updated = { ...prev };
      if (updated[item._id]) {
        updated[item._id].quantity += 1;
      } else {
        updated[item._id] = {
          ...item,
          quantity: 1,
          note,
        };
      }
      return updated;
    });
    setToast({
      type: "success",
      message: `${item.name} ditambahkan ke pesanan`,
    });
  };

  const incrementOrder = (key) => {
    setOrders((prev) => {
      const updated = { ...prev };
      updated[key].quantity += 1;
      return updated;
    });
  };

  const decrementOrder = (key) => {
    setOrders((prev) => {
      const updated = { ...prev };
      updated[key].quantity -= 1;
      if (updated[key].quantity <= 0) {
        delete updated[key];
      }
      return updated;
    });
  };

  const openEditNoteModal = (key) => {
    setCurrentEditOrder({ key, ...orders[key] });
    setEditNoteModalOpen(true);
  };

  const closeEditNoteModal = () => {
    setEditNoteModalOpen(false);
    setCurrentEditOrder(null);
  };

  const submitEditNote = (note) => {
    setOrders((prev) => {
      const updated = { ...prev };
      updated[currentEditOrder.key].note = note;
      return updated;
    });
    setToast({
      type: "success",
      message: `Catatan untuk "${currentEditOrder.name}" diperbarui`,
    });
    closeEditNoteModal();
  };

  const renderOrderList = () => {
    const orderKeys = Object.keys(orders);
    if (orderKeys.length === 0) {
      return <p className="text-gray-500">No Menu Selected</p>;
    }

    return orderKeys.map((key) => {
      const order = orders[key];
      return (
        <div
          key={key}
          className="flex justify-between items-center mb-4"
          data-id={key}
        >
          <div className="flex-1">
            <h3 className="font-semibold">{order.name}</h3>
            {order.note && (
              <p className="text-sm text-gray-500 italic">{order.note}</p>
            )}
            <div className="flex items-center text-gray-500 text-sm space-x-2 mt-1">
              {/* Pastikan pakai order.price, bukan order.menuItem?.price */}
              <span>Rp {order.price.toLocaleString()}</span>
              <button
                onClick={() => openEditNoteModal(key)}
                className="text-blue-600 underline"
                title="Edit Note"
              >
                Edit Note
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => decrementOrder(key)}
              className="px-2 py-1 bg-gray-200 rounded"
            >
              -
            </button>
            <span className="text-gray-700">{order.quantity}</span>
            <button
              onClick={() => incrementOrder(key)}
              className="px-2 py-1 bg-gray-200 rounded"
            >
              +
            </button>
          </div>
        </div>
      );
    });
  };

  const handleCategoryFilter = (category) => {
    if (category === "All Menu") {
      fetchMenuItems();
    } else {
      const filtered = menuItems.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );
      setMenuItems(filtered);
    }
  };

  const handleOrderType = (type) => {
    setOrderType(type);
    if (type === "Take Away") {
      setTableNumber("");
    }
  };

  const handlePay = async () => {
    if (!customerName) {
      setToast({ type: "error", message: "Harap isi nama pelanggan" });
      return;
    }
    if (orderType === "Dine In" && !tableNumber) {
      setToast({ type: "error", message: "Harap pilih nomor meja" });
      return;
    }
    if (Object.keys(orders).length === 0) {
      setToast({ type: "error", message: "Tidak ada item dalam pesanan" });
      return;
    }

    let subtotal = 0;
    Object.keys(orders).forEach((key) => {
      subtotal += orders[key].price * orders[key].quantity;
    });

    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;
    const change = receivedAmount - total;

    if (receivedAmount < total) {
      setToast({
        type: "error",
        message: "Jumlah diterima kurang dari total",
      });
      return;
    }

    const orderNumber = "ORD#" + Date.now().toString().slice(-8);
    const orderDate = new Date().toISOString();

    // Gunakan price dari state
    const formattedItems = Object.values(orders).map((item) => ({
      menuItem: item._id,
      quantity: item.quantity,
      note: item.note || "",
      price: item.price, // Penting: Gunakan item.price
    }));

    const orderDetails = {
      orderNumber,
      orderDate,
      customerName,
      orderType,
      tableNumber,
      items: formattedItems,
      subtotal,
      tax,
      total,
      receivedAmount,
      change,
      isPaid: true,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/orders", orderDetails, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 201) {
        setSuccessDetails(res.data);
        setSuccessModalOpen(true);

        setOrders({});
        setCustomerName("");
        setTableNumber("");
        setReceivedAmount(0);

        setToast({
          type: "success",
          message: "Pembayaran berhasil dan pesanan disimpan.",
        });
      } else {
        setToast({ type: "error", message: "Gagal menyimpan pesanan." });
      }
    } catch (error) {
      console.error("Error saving order:", error);
      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan pesanan.",
      });
    }
  };

  const closeSuccessModal = () => {
    setSuccessModalOpen(false);
    setSuccessDetails(null);
  };

  const handleArchive = async () => {
    if (Object.keys(orders).length === 0) {
      setToast({
        type: "error",
        message: "Tidak ada pesanan untuk diarsipkan",
      });
      return;
    }

    try {
      const orderNumber = "ORD#" + Date.now().toString().slice(-8);
      const orderDate = new Date().toISOString();

      // Gunakan price dari state
      const formattedItems = Object.values(orders).map((item) => ({
        menuItem: item._id,
        quantity: item.quantity,
        note: item.note || "",
        price: item.price, // Penting: Gunakan item.price
      }));

      const subtotal = Object.values(orders).reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const tax = Math.round(subtotal * 0.1);
      const total = subtotal + tax;

      const archivedOrder = {
        orderNumber,
        orderDate,
        customerName,
        orderType,
        tableNumber: orderType === "Dine In" ? tableNumber : null,
        items: formattedItems, // include price
        subtotal,
        tax,
        total,
        receivedAmount: 0,
        change: 0,
        isArchived: true,
        isPaid: false,
      };

      const token = localStorage.getItem("token");
      const res = await axios.post("/api/orders", archivedOrder, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 201) {
        setToast({
          type: "success",
          message: "Pesanan berhasil diarsipkan.",
        });
        setOrders({});
        setCustomerName("");
        setTableNumber("");
        setReceivedAmount(0);
      } else {
        setToast({ type: "error", message: "Gagal mengarsipkan pesanan." });
      }
    } catch (error) {
      console.error("Error archiving order:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setToast({
          type: "error",
          message: error.response.data.message,
        });
      } else {
        setToast({
          type: "error",
          message: "Terjadi kesalahan saat mengarsipkan pesanan.",
        });
      }
    }
  };

  const handleRestoreOrder = async (order) => {
    try {
      const token = localStorage.getItem("token");
      // Panggil endpoint restore untuk ubah isArchived jadi false di DB
      await axios.post(
        `/api/orders/${order._id}/restore`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Biar nama & nomor meja balik juga
      setCustomerName(order.customerName || "");
      setTableNumber(order.tableNumber || "");

      // Kembalikan item2 ke state orders, pastikan pakai item.price
      const restoredOrders = { ...orders };
      if (order.items && order.items.length) {
        order.items.forEach((item) => {
          if (item.menuItem && item.menuItem._id) {
            const menuItemId = item.menuItem._id;
            const menuItemName = item.menuItem.name || "(Deleted)";
            const menuItemCategory = item.menuItem.category || "";
            const menuItemImage =
              item.menuItem.image || "/uploads/default-menu.png";

            // Harga custom yang sudah diarsipkan
            const archivedPrice = item.price; // <-- inilah yang penting

            if (restoredOrders[menuItemId]) {
              restoredOrders[menuItemId].quantity += item.quantity;
              if (item.note) {
                restoredOrders[menuItemId].note = item.note;
              }
            } else {
              restoredOrders[menuItemId] = {
                _id: menuItemId,
                name: menuItemName,
                price: archivedPrice, // pakai price dari arsip
                quantity: item.quantity,
                note: item.note || "",
                image: menuItemImage,
                category: menuItemCategory,
              };
            }
          }
        });
      }

      setOrders(restoredOrders);
      setToast({
        type: "success",
        message: "Pesanan berhasil dikembalikan ke keranjang.",
      });
      setOrderArchiveModalOpen(false);
    } catch (error) {
      console.error("Error restoring order:", error);
      setToast({
        type: "error",
        message: "Gagal mengembalikan pesanan dari arsip.",
      });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kasir</h1>

      <div className="flex flex-col md:flex-row">
        {/* Bagian Kiri: Menu Items */}
        <div className="md:w-2/3">
          <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => handleCategoryFilter("All Menu")}
              className="px-6 py-2 rounded-full border border-gray-300"
            >
              All Menu
            </button>
            <button
              onClick={() => handleCategoryFilter("Food")}
              className="px-6 py-2 rounded-full border border-gray-300"
            >
              Foods
            </button>
            <button
              onClick={() => handleCategoryFilter("Beverage")}
              className="px-6 py-2 rounded-full border border-gray-300"
            >
              Beverages
            </button>
            <button
              onClick={() => handleCategoryFilter("Dessert")}
              className="px-6 py-2 rounded-full border border-gray-300"
            >
              Dessert
            </button>
          </div>

          <div
            id="menu-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {menuItems.length === 0 ? (
              <p className="text-gray-500">No menu items available.</p>
            ) : (
              menuItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={
                        item.image
                          ? item.image.startsWith("http://") ||
                            item.image.startsWith("https://")
                            ? item.image
                            : `http://127.0.0.1:5000${item.image}`
                          : "/uploads/default-menu.png"
                      }
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-blue-600 font-medium">
                        Rp {item.price.toLocaleString()}
                      </span>
                      <button
                        onClick={() => addToOrder(item)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Add to Order"
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bagian Kanan: Cart */}
        <div className="md:w-1/3 md:ml-6 bg-white rounded-xl shadow-sm p-6 mt-8 md:mt-0">
          <h2 className="text-xl font-semibold mb-6">List Order</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <button
                onClick={() => handleOrderType("Dine In")}
                className={`flex-1 ${
                  orderType === "Dine In"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                } font-medium py-2 rounded-lg`}
              >
                Dine In
              </button>
              <button
                onClick={() => handleOrderType("Take Away")}
                className={`flex-1 ${
                  orderType === "Take Away"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                } font-medium py-2 rounded-lg`}
              >
                Take Away
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="customer-name"
                  className="text-sm text-gray-600 block mb-2"
                >
                  Customer Name
                </label>
                <input
                  type="text"
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {orderType === "Dine In" && (
                <div>
                  <label
                    htmlFor="table-number"
                    className="text-sm text-gray-600 block mb-2"
                  >
                    No.Table
                  </label>
                  <select
                    id="table-number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Select No Table</option>
                    {Array.from({ length: 20 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Table {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <div id="order-list">{renderOrderList()}</div>

              {/* Subtotal, Tax, Total */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Sub Total</span>
                  <span>
                    Rp{" "}
                    {Object.values(orders)
                      .reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                      .toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>
                    Rp{" "}
                    {Math.round(
                      Object.values(orders).reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      ) * 0.1
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-gray-800 pt-2 border-t">
                  <span>Total</span>
                  <span>
                    Rp{" "}
                    {(
                      Object.values(orders).reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      ) +
                      Math.round(
                        Object.values(orders).reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0
                        ) * 0.1
                      )
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-gray-600">Select Nominal</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    onClick={() => setReceivedAmount(50000)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Rp 50.000
                  </button>
                  <button
                    onClick={() => setReceivedAmount(75000)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Rp 75.000
                  </button>
                  <button
                    onClick={() => setReceivedAmount(100000)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Rp 100.000
                  </button>
                </div>
              </div>
              <div>
                <input
                  type="number"
                  id="custom-nominal"
                  value={receivedAmount}
                  onChange={(e) =>
                    setReceivedAmount(parseInt(e.target.value) || 0)
                  }
                  placeholder="Enter Nominal here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <button
                onClick={handlePay}
                className={`flex-1 ${
                  Object.keys(orders).length > 0
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-600"
                } font-medium py-2 rounded-lg transition-colors duration-200`}
              >
                Pay
              </button>
              <button
                onClick={handleArchive}
                className={`flex-1 ${
                  Object.keys(orders).length > 0
                    ? "bg-yellow-600 text-white hover:bg-yellow-700"
                    : "bg-gray-200 text-gray-600"
                } font-medium py-2 rounded-lg transition-colors duration-200`}
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Note Modal */}
      {editNoteModalOpen && currentEditOrder && (
        <EditNoteModal
          isOpen={editNoteModalOpen}
          onClose={closeEditNoteModal}
          onSubmit={submitEditNote}
          order={currentEditOrder}
        />
      )}

      {/* Success Modal */}
      {successModalOpen && successDetails && (
        <SuccessModal
          isOpen={successModalOpen}
          onClose={closeSuccessModal}
          orderDetails={successDetails}
        />
      )}

      {/* Archive Modal */}
      <OrderArchiveModal
        isOpen={orderArchiveModalOpen}
        onClose={() => setOrderArchiveModalOpen(false)}
        onRestore={handleRestoreOrder}
      />

      {/* Tombol buka Archive Modal */}
      <button
        onClick={() => setOrderArchiveModalOpen(true)}
        className="fixed bottom-5 right-5 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700"
        title="Open Order Archive"
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>
    </div>
  );
};

export default Kasir;
