import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Products = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState(""); // Low to High / High to Low
  const [priceRange, setPriceRange] = useState(2000); // Max price slider
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const navigate = useNavigate();

  // Fetch products from API
  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.log("API Error:", err));
  }, []);

  // Apply filter
  let filteredProducts =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  // Apply price range filter
  filteredProducts = filteredProducts.filter((p) => p.price <= priceRange);

  // Apply search filter
  if (searchQuery.trim() !== "") {
    filteredProducts = filteredProducts.filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply sort
  if (sortOrder === "lowToHigh") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "highToLow") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  const handleViewDetails = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const categories = ["all","men's clothing","women's clothing","jewelery","electronics"];

  return (
    <div className="container mx-auto p-4">
      {/* Search + Filter & Sort */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-gray-100 p-4 rounded-lg shadow mb-6 gap-4">
        {/* Search Bar */}
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-gray-700"
          />
        </div>

        {/* Sort Dropdown */}
        <div>
          <label className="font-semibold text-gray-700 mr-2">{t("sortBy")}:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-400 rounded-lg px-3 py-2 text-gray-700"
          >
            <option value="">{t("all")}</option>
            <option value="lowToHigh">{t("lowToHigh")}</option>
            <option value="highToLow">{t("highToLow")}</option>
          </select>
        </div>

        {/* Price Range Slider */}
        <div className="flex flex-col items-center md:items-end">
          <label htmlFor="priceRange" className="font-semibold text-gray-700 mb-1">
            {t("maxPrice")}: ${priceRange}
          </label>
          <input
            type="range"
            id="priceRange"
            min="0"
            max="2000"
            step="10"
            value={priceRange}
            onChange={(e) => setPriceRange(parseFloat(e.target.value))}
            className="w-48 accent-blue-600"
          />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-300 transition"
            onClick={() => setFilter(cat)}
          >
            {cat === "all" ? t("all") : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 flex flex-col justify-between shadow hover:shadow-xl transition"
          >
            <img
              src={product.image}
              alt={product.title}
              className="h-40 object-contain mx-auto mb-4 cursor-pointer"
              onClick={() => handleViewDetails(product)}
            />
            <h2
              className="font-semibold text-lg mb-2 cursor-pointer"
              onClick={() => handleViewDetails(product)}
            >
              {product.title}
            </h2>
            <p className="font-bold text-green-700 mb-2">
              {t("price")}: ${product.price}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
