import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const AddressPayment = () => {
  const { clearCart } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  const buyNowProduct = location.state?.product;
  const buyNowQuantity = location.state?.quantity || 1;

  const [showSummary, setShowSummary] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Address States
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("");

  // Payment States
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardType, setCardType] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");
  const [upiId, setUpiId] = useState("");

  // ✅ Added: Payment Status state
  const [paymentStatus, setPaymentStatus] = useState("Pending");

  const [placedCart, setPlacedCart] = useState([]);

  // Load Cart or BuyNow
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    if (buyNowProduct) {
      setPlacedCart([{ ...buyNowProduct, quantity: buyNowQuantity }]);
    } else {
      setPlacedCart(storedCart);
    }
  }, [buyNowProduct, buyNowQuantity]);

  const totalPrice = placedCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ✅ Handle Place Order
  const handlePlaceOrder = () => {
    if (
      !fullName ||
      !address ||
      !city ||
      !district ||
      !state ||
      !pincode ||
      !country ||
      !paymentMethod
    ) {
      alert("⚠️ Please fill all required fields!");
      return;
    }

    if (paymentMethod === "card") {
      if (!cardType) {
        alert("⚠️ Please select your card type!");
        return;
      }
      if (!cardNumber || !cvv || !expiry) {
        alert("⚠️ Please fill complete card details!");
        return;
      }
    }

    if (paymentMethod === "upi" && !upiId) {
      alert("⚠️ Please enter your UPI ID!");
      return;
    }

    // ✅ Added: Payment status logic like real e-commerce
    let currentPaymentStatus = "Pending";
    if (paymentMethod === "card" && cardNumber && cvv && expiry) {
      currentPaymentStatus = "Paid";
    } else if (paymentMethod === "upi" && upiId) {
      currentPaymentStatus = "Paid";
    } else if (paymentMethod === "cod") {
      currentPaymentStatus = "Pending";
    }
    setPaymentStatus(currentPaymentStatus);

    const newOrderId = Math.floor(100000 + Math.random() * 900000);
    setOrderId(newOrderId);
    setShowSummary(true);

    const orderData = {
      orderId: newOrderId,
      fullName,
      address,
      city,
      district,
      state,
      pincode,
      country,
      payment: {
        method: paymentMethod,
        cardType,
        cardNumber,
        cvv,
        expiry,
        upiId,
        // ✅ Added Payment Status field
        status: currentPaymentStatus,
      },
      totalPrice,
      cartItems: placedCart,
      date: new Date().toLocaleString(),
      deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      orderStatus: "Pending",
    };

    const existingOrders = JSON.parse(localStorage.getItem("hood")) || [];
    existingOrders.push(orderData);
    localStorage.setItem("hood", JSON.stringify(existingOrders));

    if (!buyNowProduct) {
      clearCart();
      localStorage.setItem("cart", JSON.stringify([]));
    }

    setTimeout(() => navigate("/"), 5000);
  };

  // Delivery Date
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDate = deliveryDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ✅ Order Summary
  if (showSummary) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-lg text-center">
        <h2 className="text-3xl font-bold text-green-600 mb-4">
          🎉 Order Placed Successfully!
        </h2>
        <p className="text-lg font-medium">
          🆔 Order ID: <span className="text-blue-600">{orderId}</span>
        </p>
        <p className="text-md text-gray-700">
          📦 Estimated Delivery: {formattedDate}
        </p>

        <h3 className="text-xl font-semibold mt-6">Order Details</h3>
        <ul className="text-left mt-3 mb-4">
          {placedCart.map((item, i) => (
            <li key={i} className="flex items-center gap-4 border-b py-2">
              <img
                src={item.image}
                alt={item.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <p className="font-medium">{item.title}</p>
                <p>Qty: {item.quantity}</p>
                <p>Price: ${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="text-xl font-bold mt-3">
          Total: ${totalPrice.toFixed(2)}
        </p>
        <p>
          <strong>📍 Address:</strong> {address}, {district}, {city}, {state},{" "}
          {pincode}, {country}
        </p>
        <p>
          <strong>👤 Name:</strong> {fullName}
        </p>
        <p>
          <strong>💳 Payment:</strong>{" "}
          {paymentMethod === "card" &&
            `${cardType} Card ending with ****${cardNumber.slice(-4)} (${paymentStatus})`}
          {paymentMethod === "upi" && `UPI ID: ${upiId} (${paymentStatus})`}
          {paymentMethod === "cod" && `Cash on Delivery (${paymentStatus})`}
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Redirecting to Home in 5 seconds...
        </p>
      </div>
    );
  }

  // ✅ Checkout Form
  return (
    <div className="max-w-2xl mx-auto border p-6 rounded-lg shadow-lg mt-10 bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Checkout</h2>

      {/* Address Section */}
      <h3 className="text-xl font-semibold mb-3">Shipping Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="border p-2 rounded" />
        <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="border p-2 rounded" />
        <input type="text" placeholder="District" value={district} onChange={(e) => setDistrict(e.target.value)} className="border p-2 rounded" />
        <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} className="border p-2 rounded" />
        <input type="text" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} className="border p-2 rounded" />
        <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} className="border p-2 rounded" />
      </div>
      <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border rounded p-2 mb-6" placeholder="Full address" />

      {/* Payment Section */}
      <h3 className="text-xl font-semibold mb-3">Payment Method</h3>
      <div className="flex flex-col gap-3 mb-6">
        {["card", "upi", "cod"].map((method) => (
          <label key={method} className="flex items-center gap-2 border p-3 rounded cursor-pointer hover:bg-gray-50 transition-all">
            <input
              type="radio"
              name="paymentMethod"
              value={method}
              checked={paymentMethod === method}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span className="font-medium capitalize">
              {method === "card" && "💳 Credit / Debit Card"}
              {method === "upi" && "📱 UPI (Google Pay, PhonePe, Paytm)"}
              {method === "cod" && "💵 Cash on Delivery"}
            </span>
          </label>
        ))}
      </div>

      {/* Dynamic Payment Fields */}
      {paymentMethod === "card" && (
        <div className="border p-4 rounded-lg bg-gray-50 mb-4 space-y-4">
          <div>
            <label className="block mb-1 font-medium">Choose Card Type</label>
            <select className="border p-2 rounded w-full" value={cardType} onChange={(e) => setCardType(e.target.value)}>
              <option value="">-- Select Card Type --</option>
              <option value="Visa">💠 Visa</option>
              <option value="MasterCard">💳 MasterCard</option>
              <option value="RuPay">🏦 RuPay</option>
              <option value="Amex">💎 American Express</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="border p-2 rounded" maxLength={16} />
            <input type="text" placeholder="CVV" value={cvv} onChange={(e) => setCvv(e.target.value)} className="border p-2 rounded" maxLength={3} />
            <input type="text" placeholder="Expiry (MM/YY)" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="border p-2 rounded" maxLength={5} />
          </div>
        </div>
      )}

      {paymentMethod === "upi" && (
        <div className="border p-4 rounded-lg bg-gray-50 mb-4">
          <input type="text" placeholder="Enter your UPI ID (example@okbank)" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="border p-2 w-full rounded" />
        </div>
      )}

      {paymentMethod === "cod" && (
        <div className="border p-4 rounded-lg bg-gray-50 mb-4 text-green-700 font-medium">
          You can pay using cash or card at the time of delivery.
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button onClick={handlePlaceOrder} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-all">
          Place Order
        </button>
      </div>
    </div>
  );
};

export default AddressPayment;
