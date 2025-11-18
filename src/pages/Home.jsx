// ✅ Fully Fixed & Optimized Home.jsx (Layout Centered + No Right Shift)
// Tailwind layout corrected, removed w-[89%], added proper container sizing

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useTranslation } from "react-i18next";

import "swiper/css";
import "swiper/css/pagination";

import img1 from "../Image/2175eca1d48b5605.webp";
import img2 from "../Image/8e9028276404d9d5.webp";
import img3 from "../Image/e7dcd564dcff5707.webp";

// Brands
import nikeImg from "../Image/download (1).jpeg";
import adidasImg from "../Image/download (1).png";
import pumaImg from "../Image/download (2).jpeg";
import reebokImg from "../Image/download (2).png";
import appleImg from "../Image/download.jpeg";
import samsungImg from "../Image/download.png";

const Home = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const heroImages = [img1, img2, img3];

  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.log("API Error:", err));
  }, []);

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm)
  );

  const electronicsProducts = products.filter(
    (p) => p.category === "electronics"
  );

  const brands = [
    { name: "Nike", image: nikeImg },
    { name: "Adidas", image: adidasImg },
    { name: "Puma", image: pumaImg },
    { name: "Reebok", image: reebokImg },
    { name: "Apple", image: appleImg },
    { name: "Samsung", image: samsungImg },
  ];

  const handleViewDetails = (product) =>
    navigate(`/product/${product.id}`, { state: { product } });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6">

      {/* ✅ Hero Slider - Centered, No Right Shift */}
      <div className="w-full mx-auto overflow-hidden rounded-xl shadow-lg mb-24">
        <Swiper
          slidesPerView={1}
          pagination={{ clickable: true }}
          modules={[Pagination, Autoplay]}
          loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
        >
          {heroImages.map((img, index) => (
            <SwiperSlide key={index}>
              <div className="relative">
                <img
                  src={img}
                  alt={`Slide ${index}`}
                  className="w-full h-64 md:h-80 lg:h-96 object-cover"
                />
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded font-bold">
                  50% OFF
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ✅ Trending Products */}
      <div className="mb-24">
        <h2 className="text-2xl font-bold mb-4">{t("trending")}</h2>
        <Swiper
          slidesPerView={4}
          spaceBetween={30}
          loop={filteredProducts.length > 4}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[Pagination, Autoplay]}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
        >
          {filteredProducts.map((p) => (
            <SwiperSlide
              key={p.id}
              className="flex justify-center cursor-pointer"
              onClick={() => handleViewDetails(p)}
            >
              <div className="w-40 h-40 border rounded-xl shadow flex items-center justify-center hover:scale-105 transition-transform bg-white">
                <img
                  src={p.image}
                  alt={p.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ✅ Best Electronics Deals */}
      <div className="mb-24">
        <h2 className="text-2xl font-bold mb-4">{t("bestDeals")}</h2>
        <Swiper
          slidesPerView={4}
          spaceBetween={30}
          loop={electronicsProducts.length > 4}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[Pagination, Autoplay]}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
        >
          {electronicsProducts
            .filter((p) => p.title.toLowerCase().includes(searchTerm))
            .map((p) => (
              <SwiperSlide
                key={p.id}
                className="flex justify-center cursor-pointer"
                onClick={() => handleViewDetails(p)}
              >
                <div className="w-48 h-56 border rounded-xl shadow relative hover:scale-105 transition-transform bg-white">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-40 object-contain"
                  />
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded font-bold text-sm">
                    50% OFF
                  </div>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm mb-1">{p.title}</h3>
                    <p className="text-green-700 font-bold">{t("price")}: ${p.price}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
        </Swiper>
      </div>

      {/* ✅ Featured Brands */}
      <div className="mb-24">
        <h2 className="text-2xl font-bold mb-4">{t("featuredBrands")}</h2>
        <Swiper
          slidesPerView={4}
          spaceBetween={20}
          loop={true}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[Pagination, Autoplay]}
          breakpoints={{
            320: { slidesPerView: 2 },
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
        >
          {brands.map((brand, index) => (
            <SwiperSlide key={index} className="flex justify-center">
              <div className="w-36 h-24 border rounded-xl shadow flex items-center justify-center hover:scale-105 transition-transform bg-white">
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ✅ Filtered Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded-xl p-4 flex flex-col justify-between shadow hover:shadow-xl transition bg-white"
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
              <p className="font-bold text-green-700 mb-2">{t("price")}: ${product.price}</p>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full text-gray-600">No products found!</p>
        )}
      </div>
    </div>
  );
};

export default Home;