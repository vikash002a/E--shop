import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // ✅ Import translation

const Cart = () => {
  const { t } = useTranslation();
  const { cartItems, updateCartItem, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">{t("cart")}</h2>

      {cartItems.length === 0 ? (
        <p>{t("cartEmpty")}</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded shadow">
              <div className="flex items-center gap-4">
                <img src={item.image} alt={item.title} className="w-16 h-16 object-contain" />
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-gray-500">{t("sku")}: {item.id}</p>
                  <p className="text-green-700 font-bold">${item.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateCartItem(item.id, item.quantity - 1)}
                  className="bg-gray-300 px-2 rounded hover:bg-gray-400"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateCartItem(item.id, item.quantity + 1)}
                  className="bg-gray-300 px-2 rounded hover:bg-gray-400"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-500 px-2 py-1 text-white rounded hover:bg-red-600"
                >
                  {t("remove")}
                </button>
              </div>
            </div>
          ))}
          <div className="text-right font-bold text-xl">
            {t("total")}: ${totalPrice.toFixed(2)}
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4"
          >
            {t("proceedCheckout")}
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
