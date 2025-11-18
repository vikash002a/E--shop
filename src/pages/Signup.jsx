import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    if (!firstName || !lastName || !email || !mobile || !password) {
      alert("⚠️ All fields are required!");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert("⚠️ Invalid email!");
      return;
    }

   

    // Get existing users
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if user already exists
    const exists = users.find(u => u.email === email || u.mobile === mobile);
    if (exists) {
      alert("❌ User already exists. Please login!");
      navigate("/login");
      return;
    }

    const newUser = { firstName, lastName, email, mobile, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    alert("✅ Signup successful! Please login.");
    navigate("/login");
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>

      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />
    <input
    type="text"
    placeholder="Mobile Number"
    value={mobile}
    onChange={(e) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, "");
    setMobile(onlyNums);
  }}
  maxLength={10}
  className="w-full border p-2 rounded mb-3"
/>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />

      <button
        onClick={handleSignup}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
      >
        Signup
      </button>
    </div>
  );
};

export default Signup;
