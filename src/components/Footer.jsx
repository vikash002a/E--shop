import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-10">
      <div className="container mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* --- About Section --- */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-white">MyShop</h2>
          <p className="text-sm text-gray-400">
            Your one-stop destination for the latest fashion, electronics,
            jewelry, and more. Shop smart, shop MyShop 🛍️.
          </p>
        </div>

        {/* --- Quick Links --- */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-white">Quick Links</h2>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/products" className="hover:text-white">Products</Link></li>
            <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
          </ul>
        </div>

        {/* --- Customer Service --- */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-white">Customer Service</h2>
          <ul className="space-y-2">
            <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link to="/returns" className="hover:text-white">Returns</Link></li>
            <li><Link to="/shipping" className="hover:text-white">Shipping Info</Link></li>
            <li><Link to="/support" className="hover:text-white">Support</Link></li>
          </ul>
        </div>

        {/* --- Social Media --- */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-white">Follow Us</h2>
          <div className="flex space-x-4">
            <a href="#" target="_blank" rel="noreferrer" className="hover:text-white">
              🌐 Facebook
            </a>
            <a href="#" target="_blank" rel="noreferrer" className="hover:text-white">
              🐦 Twitter
            </a>
            <a href="#" target="_blank" rel="noreferrer" className="hover:text-white">
              📸 Instagram
            </a>
          </div>
        </div>
      </div>

      {/* --- Bottom Bar --- */}
      <div className="bg-gray-800 text-center py-4 text-sm text-gray-400 border-t border-gray-700">
        © {new Date().getFullYear()} MyShop. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
