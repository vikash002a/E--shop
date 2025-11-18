import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const [showAlert, setShowAlert] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000); // 2 seconds me alert disappear
  };

  const handleBuyNow = () => {
    addToCart(product);
    alert(`Purchased ${product.title} successfully!`);
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col items-center shadow-lg">
      {showAlert && (
        <div className="bg-green-500 text-white px-4 py-2 mb-2 rounded absolute top-4">
          {product.title} added to cart!
        </div>
      )}

      <img
        src={product.image}
        alt={product.title}
        className="h-40 object-contain mb-2"
      />
      <h2 className="font-semibold text-center">{product.title}</h2>
      <p className="font-bold mt-1">${product.price}</p>

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleAddToCart}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
        >
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
