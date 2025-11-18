import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const AdminLoginPage = () => {
  const [isRegister, setIsRegister] = useState(false); // toggle login/register
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CEO"); // default role
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Users database using localStorage
  const getUsers = () => JSON.parse(localStorage.getItem("adminUsers")) || [];
  const saveUsers = (users) => localStorage.setItem("adminUsers", JSON.stringify(users));

  // Staff storage
  const getStaff = () => JSON.parse(localStorage.getItem("staff") || "[]");
  const saveStaff = (staff) => localStorage.setItem("staff", JSON.stringify(staff));

  const handleLogin = (e) => {
    e.preventDefault();
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminRole", user.role);
      localStorage.setItem("adminEmail", user.email);
      alert(`✅ Welcome ${user.role}!`);
     
  // ✅ Check if user is published (active)
  if (user.published === false) {
    alert("❌ Your account is inactive. Contact admin.");
    return;
  }
      // Add to staff if not exists
      const staff = getStaff();
      if (!staff.find(s => s.email === user.email)) {
        staff.unshift({
          id: `S${Date.now()}`,
          name: name || email.split("@")[0],
          contact: contact || "",
          email: user.email,
          role: user.role,
          status: "Active",
          joinDate: new Date().toISOString().slice(0,10),
          published: true,
        });
        saveStaff(staff);
      }

      navigate("/admin");
    } else {
      alert("❌ Invalid credentials!");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const users = getUsers();
    if (users.some(u => u.email === email)) {
      alert("⚠️ User already exists!");
      return;
    }
    const newUser = { name, contact, email, password, role };
    saveUsers([...users, newUser]);
    alert("✅ Registration successful! Please login.");
    setIsRegister(false);

    // Add to staff
    const staff = getStaff();
    staff.unshift({
      id: `S${Date.now()}`,
      name,
      contact,
      email,
      role,
      status: "Active",
      joinDate: new Date().toISOString().slice(0,10),
      published: true,
    });
    saveStaff(staff);

    setName(""); setContact(""); setEmail(""); setPassword(""); setRole("CEO");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {isRegister ? "Create Account" : "Admin Login"}
        </h2>

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                placeholder="Contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded pr-10"
              required
            />
            <span
              className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </span>
          </div>

          {isRegister && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="SuperAdmin">Super Admin</option>
              <option value="CEO">CEO</option>
              <option value="Manager">Manager</option>
              <option value="Designer">Designer</option>
              <option value="Technician">Technician</option>
            </select>
          )}

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded"
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-500 hover:underline"
          >
            {isRegister ? "Already have an account? Login" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
