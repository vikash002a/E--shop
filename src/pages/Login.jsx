// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(""); // Email or Mobile
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      alert("⚠️ All fields are required!");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = users.find(
      (u) =>
        (u.email === identifier || u.mobile === identifier) &&
        u.password === password
    );

    if (!foundUser) {
      alert("❌ Invalid credentials!");
      return;
    }

    // ✅ Login function from AuthContext
    login({ identifier, password });

    // ✅ Admin check — agar admin email se login kare to /admin par bhej do
    setTimeout(() => {
      if (foundUser.email === "admin@gmail.com") {
        navigate("/admin"); // 👑 Admin redirect
      } else {
        navigate("/"); // 👤 Normal user redirect
      }
    }, 500);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md rounded-lg p-8 w-96"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>

        <input
          type="text"
          placeholder="Email or Mobile"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
          required
        />

        <button
          type="submit"
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 w-full rounded-lg"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
