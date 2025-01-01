// frontend/src/components/OrderArchiveModal.js

import React, { useEffect, useState } from "react";
import axios from "axios";

const OrderArchiveModal = ({ isOpen, onClose, onRestore }) => {
  const [archivedOrders, setArchivedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchArchivedOrders();
    }
  }, [isOpen]);

  const fetchArchivedOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/orders/archived", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArchivedOrders(res.data);
    } catch (error) {
      console.error("Error fetching archived orders:", error);
      setError("Gagal mengambil data pesanan.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (order) => {
    onRestore(order); // Pastikan onRestore adalah fungsi yang diteruskan dari parent
    setArchivedOrders((prev) => prev.filter((o) => o._id !== order._id));
    setError(null);
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl mx-4 shadow-lg overflow-y-auto max-h-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Order Archive</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : archivedOrders.length === 0 ? (
              <p className="text-gray-500">No archived orders.</p>
            ) : (
              <div className="space-y-4">
                {archivedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleString("id-ID")}
                      </div>
                      <div className="mt-2">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.quantity} x {item.menuItem?.name}
                              {item.note ? ` - ${item.note}` : ""}
                            </span>
                            <span>
                              Rp{" "}
                              {(
                                (item.menuItem?.price || 0) * item.quantity
                              ).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between font-semibold mt-2">
                        <span>Total:</span>
                        <span>Rp {order.total.toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestore(order)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default OrderArchiveModal;
