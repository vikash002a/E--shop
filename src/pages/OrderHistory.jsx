import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next"; // ✅ Import translation

const OrderHistory = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext); // Logged-in user
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // LocalStorage se orders fetch karo
    const storedOrders = JSON.parse(localStorage.getItem("hood")) || [];
    setOrders(storedOrders);
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
        📜 {t("orderHistory")}
      </h2>

      {orders.length === 0 ? (
        <p className="text-center text-gray-600">{t("noOrders")}</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between mb-2">
                <p className="font-semibold">🆔 {t("orderId")}: {order.orderId}</p>
                <p className="text-gray-600 text-sm">📅 {order.date}</p>
              </div>

              <p className="font-medium">
                👤 {order.fullName} | 📍 {order.city}, {order.state}
              </p>
              <p>
                💰 <strong>{t("total")}:</strong> ${order.totalPrice.toFixed(2)}
              </p>
              <p>
                💳 <strong>{t("payment")}:</strong> Card ending with ****
                {order.payment.cardNumber.slice(-4)}
              </p>

              <h4 className="mt-3 font-semibold">🛒 {t("orderedItems")}:</h4>
              <ul className="mt-2 space-y-2">
                {order.cartItems.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 border-b pb-2 justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-14 h-14 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-gray-600">
                          {t("quantity")}: {item.quantity}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
