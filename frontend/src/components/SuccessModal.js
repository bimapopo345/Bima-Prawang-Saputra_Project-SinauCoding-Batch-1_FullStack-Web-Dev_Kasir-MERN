// frontend/src/components/SuccessModal.js

import React from "react";

const SuccessModal = ({ isOpen, onClose, orderDetails }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Transaction Success</h3>
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

          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div>
              <div className="flex justify-between text-gray-600">
                <span>No Order</span>
                <span>{orderDetails.orderNumber}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Order Date</span>
                <span>
                  {new Date(orderDetails.orderDate).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Customer Name</span>
                <span>{orderDetails.customerName}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Type</span>
                <span>{orderDetails.orderType}</span>
              </div>
            </div>

            <div className="border-t border-dashed pt-2" id="receipt-items">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex justify-between mb-2">
                  <span>
                    {item.quantity} x {item.menuItem.name}
                    {item.note ? ` - ${item.note}` : ""}
                  </span>
                  <span>
                    Rp {(item.menuItem.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed pt-2 space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Sub Total</span>
                <span>Rp {orderDetails.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>Rp {orderDetails.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>Rp {orderDetails.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 pt-2">
                <span>Received</span>
                <span>Rp {orderDetails.receivedAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Change</span>
                <span>Rp {orderDetails.change.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700"
          >
            Print Struk
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
