// src/pages/AdminRegister.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const AdminRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin"); // e.g., CEO, manager, admin
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return alert("All fields required");
    if (password.length < 6) return alert("Password must be 6+ chars");
    if (password !== confirm) return alert("Passwords do not match");

    const raw = localStorage.getItem("adminUsers");
    const adminUsers = raw ? JSON.parse(raw) : [];

    // Prevent duplicate emails
    if (adminUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return alert("User with this email already exists");
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      id: `admin_${Date.now()}`,
      name,
      email,
      role,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    adminUsers.push(newUser);
    localStorage.setItem("adminUsers", JSON.stringify(adminUsers));
    alert("Admin user created successfully. You can now login.");
    navigate("/admin-login");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">➕ Create Admin User</h2>

        <form onSubmit={handleRegister} className="space-y-3">
          <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded" required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" required />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border rounded">
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="ceo">CEO</option>
            <option value="editor">Editor</option>
          </select>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" required />
          <input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-3 py-2 border rounded" required />

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded">
            Create Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;
