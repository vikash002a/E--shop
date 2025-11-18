import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { useLocation, useNavigate } from "react-router-dom";

const ProductDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cartItems, addToCart, updateCartItem } = useContext(CartContext);

  const [product, setProduct] = useState(state?.product || null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (!product) return;

    const existingItem = cartItems.find((item) => item.id === product.id);
    setQuantity(existingItem ? existingItem.quantity : 1);

    fetch(`https://fakestoreapi.com/products`)
      .then((res) => res.json())
      .then((data) => {
        const related = data.filter(
          (p) => p.category === product.category && p.id !== product.id
        );
        setRelatedProducts(related);
      });
  }, [product, cartItems]);

  if (!product) return <p className="text-center mt-10">Product not found!</p>;

  const handleQuantityChange = (val) => {
    const newQty = quantity + val;
    if (newQty < 1) return;
    setQuantity(newQty);

    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      updateCartItem(product.id, newQty);
    }
  };

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
  };

  const handleBuyNow = () => {
    navigate("/checkout", { state: { product: { ...product, quantity } } });
  };

  const handleRelatedClick = (p) => {
    setProduct(p);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10 mt-10 p-4">
      <div className="flex flex-col md:flex-row gap-10 md:gap-x-[6em]">
        <div className="md:w-1/2 flex flex-col gap-2">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-96 object-contain rounded shadow"
          />
        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          <h2 className="text-3xl font-bold">{product.title}</h2>
          <p className="text-green-700 font-bold text-2xl">${product.price}</p>
          <p className="text-gray-600">{product.description}</p>

          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition"
            >
              -
            </button>
            <span className="font-semibold">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition"
            >
              +
            </button>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
            >
              Buy Now
            </button>
          </div>

          <details className="border rounded p-2">
            <summary className="font-semibold cursor-pointer">Delivery & Returns</summary>
            <p className="mt-2 text-gray-600">
              Free delivery within 5-7 business days. Easy returns within 14 days.
            </p>
          </details>

          <details className="border rounded p-2">
            <summary className="font-semibold cursor-pointer">Reviews (0)</summary>
            <p className="mt-2 text-gray-600">No reviews yet.</p>
          </details>

          <details className="border rounded p-2">
            <summary className="font-semibold cursor-pointer">Warranty & Support</summary>
            <p className="mt-2 text-gray-600">
              1-year manufacturer warranty. 24/7 customer support available via email or call.
            </p>
          </details>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-bold mb-4">Related Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                className="border rounded-lg p-4 flex flex-col justify-between shadow hover:shadow-xl cursor-pointer"
                onClick={() => handleRelatedClick(p)}
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-40 object-contain mx-auto mb-2"
                />
                <h4 className="font-semibold text-lg">{p.title}</h4>
                <p className="text-green-700 font-bold">${p.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
