import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { useTranslation } from "react-i18next";

const Navbar = ({ onSearch }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useContext(AuthContext);
  const { totalItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isAdmin = localStorage.getItem("isAdmin") === "true"; // ✅ Check admin login

  const handleLogout = () => {
    if (isAdmin) {
      // ✅ Admin logout
      localStorage.removeItem("isAdmin");
      navigate("/");
    } else {
      // ✅ Normal user logout
      logout();
      navigate("/login");
    }
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setDropdownOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
    navigate(`/?search=${searchQuery}`);
    setSearchQuery("");
  };

  return (
    <nav className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-full mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-yellow-400">
          🛒 E-Shop
        </Link>

        {/* 🔹 Search bar (only visible for users) */}
        {!isAdmin && (location.pathname === "/" || location.pathname === "/home") && (
          <form onSubmit={handleSearch} className="hidden md:flex items-center ml-6">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1 rounded-l-lg border border-gray-400 text-gray-700 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-r-lg text-white font-semibold"
            >
              🔍
            </button>
          </form>
        )}

        {/* Navigation Links */}
        <div className="flex items-center gap-8 text-lg font-medium">
          {!isAdmin ? (
            <>
              <Link to="/" className="text-gray-200 hover:text-yellow-400 transition">
                {t("home")}
              </Link>
              <Link to="/products" className="text-gray-200 hover:text-yellow-400 transition">
                {t("products")}
              </Link>
              <Link to="/cart" className="relative text-gray-200 hover:text-yellow-400 transition">
                {t("cart")}
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
              <Link to="/contact" className="text-gray-200 hover:text-yellow-400 transition">
                {t("contact")}
              </Link>
              {user && (
                <Link to="/orders" className="text-gray-200 hover:text-yellow-400 transition">
                  {t("orderHistory")}
                </Link>
              )}
            </>
          ) : (
            <>
             
            </>
          )}
        </div>

        {/* Language Dropdown */}
        {!isAdmin && (
          <div className="relative mr-4">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white text-sm"
            >
              Language
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-28 bg-white text-gray-800 rounded shadow-lg z-50">
                <button
                  onClick={() => changeLanguage("en")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage("hi")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  हिंदी
                </button>
              </div>
            )}
          </div>
        )}

        {/* ✅ Login / Logout Buttons */}
        <div className="flex items-center gap-4">
          {!isAdmin && (
            <Link
              to="/admin-login"
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-1 rounded-lg transition font-semibold"
            >
              Admin
            </Link>
          )}

          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg transition"
            >
              Logout
            </button>
          ) : user ? (
            <>
              <span className="text-gray-300 text-sm">
                👋 {user.firstName} {user.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg transition"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg transition"
              >
                {t("login")}
              </Link>
              <Link
                to="/signup"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-lg transition"
              >
                {t("signup")}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
