import React, { useEffect, useState } from "react";

/**
 * CouponsPage (UI-only)
 * Saves to localStorage key: admin_coupons
 *
 * Fields:
 *  - code (string)
 *  - type: "percentage" | "fixed"
 *  - value: number
 *  - minOrder: number
 *  - startDate, endDate (YYYY-MM-DD)
 *  - usageLimit (number)
 *  - status: "Active" | "Inactive"
 *  - applyScope: "store" | "categories" | "products"
 *  - selectedCategories: []
 *
 * Features:
 *  - search, filter by status, reset
 *  - add/edit/delete
 *  - toggle status
 *  - export / import CSV
 *  - auto-generate code
 */

const LOCAL_COUPONS_KEY = "admin_coupons";

const STATIC_CATEGORIES = [
  { id: "electronics", name: "electronics" },
  { id: "jewelery", name: "jewelery" },
  { id: "mens-clothing", name: "men's clothing" },
  { id: "womens-clothing", name: "women's clothing" },
];

const uid = () => Math.random().toString(36).slice(2, 9);
const genCode = (len = 8) => Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, len);

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const blank = {
    id: null,
    code: "",
    type: "percentage",
    value: 10,
    minOrder: 0,
    startDate: "",
    endDate: "",
    usageLimit: 1,
    status: "Active",
    applyScope: "store", // store | categories | products
    selectedCategories: [],
    description: "",
  };

  const [form, setForm] = useState(blank);

  // load
  useEffect(() => {
    const local = JSON.parse(localStorage.getItem(LOCAL_COUPONS_KEY) || "null");
    if (local && Array.isArray(local)) setCoupons(local);
    else setCoupons([]);
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_COUPONS_KEY, JSON.stringify(coupons));
  }, [coupons]);

  const filtered = coupons.filter((c) => {
    const q = search.trim().toLowerCase();
    if (q && !(c.code || "").toLowerCase().includes(q) && !(c.description || "").toLowerCase().includes(q)) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...blank, code: genCode(8) });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({ ...c });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.code) return alert("Coupon code required");
    if (Number(form.value) <= 0) return alert("Discount value must be > 0");
    if (editingId) {
      setCoupons((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...form } : p)));
      alert("Coupon updated");
    } else {
      const newC = { ...form, id: form.id || uid() };
      setCoupons((prev) => [newC, ...prev]);
      alert("Coupon added");
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    setCoupons((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleStatus = (id) => {
    setCoupons((prev) => prev.map((p) => (p.id === id ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p)));
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  const exportCSV = () => {
    if (!coupons.length) return alert("No coupons to export");
    const headers = ["id","code","type","value","minOrder","startDate","endDate","usageLimit","status","applyScope","selectedCategories","description"];
    const rows = coupons.map((c) => headers.map((h)=>JSON.stringify(c[h] || "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "coupons_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCSV = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
      if (!headerLine) return alert("CSV empty or malformed");
      const headers = headerLine.split(",").map(h => h.trim());
      const imported = lines.map((line) => {
        const cols = line.split(",");
        const obj = {};
        headers.forEach((h, i) => {
          let val = cols[i] || "";
          try { val = JSON.parse(val); } catch (err) {}
          obj[h] = val;
        });
        if (!obj.id) obj.id = uid();
        obj.selectedCategories = obj.selectedCategories ? (Array.isArray(obj.selectedCategories) ? obj.selectedCategories : (""+obj.selectedCategories).split("|")) : [];
        return {
          id: obj.id,
          code: obj.code || genCode(8),
          type: obj.type || "percentage",
          value: Number(obj.value || 0),
          minOrder: Number(obj.minOrder || 0),
          startDate: obj.startDate || "",
          endDate: obj.endDate || "",
          usageLimit: Number(obj.usageLimit || 1),
          status: obj.status || "Active",
          applyScope: obj.applyScope || "store",
          selectedCategories: obj.selectedCategories,
          description: obj.description || ""
        };
      });
      setCoupons((prev) => [...imported, ...prev]);
      alert(`Imported ${imported.length} coupons`);
    };
    reader.readAsText(file);
  };

  const autoGenerate = () => {
    setForm((f) => ({ ...f, code: genCode(10) }));
  };

  // quick CSV download helper for a single coupon (optional)
  const downloadSingleCSV = (coupon) => {
    const headers = ["id","code","type","value","minOrder","startDate","endDate","usageLimit","status","applyScope","selectedCategories","description"];
    const row = headers.map((h)=> JSON.stringify(coupon[h] || "")).join(",");
    const csv = [headers.join(","), row].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coupon_${coupon.code}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 shadow rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Coupons</h2>
        <div className="flex items-center gap-2">
          <button onClick={openAdd} className="bg-purple-600 text-white px-3 py-1 rounded">+ Add Coupon</button>
          <button onClick={exportCSV} className="bg-green-600 text-white px-3 py-1 rounded">Export CSV</button>
          <label className="bg-blue-600 text-white px-3 py-1 rounded cursor-pointer flex items-center gap-2">
            Import
            <input type="file" accept=".csv" onChange={(e)=> e.target.files[0] && importCSV(e.target.files[0])} className="hidden" />
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <input value={search} onChange={(e)=>setSearch(e.target.value)} type="text" placeholder="Search by code or description..." className="border px-3 py-2 rounded flex-1 min-w-[200px]" />
        <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button onClick={resetFilters} className="bg-gray-600 text-white px-3 py-2 rounded">Reset</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3 border">Code</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Value</th>
              <th className="p-3 border">Min Order</th>
              <th className="p-3 border">Valid</th>
              <th className="p-3 border">Usage</th>
              <th className="p-3 border">Scope</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="p-3 border font-medium">{c.code}</td>
                <td className="p-3 border">{c.type}</td>
                <td className="p-3 border">{c.type === "percentage" ? `${c.value}%` : `₹${Number(c.value).toFixed(2)}`}</td>
                <td className="p-3 border">₹{Number(c.minOrder||0).toFixed(2)}</td>
                <td className="p-3 border text-sm text-gray-600">{c.startDate || "—"} → {c.endDate || "—"}</td>
                <td className="p-3 border">{c.usageLimit}</td>
                <td className="p-3 border">
                  {c.applyScope}
                  {c.applyScope === "categories" && c.selectedCategories && c.selectedCategories.length > 0 && (
                    <div className="text-xs text-gray-500">{c.selectedCategories.join(", ")}</div>
                  )}
                </td>
                <td className="p-3 border">
                  <button onClick={()=>toggleStatus(c.id)} className={`px-2 py-1 rounded text-xs ${c.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {c.status}
                  </button>
                </td>
                <td className="p-3 border">
                  <div className="flex gap-2">
                    <button onClick={()=>openEdit(c)} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
                    <button onClick={()=>handleDelete(c.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                    <button onClick={()=>downloadSingleCSV(c)} className="bg-gray-300 text-black px-2 py-1 rounded text-xs">CSV</button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr><td colSpan={9} className="p-6 text-center text-gray-500">No coupons found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-auto p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg p-6 shadow-xl mt-8 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingId ? 'Update Coupon' : 'Add Coupon'}</h3>
              <button onClick={()=>setShowModal(false)} className="text-red-600">Close</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Code</label>
                  <div className="flex gap-2">
                    <input value={form.code} onChange={(e)=>setForm(f=>({...f, code: e.target.value.trim()}))} className="w-full border px-3 py-2 rounded" required />
                    <button type="button" onClick={autoGenerate} className="bg-gray-700 text-white px-3 rounded">Auto</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Type</label>
                  <select value={form.type} onChange={(e)=>setForm(f=>({...f, type: e.target.value}))} className="w-full border px-3 py-2 rounded">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Value</label>
                  <input type="number" min="0" value={form.value} onChange={(e)=>setForm(f=>({...f, value: e.target.value}))} className="w-full border px-3 py-2 rounded" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Min Order Amount (₹)</label>
                  <input type="number" min="0" value={form.minOrder} onChange={(e)=>setForm(f=>({...f, minOrder: e.target.value}))} className="w-full border px-3 py-2 rounded" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e)=>setForm(f=>({...f, startDate: e.target.value}))} className="w-full border px-3 py-2 rounded" />
                </div>

                <div>
                  <label className="block text-sm font-medium">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e)=>setForm(f=>({...f, endDate: e.target.value}))} className="w-full border px-3 py-2 rounded" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Usage Limit</label>
                  <input type="number" min="1" value={form.usageLimit} onChange={(e)=>setForm(f=>({...f, usageLimit: e.target.value}))} className="w-full border px-3 py-2 rounded" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Status</label>
                  <select value={form.status} onChange={(e)=>setForm(f=>({...f, status: e.target.value}))} className="w-full border px-3 py-2 rounded">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Apply Scope</label>
                  <div className="flex gap-3 items-center mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="scope" checked={form.applyScope === 'store'} onChange={()=>setForm(f=>({...f, applyScope: 'store'}))} />
                      <span>Store</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="scope" checked={form.applyScope === 'categories'} onChange={()=>setForm(f=>({...f, applyScope: 'categories'}))} />
                      <span>Categories</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="scope" checked={form.applyScope === 'products'} onChange={()=>setForm(f=>({...f, applyScope: 'products'}))} />
                      <span>Products</span>
                    </label>
                  </div>
                </div>

                {form.applyScope === "categories" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium">Select Categories</label>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {STATIC_CATEGORIES.map(cat => {
                        const sel = form.selectedCategories || [];
                        const checked = sel.includes(cat.id);
                        return (
                          <label key={cat.id} className="flex items-center gap-2 border px-3 py-1 rounded text-sm">
                            <input type="checkbox" checked={checked} onChange={()=>{
                              setForm(f=>{
                                const cur = new Set(f.selectedCategories || []);
                                if(cur.has(cat.id)) cur.delete(cat.id); else cur.add(cat.id);
                                return {...f, selectedCategories: Array.from(cur)};
                              });
                            }} />
                            <span>{cat.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Description (optional)</label>
                  <textarea value={form.description} onChange={(e)=>setForm(f=>({...f, description: e.target.value}))} className="w-full border px-3 py-2 rounded h-24" />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={()=>{ setShowModal(false); }} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{editingId ? "Update Coupon" : "Add Coupon"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
