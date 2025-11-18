// src/pages/AdminPage.jsx
import React, { useEffect, useState } from "react";
 // import at top
import CategoriesPage from "./CategoriesPage";
import AttributesPage from "./AttributesPage";
// ...
import CouponsPage from "../pages/CouponsPage"; // <-- ये import जोड़ना है
import LatestCollection from "./LatestCollection";

import CustomersPage from "./CustomersPage";
import OurStaffPage from "./OurStaffPage";
import SettingsPage from "./SettingsPage";
import InternationalPage from "./InternationalPage";
import OrdersPage from "./OrdersPage";

import {
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import {
  FaBoxes,
  FaTags,
  FaCogs,
  FaTicketAlt,
  FaClock,
  FaEye,
  FaEdit,
  FaTrash,
  FaUpload,
  FaDownload,
} from "react-icons/fa";
  import InvoicePrint from "../components/InvoicePrint"; // adjust path if needed
import Categories from "./CategoriesPage";
import { FaCalendarDay, FaCalendarMinus, FaCalendarAlt, FaCalendarCheck, FaMoneyBillWave } from "react-icons/fa";
import { FaClipboardList, FaHourglassHalf, FaTools, FaCheckCircle } from "react-icons/fa";


// localStorage keys
const LOCAL_ORDERS_KEY = "hood";
const LOCAL_PRODUCTS_KEY = "products";

// helper to create default augmented product object
const fromApiProduct = (ap) => {
  const price = Number(ap.price || 0);
  return {
    id: ap.id !== undefined ? `${ap.id}` : `P${Date.now()}`,
    title: ap.title || ap.name || "Untitled Product",
    category: ap.category || "Uncategorized",
    price,
    salePrice: price, // default: sale same
    stock: Math.floor(10 + Math.random() * 41), // 10-50
    status: "Active",
    published: true,
    image: ap.image || "",
    sku: ap.sku || "",
    description: ap.description || "",
    slug: ap.slug || "",
    tags: ap.tags || [],
    latest: false,
    dateAdded: new Date().toISOString(), 
  };
};

const AdminPage = () => {
  // main states
  const [activeSection, setActiveSection] = useState(localStorage.getItem("activeSection") || "dashboard");
  const [showCatalog, setShowCatalog] = useState(false);

  // orders (kept simple)
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // products
  const [products, setProducts] = useState([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null => add
  const [viewProduct, setViewProduct] = useState(null);

  // product filters & selection
  const [productSearch, setProductSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [selectedForBulk, setSelectedForBulk] = useState(new Set());
  // -------- DARK MODE STATE --------

  // load products from localStorage or API on mount
  useEffect(() => {
    const local = JSON.parse(localStorage.getItem(LOCAL_PRODUCTS_KEY) || "null");
    if (local && Array.isArray(local) && local.length > 0) {
      setProducts(local);
      return;
    }
    // fetch from fakestoreapi (your existing client code used this)
    fetch("https://fakestoreapi.com/products")
      .then((r) => r.json())
      .then((data) => {
        const aug = (data || []).map((ap) => fromApiProduct(ap));
        setProducts(aug);
        localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(aug));
      })
      .catch((err) => {
        console.error("Products API error:", err);
        setProducts([]);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("activeSection", activeSection);
  }, [activeSection]);

  useEffect(() => {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  // orders minimal loading from localStorage to keep dashboard working
  useEffect(() => {
    const localOrders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || "[]");
    setOrders(localOrders);
    calculateStats(localOrders);
    generateWeeklyData(localOrders);
  }, []);

  // ---------- Orders helpers ----------
  const calculateStats = (ordersArr = []) => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const thisMonth = today.getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const thisYear = today.getFullYear();
    const lastMonthYear = lastMonth === 11 ? thisYear - 1 : thisYear;

    let todayCount = 0,
      yesterdayCount = 0,
      thisMonthCount = 0,
      lastMonthCount = 0,
      totalSales = 0,
      totalOrders = ordersArr.length,
      pending = 0,
      processing = 0,
      delivered = 0;

    ordersArr.forEach((order) => {
      const orderDate = new Date(order.date || order.createdAt);
      if (isNaN(orderDate)) return;
      const orderDateStr = orderDate.toISOString().slice(0, 10);
      totalSales += Number(order.totalPrice) || 0;
      if (orderDateStr === todayStr) todayCount++;
      if (orderDateStr === yesterdayStr) yesterdayCount++;
      if (orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear) thisMonthCount++;
      if (orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear) lastMonthCount++;
      const s = (order.status || "pending").toLowerCase();
      if (s === "pending") pending++;
      else if (s === "processing" || s === "shipped") processing++;
      else if (s === "delivered") delivered++;
    });

    setStats({ today: todayCount, yesterday: yesterdayCount, thisMonth: thisMonthCount, lastMonth: lastMonthCount, totalSales, totalOrders, pending, processing, delivered });
  };
//pie chart

  const generateWeeklyData = (ordersArr = []) => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayOrders = (ordersArr || []).filter((order) => {
        const orderDate = new Date(order.date || order.createdAt);
        return orderDate.toISOString().slice(0, 10) === dateStr;
      });
      const total = dayOrders.reduce((s, o) => s + (Number(o.totalPrice) || 0), 0);
      days.push({ day: dayName, date: dateStr, sales: total, orders: dayOrders.length });
    }
    setWeeklyData(days);
  };

  const handleStatusChange = (orderId, newStatus) => {
    const updated = orders.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
    calculateStats(updated);
    generateWeeklyData(updated);
  };

  // ---------- Products CRUD & helpers ----------

  const saveProduct = async (product) => {
    // product: full object from modal
    // try to send to API (fake API may not accept writes). Regardless, update local state.
    try {
      // If product came from fakestore API (numeric id) and editing, we attempt PUT; else POST
      const isEdit = products.some((p) => `${p.id}` === `${product.id}`);
      if (isEdit) {
        // Update local optimistically
        setProducts((prev) => prev.map((p) => (`${p.id}` === `${product.id}` ? product : p)));
        // try API PUT (may fail)
        try {
          await fetch(`https://fakestoreapi.com/products/${product.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product),
          });
        } catch (err) {
          // ignore API error but keep local update
          console.warn("API PUT failed (ignored):", err);
        }
      } else {
        // New product
        // optimistic local add
        setProducts((prev) => [product, ...prev]);
        try {
          await fetch("https://fakestoreapi.com/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product),
          });
        } catch (err) {
          console.warn("API POST failed (ignored):", err);
        }
      }
    } catch (err) {
      console.error("Save product error:", err);
    } finally {
      // close modal handled by caller
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    // optimistic local delete
    setProducts((prev) => prev.filter((p) => `${p.id}` !== `${id}`));
    // attempt API delete (may fail)
    try {
      await fetch(`https://fakestoreapi.com/products/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("API DELETE failed (ignored):", err);
    }
  };

  const bulkDelete = () => {
    if (selectedForBulk.size === 0) return alert("No products selected");
    if (!window.confirm(`Delete ${selectedForBulk.size} products?`)) return;
    setProducts((prev) => prev.filter((p) => !selectedForBulk.has(`${p.id}`)));
    setSelectedForBulk(new Set());
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const openEditProduct = (p) => {
    setEditingProduct(p);
    setProductModalOpen(true);
  };

  const toggleSelect = (id) => {
    const s = new Set(selectedForBulk);
    if (s.has(`${id}`)) s.delete(`${id}`);
    else s.add(`${id}`);
    setSelectedForBulk(s);
  };

  const toggleProductStatus = (id) => {
    setProducts((prev) => prev.map((p) => (`${p.id}` === `${id}` ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p)));
  };

  const togglePublished = (id) => {
    setProducts((prev) => prev.map((p) => (`${p.id}` === `${id}` ? { ...p, published: !p.published } : p)));
  };

  // filters
  const filteredProducts = products
    .filter((p) => (productSearch ? (p.title || "").toLowerCase().includes(productSearch.toLowerCase()) : true))
    .filter((p) => (filterCategory ? p.category === filterCategory : true))
    .filter((p) => {
      const min = Number(priceFilter.min || 0);
      const max = Number(priceFilter.max || Infinity);
      const price = Number(p.price || 0);
      return price >= min && price <= max;
    });

  const resetProductFilters = () => {
    setProductSearch("");
    setFilterCategory("");
    setPriceFilter({ min: "", max: "" });
    setSelectedForBulk(new Set());
  };

  const exportCSV = () => {
    if (!products.length) return alert("No products to export");
    const headers = ["id","title","category","price","salePrice","stock","status","published","sku","image","description","dateAdded","slug","tags","latest"];
    const rows = products.map((p) => headers.map((h) => JSON.stringify(p[h] || "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

//pie chart 

//box size 
const DashboardCard = ({ title, value, icon: Icon, className, size = "large" }) => {
  const isSmall = size === "small";

  return (
    <div
      className={`${
        isSmall ? "p-5 rounded-xl" : "p-8 rounded-2xl"
      } shadow-md flex items-center gap-4 ${className}`}
    >
      {Icon && (
        <div
          className={`flex items-center justify-center ${
            isSmall ? "w-10 h-10 text-2xl rounded-lg" : "w-16 h-16 text-4xl rounded-2xl"
          } bg-white/20`}
        >
          <Icon />
        </div>
      )}

      <div>
        <h3 className={`${isSmall ? "text-sm" : "text-lg"} font-medium opacity-80`}>
          {title}
        </h3>
        <p className={`${isSmall ? "text-2xl" : "text-4xl"} font-bold leading-tight`}>
          {value}
        </p>
      </div>
    </div>
  );
};


  const importCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
      if (!headerLine) return alert("CSV empty or malformed");
      const headers = headerLine.split(",").map((h) => h.trim());
      const imported = lines.map((line) => {
        const cols = line.split(",");
        const obj = {};
        headers.forEach((h, i) => {
          let val = cols[i] || "";
          try { val = JSON.parse(val); } catch (err) {}
          obj[h] = val;
        });
        if (!obj.id) obj.id = `P${Date.now()}${Math.floor(Math.random()*1000)}`;
        // ensure numeric fields
        obj.price = Number(obj.price || 0);
        obj.salePrice = Number(obj.salePrice || obj.price || 0);
        obj.stock = Number(obj.stock || 0);
        return { ...fromApiProduct({}), ...obj };
      });
      setProducts((prev) => [...imported, ...prev]);
      alert(`Imported ${imported.length} products`);
    };
    reader.readAsText(file);
  };

  const categories = Array.from(new Set(products.map((p) => p.category || "Uncategorized")));

  // invoice helpers
  const openInvoice = (order) => setSelectedOrder(order);
  const closeInvoice = () => setSelectedOrder(null);

  // ---------- RENDER ----------
  return (
  
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
     <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed top-0 left-0 overflow-y-auto">
<div className="p-4 text-2xl font-bold text-yellow-400 border-b border-gray-700">Admin Panel</div>
<nav className="flex-1 p-4 space-y-2">
<button onClick={() => { setShowCatalog(false); setActiveSection("dashboard"); localStorage.setItem("activeSection","dashboard"); }} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection==="dashboard" ? "bg-yellow-400 text-black":"hover:bg-gray-800"}`}>📊 Dashboard</button>


<div className="mt-4">
 <button
  onClick={() => setShowCatalog(!showCatalog)}
  className="w-full text-left px-4 py-2 rounded-lg transition hover:bg-gray-800 flex items-center justify-between"
>
  <span>📂 Catalog</span>
  <span className="text-sm">{showCatalog ? "▲" : "▼"}</span>
</button>

{showCatalog && (
  <div className="mt-2 bg-gray-800/40 rounded-md p-2">
    <ul className="space-y-2">
      <li onClick={() => setActiveSection("products")} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"><FaBoxes /> <span>Products</span></li>

      <li onClick={() => setActiveSection("categories")} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"><FaTags /> <span>Categories</span></li>

      <li onClick={() => setActiveSection("attributes")} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"><FaCogs /> <span>Attributes</span></li>

      <li onClick={() => setActiveSection("coupons")} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"><FaTicketAlt /> <span>Coupons</span></li>

      <li onClick={() => setActiveSection("latest")} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"><FaClock /> <span>Latest Collection</span></li>
    </ul>
  </div>
)}


</div>
<button
  onClick={() => {
    setShowCatalog(false);
    setActiveSection("customers");
    localStorage.setItem("activeSection", "customers");
  }}
  className={`w-full text-left px-4 py-2 rounded-lg transition ${
    activeSection === "customers"
      ? "bg-yellow-400 text-black"
      : "hover:bg-gray-800"
  }`}
>
  👥 Customers
</button>
<button onClick={() => { setShowCatalog(false); setActiveSection("orders"); localStorage.setItem("activeSection","orders"); }} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection==="orders" ? "bg-yellow-400 text-black":"hover:bg-gray-800"}`}>📦 Orders</button>

<button
  onClick={() => {
    setShowCatalog(false);
    setActiveSection("ourstaff");
    localStorage.setItem("activeSection", "ourstaff");
  }}
  className={`w-full text-left px-4 py-2 rounded-lg transition ${
    activeSection === "ourstaff"
      ? "bg-yellow-400 text-black"
      : "hover:bg-gray-800"
  }`}
>
  👥 Our Staff
</button>
<button
  onClick={() => {
    setShowCatalog(false);
    setActiveSection("settings");
    localStorage.setItem("activeSection", "settings");
  }}
  className={`w-full text-left px-4 py-2 rounded-lg transition ${
    activeSection === "settings"
      ? "bg-yellow-400 text-black"
      : "hover:bg-gray-800"
  }`}
>
  ⚙️ Settings
</button>
<button
  onClick={() => {
    setShowCatalog(false);
    setActiveSection("international");
    localStorage.setItem("activeSection", "international");
  }}
  className={`w-full text-left px-4 py-2 rounded-lg transition ${
    activeSection === "international"
      ? "bg-yellow-400 text-black"
      : "hover:bg-gray-800"
  }`}
>
  🌍 International
</button>

</nav>

</aside>


      {/* Main */}
   <main className="flex-1 p-8 ml-64 ">

      <div className="max-w-7xl mx-auto"></div>
        {/* Dashboard */}
        {activeSection === "dashboard" && (
          <>
            <h1 className="text-2xl font-bold mb-6">📊 Dashboard Overview</h1>
<div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
  <DashboardCard title="Today Orders" value={stats.today} icon={FaCalendarDay} className="bg-blue-500 text-white" />
  <DashboardCard title="Yesterday Orders" value={stats.yesterday} icon={FaCalendarMinus} className="bg-indigo-500 text-white" />
  <DashboardCard title="This Month" value={stats.thisMonth} icon={FaCalendarAlt} className="bg-purple-500 text-white" />
  <DashboardCard title="Last Month" value={stats.lastMonth} icon={FaCalendarCheck} className="bg-pink-500 text-white" />
  <DashboardCard title="All-Time Sales" value={`₹${Number(stats.totalSales || 0).toFixed(2)}`} icon={FaMoneyBillWave} className="bg-green-600 text-white" />
</div>

<div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
  <DashboardCard title="Total Orders" value={stats.totalOrders} icon={FaClipboardList} className="bg-gray-700 text-white" size="small" />
  <DashboardCard title="Orders Pending" value={stats.pending} icon={FaHourglassHalf} className="bg-yellow-500 text-black" size="small" />
  <DashboardCard title="Orders Processing" value={stats.processing} icon={FaTools} className="bg-blue-400 text-white" size="small" />
  <DashboardCard title="Orders Delivered" value={stats.delivered} icon={FaCheckCircle} className="bg-green-500 text-white" size="small" />
</div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="md:col-span-2 bg-white p-6 shadow rounded-lg">
                <h2 className="text-xl font-semibold mb-4">📈 Weekly Sales Chart</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" name="Sales (₹)" />
                    <Line dataKey="orders" stroke="#f97316" name="Orders" />
                  </ComposedChart>
                </ResponsiveContainer>

                <div className="mt-4 text-sm text-gray-600"><strong>Weekly data:</strong></div>
              </div>

              <div className="bg-white p-6 shadow rounded-lg">
                <h2 className="text-xl font-semibold mb-4">🏆 Best Selling Products</h2>
                <ul className="space-y-2">
                  {getBestSellingProducts(orders).map((p, idx) => (
                    <li key={idx} className="flex justify-between"><span>{p.name}</span><span className="font-semibold">{p.count} sold</span></li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white p-6 shadow rounded-lg">
              <h2 className="text-xl font-semibold mb-4">🧾 Recent Orders</h2>
              <table className="w-full border text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-2">INVOICE NO</th>
                    <th className="border p-2">ORDER TIME</th>
                    <th className="border p-2">CUSTOMER NAME</th>
                    <th className="border p-2">METHOD</th>
                    <th className="border p-2">AMOUNT</th>
                    <th className="border p-2">STATUS</th>
                    <th className="border p-2">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(-10).reverse().map((order,i) => (
                    <tr key={i} className="text-center">
                      <td className="border p-2">{order.orderId || `INV-${1000+i}`}</td>
                      <td className="border p-2">{new Date(order.date).toLocaleString()}</td>
                      <td className="border p-2">{order.fullName || "Unknown"}</td>
                      <td className="border p-2">{order.paymentMethod || "N/A"}</td>
                      <td className="border p-2">₹{Number(order.totalPrice||0).toFixed(2)}</td>
                      <td className="border p-2">
                        <span className={`px-2 py-1 rounded ${ (order.status||"Pending").toLowerCase() === "delivered" ? "bg-green-100 text-green-800" : (order.status||"Pending").toLowerCase() === "cancelled" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{order.status||"Pending"}</span>
                      </td>
                      <td className="border p-2">
                        <select className="border rounded px-2 py-1 text-sm mr-2" value={order.status||"Pending"} onChange={(e) => handleStatusChange(order.orderId, e.target.value)}>
                          <option>Pending</option><option>Processing</option><option>Delivered</option><option>Cancelled</option>
                        </select>
                        <div className="inline-block relative"><button onClick={() => openInvoice(order)} className="ml-2 text-blue-600 underline text-sm">View</button></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}


        

        {/* PRODUCTS page */}
        {activeSection === "products" && (
          <div className="bg-white p-6 shadow rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Products</h2>
              <div className="flex items-center gap-2">
                <button onClick={exportCSV} title="Export CSV" className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-2"><FaDownload /> Export</button>
                <label title="Import CSV" className="bg-blue-600 text-white px-3 py-1 rounded cursor-pointer flex items-center gap-2">
                  <FaUpload /> Import
                  <input type="file" accept=".csv" onChange={(e) => e.target.files[0] && importCSV(e.target.files[0])} className="hidden" />
                </label>
                <button onClick={openAddProduct} className="bg-purple-600 text-white px-3 py-1 rounded">+ Add Product</button>
                <button onClick={bulkDelete} className="bg-red-600 text-white px-3 py-1 rounded">Bulk Delete</button>
              </div>
            </div>

            {/* filters */}
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} type="text" placeholder="Search product..." className="border px-3 py-2 rounded flex-1 min-w-[200px]" />

              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border px-3 py-2 rounded">
                <option value="">All Categories</option>
                {categories.map((c,i) => <option key={i} value={c}>{c}</option>)}
              </select>

              <input value={priceFilter.min} onChange={(e) => setPriceFilter(p => ({...p, min: e.target.value}))} type="number" placeholder="Min price" className="border px-3 py-2 rounded w-32" />
              <input value={priceFilter.max} onChange={(e) => setPriceFilter(p => ({...p, max: e.target.value}))} type="number" placeholder="Max price" className="border px-3 py-2 rounded w-32" />

              <button onClick={resetProductFilters} className="bg-gray-600 text-white px-3 py-2 rounded">Reset</button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-3 border"><input type="checkbox" onChange={(e)=>{ if(e.target.checked) setSelectedForBulk(new Set(products.map(p=> `${p.id}`))); else setSelectedForBulk(new Set()); }} checked={selectedForBulk.size === products.length && products.length>0} /></th>
                    <th className="p-3 border">PRODUCTNAME</th>
                    <th className="p-3 border">CATEGORY</th>
                    <th className="p-3 border">PRICE</th>
                    <th className="p-3 border">SALE PRICE</th>
                    <th className="p-3 border">STOCK</th>
                    <th className="p-3 border">STATUS</th>
                    <th className="p-3 border">VIEW</th>
                    <th className="p-3 border">PUBLISHED</th>
                    <th className="p-3 border">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-3 border text-center"><input type="checkbox" onChange={()=>toggleSelect(p.id)} checked={selectedForBulk.has(`${p.id}`)} /></td>

                      <td className="p-3 border flex items-center gap-3">
                        {p.image ? <img src={p.image} alt={p.title} className="h-12 w-12 object-cover rounded" /> : <div className="h-12 w-12 bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Image</div>}
                        <div>
                          <div className="font-medium">{p.title}</div>
                          <div className="text-xs text-gray-500">SKU: {p.sku || "-"}</div>
                        </div>
                      </td>

                      <td className="p-3 border">{p.category}</td>
                      <td className="p-3 border">₹{Number(p.price||0).toFixed(2)}</td>
                      <td className="p-3 border">₹{Number(p.salePrice||0).toFixed(2)}</td>
                      <td className="p-3 border">{p.stock}</td>

                      <td className="p-3 border">
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={p.status === "Active"} onChange={() => toggleProductStatus(p.id)} className="sr-only" />
                          <span className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${p.status==="Active" ? "bg-green-500" : "bg-gray-300"}`}>
                            <span className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${p.status==="Active" ? "translate-x-4" : "translate-x-0"}`} />
                          </span>
                          <span className="ml-2 text-xs">{p.status}</span>
                        </label>
                      </td>

                      <td className="p-3 border">
                        <button onClick={() => setViewProduct(p)} className="text-blue-600 underline flex items-center gap-2"><FaEye /> View</button>
                      </td>

                      <td className="p-3 border">
                        <button onClick={() => togglePublished(p.id)} className={`px-2 py-1 rounded text-xs ${p.published ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {p.published ? "Yes" : "No"}
                        </button>
                      </td>

                      <td className="p-3 border">
                        <button onClick={() => openEditProduct(p)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 inline-flex items-center gap-2"><FaEdit /> Edit</button>
                        <button onClick={() => deleteProduct(p.id)} className="bg-red-500 text-white px-3 py-1 rounded inline-flex items-center gap-2"><FaTrash /> Delete</button>
                      </td>
                    </tr>
                  ))}

                  {filteredProducts.length === 0 && (
                    <tr><td colSpan={10} className="p-6 text-center text-gray-500">No products found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* placeholders */}
       {activeSection === "categories" && <Categories />}

      {activeSection === "coupons" && <CouponsPage />}
     {activeSection === "attributes" && <AttributesPage />}   
       {activeSection === "latest" && <LatestCollection />}
      {activeSection === "customers" && <CustomersPage />}
     {activeSection === "ourstaff" && <OurStaffPage />}
     {activeSection === "settings" && <SettingsPage />}
     {activeSection === "international" && <InternationalPage />}
     {activeSection === "orders" && <OrdersPage />}

       

      {/* Invoice modal */}
{selectedOrder && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-[900px] max-h-[90vh] overflow-auto">
      <InvoicePrint order={selectedOrder} onClose={closeInvoice} />
    </div>
  </div>
)}

        {/* View modal */}
        {viewProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[720px] max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Preview: {viewProduct.title}</h3>
                <button onClick={() => setViewProduct(null)} className="text-red-600">Close</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  {viewProduct.image ? <img src={viewProduct.image} alt={viewProduct.title} className="w-full object-cover rounded" /> : <div className="h-48 bg-gray-100 flex items-center justify-center">No Image</div>}
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-xl font-semibold">{viewProduct.title}</h4>
                  <p className="text-sm text-gray-500 mb-2">SKU: {viewProduct.sku || "-"}</p>
                  <p className="mb-2">{viewProduct.description}</p>
                  <p className="mb-1">Category: <strong>{viewProduct.category}</strong></p>
                  <p className="mb-1">Price: <strong>₹{Number(viewProduct.price||0).toFixed(2)}</strong></p>
                  <p className="mb-1">Sale Price: <strong>₹{Number(viewProduct.salePrice||0).toFixed(2)}</strong></p>
                  <p className="mb-1">Stock: <strong>{viewProduct.stock}</strong></p>
                  <p className="mb-1">Status: <strong>{viewProduct.status}</strong></p>
                  <p className="mb-1">Published: <strong>{viewProduct.published ? "Yes" : "No"}</strong></p>
                  <p className="mb-1">Tags: <strong>{(viewProduct.tags||[]).join(", ")}</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Product Modal */}
        {productModalOpen && (
          <ProductModal
            product={editingProduct}
            onClose={() => { setProductModalOpen(false); setEditingProduct(null); }}
            onSave={async (payload) => { await saveProduct(payload); setProductModalOpen(false); setEditingProduct(null); }}
            categories={categories}
          />
        )}
      </main>
    </div>
  );
};

// ProductModal component (Add + Edit)
const ProductModal = ({ product, onClose, onSave, categories = [] }) => {
  const blank = {
    id: product?.id || `P${Date.now()}`,
    title: product?.title || "",
    description: product?.description || "",
    images: product?.images || [], // store names or URLs
    sku: product?.sku || "",
    latest: product?.latest || false,
    barcode: product?.barcode || "",
    category: product?.category || "Uncategorized",
    price: product?.price || 0,
    salePrice: product?.salePrice || product?.price || 0,
    qty: product?.stock || 0,
    slug: product?.slug || "",
    tags: product?.tags ? [...product.tags] : [],
    status: product?.status || "Active",
    published: product?.published !== undefined ? product.published : true,
  };

  const [form, setForm] = useState(blank);
  const [tagInput, setTagInput] = useState("");
  const [saleMode, setSaleMode] = useState("same"); // same | discounted | manual

  useEffect(() => {
    setForm({
      id: product?.id || `P${Date.now()}`,
      title: product?.title || "",
      description: product?.description || "",
      images: product?.images || (product?.image ? [product.image] : []),
      sku: product?.sku || "",
      latest: product?.latest || false,
      barcode: product?.barcode || "",
      category: product?.category || "Uncategorized",
      price: product?.price || 0,
      salePrice: product?.salePrice || product?.price || 0,
      qty: product?.stock || product?.qty || 0,
      slug: product?.slug || "",
      tags: product?.tags ? [...product.tags] : [],
      status: product?.status || "Active",
      published: product?.published !== undefined ? product.published : true,
    });
    setSaleMode("same");
    setTagInput("");
  }, [product]);

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const files = Array.from(e.target.files || []);
    // store file names (or you can upload to cloud)
    setForm((f) => ({ ...f, images: [...(f.images || []), ...files.map((x) => x.name)] }));
  };

  const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const addTag = () => {
    if (!tagInput.trim()) return;
    setForm((f) => ({ ...f, tags: [...(f.tags || []), tagInput.trim()] }));
    setTagInput("");
  };

  const removeTag = (i) => setForm((f) => ({ ...f, tags: f.tags.filter((_, idx) => idx !== i) }));

  const applySaleMode = () => {
    if (saleMode === "same") {
      setForm((f) => ({ ...f, salePrice: Number(f.price || 0) }));
    } else if (saleMode === "discounted") {
      setForm((f) => ({ ...f, salePrice: +(Number(f.price || 0) * 0.8).toFixed(2) }));
    } // manual leaves as-is
  };

  useEffect(() => {
    applySaleMode();
   
  }, [saleMode]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title) return alert("Product title required");
    // normalize payload to expected fields
    const payload = {
      id: form.id,
      title: form.title,
      description: form.description,
      image: form.images && form.images.length ? (typeof form.images[0] === "string" ? form.images[0] : form.images[0].name) : "",
      images: form.images,
      sku: form.sku,
      latest: !!form.latest,
      barcode: form.barcode,
      category: form.category,
      price: Number(form.price || 0),
      salePrice: Number(form.salePrice || form.price || 0),
      stock: Number(form.qty || 0),
      slug: form.slug,
      tags: form.tags || [],
      status: form.status || "Active",
      published: !!form.published,
      dateAdded: new Date().toISOString(),
    };

    // call onSave which will handle API attempt and state update
    await onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-auto p-4">
      <div className="bg-white w-full max-w-4xl rounded-lg p-6 shadow-xl mt-8 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="text-red-600">Close</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Product Title / Name</label>
              <input value={form.title} onChange={(e) => handleChange("title", e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">Product SKU</label>
              <input value={form.sku} onChange={(e) => handleChange("sku", e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Product Description</label>
              <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} className="w-full border px-3 py-2 rounded h-28" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Product Images</label>
              <input type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={handleFile} />
              <div className="flex gap-2 mt-2 flex-wrap">
                {(form.images || []).map((im, i) => (
                  <div key={i} className="border rounded p-2 relative">
                    <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-white rounded-full text-red-500 px-1">✖</button>
                    <div className="text-xs">{typeof im === "string" ? im : im.name}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">(Only *.jpeg, *.webp and *.png images will be accepted)</p>
            </div>

            <div>
              <label className="block text-sm font-medium">Latest Collection</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="checkbox" checked={form.latest} onChange={(e) => handleChange("latest", e.target.checked)} />
                <span className="text-sm">Mark as Latest Collection</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Product Barcode</label>
              <input value={form.barcode} onChange={(e) => handleChange("barcode", e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">Category</label>
              <select value={form.category} onChange={(e) => handleChange("category", e.target.value)} className="w-full border px-3 py-2 rounded">
                <option>Uncategorized</option>
                {(categories || []).map((c, i) => <option key={i} value={c}>{c}</option>)}
                <option>Home</option>
                <option>Men</option>
                <option>Women</option>
                <option>Electronics</option>
                <option>Jewellery</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Product Price (₹)</label>
              <input type="number" value={form.price} onChange={(e) => handleChange("price", e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">Sale Price (₹)</label>
              <div className="flex gap-2">
                <select value={saleMode} onChange={(e) => setSaleMode(e.target.value)} className="border px-2 py-1 rounded">
                  <option value="same">Same as Price</option>
                  <option value="discounted">Discounted (20% off)</option>
                  <option value="manual">Manual</option>
                </select>
                <input type="number" value={form.salePrice} onChange={(e) => handleChange("salePrice", e.target.value)} className="border px-3 py-2 rounded flex-1" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Choose mode then adjust sale price if manual.</p>
            </div>

            <div>
              <label className="block text-sm font-medium">Product Quantity</label>
              <input type="number" value={form.qty} onChange={(e) => handleChange("qty", e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">Product Slug</label>
              <input value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Product Tags</label>
              <div className="flex gap-2 mt-2">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} className="border px-3 py-2 rounded flex-1" placeholder="Product Tag (Write then press enter to add new tag)" />
                <button type="button" onClick={addTag} className="px-3 py-1 bg-gray-700 text-white rounded">Add</button>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {(form.tags || []).map((t, i) => (
                  <span key={i} className="bg-gray-200 px-2 py-1 rounded flex items-center gap-2 text-sm">
                    {t} <button type="button" onClick={() => removeTag(i)} className="text-red-500">✖</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex items-center gap-4 mt-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.published} onChange={(e) => handleChange("published", e.target.checked)} />
                <span>Published</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.status === "Active"} onChange={(e) => handleChange("status", e.target.checked ? "Active" : "Inactive")} />
                <span>Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// simple helpers inside modal scope
function addTag() { /* placeholder replaced below by closure */ }

// Placeholder page & small components
const PlaceholderPage = ({ title }) => (
  <div className="bg-white p-6 shadow rounded-lg text-center text-xl font-semibold">{title} Page Coming Soon...</div>
);

const DashboardCard = ({ title, value }) => (
  <div className="bg-white shadow p-6 rounded-lg text-center">
    <h3 className="text-gray-600">{title}</h3>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);

// best selling util
const getBestSellingProducts = (orders = []) => {
  const productCount = {};
  (orders || []).forEach((order) => {
    (order.items || order.cartItems || []).forEach((item) => {
      const title = item.title || item.name || "Unnamed";
      const qty = Number(item.quantity) || Number(item.qty) || 1;
      productCount[title] = (productCount[title] || 0) + qty;
    });
  });
  return Object.entries(productCount).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count).slice(0,6);
};

export default AdminPage;
