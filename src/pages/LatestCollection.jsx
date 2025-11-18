// src/pages/LatestCollection.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiTrash2, FiSearch, FiChevronDown } from "react-icons/fi";
import toast from "react-hot-toast";

/**
 LatestCollection.jsx
 - reads/writes from localStorage key: "products"
 - shows products in responsive grid (hover zoom)
 - search, sort, category filter
 - Edit modal (image as URL)
 - Delete with confirmation
 - Persists all changes to localStorage so refresh safe
*/

export default function LatestCollection() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [category, setCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(12);

  // Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", category: "", image: "" });

  // load once
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("products")) || [];
      setProducts(saved);
    } catch {
      setProducts([]);
    }
  }, []);

  // persist whenever products change
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const categories = useMemo(() => {
    const s = new Set(products.map((p) => p.category || "Uncategorized"));
    return ["all", ...Array.from(s)];
  }, [products]);

  // filtered + sorted
  const filtered = useMemo(() => {
    let list = [...products];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          (p.name || p.title || "").toString().toLowerCase().includes(q) ||
          (p.category || "").toString().toLowerCase().includes(q)
      );
    }
    if (category !== "all") {
      list = list.filter((p) => (p.category || "Uncategorized") === category);
    }
    if (sort === "latest") list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    else if (sort === "price_asc") list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    else if (sort === "price_desc") list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    return list;
  }, [products, query, sort, category]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  // open edit modal for a product
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || p.title || "",
      price: p.price || p.salePrice || "",
      category: p.category || "Uncategorized",
      image: p.image || (p.images && p.images[0]) || "",
    });
    setIsModalOpen(true);
  };

  // save edit
  const saveEdit = () => {
    if (!form.name.trim() || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    setProducts((prev) =>
      prev.map((x) =>
        `${x.id}` === `${editing.id}`
          ? {
              ...x,
              name: form.name.trim(),
              title: form.name.trim(),
              price: Number(form.price),
              category: form.category.trim() || "Uncategorized",
              image: form.image.trim(),
            }
          : x
      )
    );
    toast.success("Product updated");
    setIsModalOpen(false);
    setEditing(null);
    setForm({ name: "", price: "", category: "", image: "" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setProducts((prev) => prev.filter((p) => `${p.id}` !== `${id}`));
    toast.success("Product deleted");
  };

  // If no products at all
  if (products.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Latest Collection</h2>
        <div className="bg-white p-6 rounded shadow text-center text-gray-600">
          No products yet. Add products from Admin → Products (they will be shown here).
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Latest Collection</h2>
          <p className="text-sm text-gray-500">Products added by admin (persistent via localStorage).</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-10 pr-3 py-2 rounded-lg border w-64"
            />
          </div>

          <div className="relative">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="pr-8 pl-3 py-2 rounded-lg border">
              <option value="latest">Latest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="pr-8 pl-3 py-2 rounded-lg border">
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visible.map((p) => (
          <article key={p.id} className="bg-white rounded-xl shadow overflow-hidden group">
            <div className="relative h-48 bg-gray-100 overflow-hidden">
              <img
                src={p.image || "https://via.placeholder.com/400x300?text=No+Image"}
                alt={p.name || p.title}
                className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button onClick={() => openEdit(p)} className="bg-white p-2 rounded-full shadow text-gray-700 hover:bg-gray-50" title="Edit">
                  <FiEdit2 />
                </button>
                <button onClick={() => handleDelete(p.id)} className="bg-white p-2 rounded-full shadow text-red-600 hover:bg-gray-50" title="Delete">
                  <FiTrash2 />
                </button>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-medium text-lg truncate">{p.name || p.title}</h3>
              <p className="text-sm text-gray-500 mt-1 truncate">{p.category}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-indigo-600 font-semibold">₹{Number(p.price || 0).toFixed(2)}</div>
                <div className="text-xs text-gray-400">{new Date(p.createdAt || p.dateAdded || Date.now()).toLocaleDateString()}</div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button onClick={() => setVisibleCount((c) => c + 12)} className="px-4 py-2 rounded-lg border">
            Load more
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-3">Edit Product</h3>

            <div className="grid grid-cols-1 gap-3">
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name" className="border px-3 py-2 rounded" />
              <input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} type="number" placeholder="Price" className="border px-3 py-2 rounded" />
              <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Category" className="border px-3 py-2 rounded" />
              <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="Image URL" className="border px-3 py-2 rounded" />

              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => { setIsModalOpen(false); setEditing(null); setForm({ name: "", price: "", category: "", image: "" }); }} className="px-4 py-2 rounded border">
                  Cancel
                </button>
                <button onClick={saveEdit} className="px-4 py-2 rounded bg-indigo-600 text-white">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
