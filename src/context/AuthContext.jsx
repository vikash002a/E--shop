import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // ✅ Admin state add
  const [loading, setLoading] = useState(true);

  // 🔹 Page reload par user fetch karna aur unwanted email remove karna
  useEffect(() => {
    const tokenData = localStorage.getItem("authToken");
    if (tokenData) {
      const parsed = JSON.parse(tokenData);

      // ❌ Agar unwanted email hai to remove kar do
      if (parsed.user.email === "cart_vs4101845@gmail.com") {
        localStorage.removeItem("authToken");
        console.log("Removed unwanted email from localStorage");
      } else {
        setUser(parsed.user);

        // ✅ Check if user is admin
        if (parsed.user.email === "admin@gmail.com") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    }
    setLoading(false);
  }, []);

  // 🔹 Login function
  const login = ({ identifier, password }) => {
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

    setUser(foundUser);
    setIsAdmin(foundUser.email === "admin@gmail.com"); // ✅ Admin check

    const token =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("authToken", JSON.stringify({ token, user: foundUser }));

    alert("✅ Login successful!");
  };

  // 🔹 Signup function
  const signup = ({ firstName, lastName, email, password, mobile }) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const existing = users.find((u) => u.email === email || u.mobile === mobile);

    if (existing) {
      alert("⚠️ User already exists!");
      return;
    }

    const newUser = { firstName, lastName, email, password, mobile };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    alert("✅ Signup successful! Please login.");
  };

  // 🔹 Logout function
  const logout = () => {
    setUser(null);
    setIsAdmin(false); // ✅ Reset admin state
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, login, signup, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
