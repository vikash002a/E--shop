// src/pages/CategoriesPage.jsx
import React, { useEffect, useState, useRef } from "react";
// import at top

// ...


// Static parent list (your request: use static list)
const PARENT_OPTIONS = ["Home", "Electronics", "Men", "Women", "Jewellery", "Other"];

// Seed categories (from fake store)
const DEFAULT_CATEGORIES = [
  { id: "electronics", name: "electronics", slug: "electronics", description: "", image: "", parent: "Electronics", status: "Active", lang: "en", subcategories: [] },
  { id: "jewelery", name: "jewelery", slug: "jewelery", description: "", image: "", parent: "Home", status: "Active", lang: "en", subcategories: [] },
  { id: "mens-clothing", name: "men's clothing", slug: "mens-clothing", description: "", image: "", parent: "Men", status: "Active", lang: "en", subcategories: [] },
  { id: "womens-clothing", name: "women's clothing", slug: "womens-clothing", description: "", image: "", parent: "Women", status: "Active", lang: "en", subcategories: [] },
];

const uid = () => Math.random().toString(36).slice(2, 9);
const slugify = (s = "") =>
  s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-");

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Modal form state (category + subcategories)
  const blankForm = {
    id: null,
    lang: "en",
    name: "",
    slug: "",
    description: "",
    parent: "Home",
    image: "",
    status: "Active",
    subcategories: [], // each: { id, name, slug, status }
  };
  const [form, setForm] = useState(blankForm);

  // load categories from localStorage or default
  useEffect(() => {
    const local = JSON.parse(localStorage.getItem("admin_categories") || "null");
    if (local && Array.isArray(local) && local.length) setCategories(local);
    else setCategories(DEFAULT_CATEGORIES.map((c) => ({ ...c, id: c.id || uid() })));
  }, []);

  useEffect(() => {
    localStorage.setItem("admin_categories", JSON.stringify(categories));
  }, [categories]);

  // filtered list for table
  const filtered = categories.filter((c) => {
    const q = search.trim().toLowerCase();
    if (q && !((c.name || "").toLowerCase().includes(q) || (c.slug || "").toLowerCase().includes(q))) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  // Modal helpers
  const openAdd = () => {
    setEditingId(null);
    setForm({ ...blankForm, id: uid() });
    setFilePreview(null);
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat.id);
    setForm({
      id: cat.id,
      lang: cat.lang || "en",
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      parent: cat.parent || "Home",
      image: cat.image || "",
      status: cat.status || "Active",
      subcategories: Array.isArray(cat.subcategories) ? JSON.parse(JSON.stringify(cat.subcategories)) : [],
    });
    setFilePreview(cat.image || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(blankForm);
    setFilePreview(null);
  };

  // drag & drop handlers
  const handleDrop = (ev) => {
    ev.preventDefault();
    const file = ev.dataTransfer.files && ev.dataTransfer.files[0];
    if (file) readFile(file);
  };
  const handleDragOver = (ev) => ev.preventDefault();
  const readFile = (file) => {
    if (!file.type.startsWith("image/")) return alert("Only images allowed");
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target.result);
      setForm((f) => ({ ...f, image: e.target.result }));
    };
    reader.readAsDataURL(file);
  };
  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) readFile(file);
  };

  // Subcategories helpers (unlimited)
  const addSubcategory = () => {
    setForm((f) => ({
      ...f,
      subcategories: [{ id: uid(), name: "", slug: "", status: "Active" }, ...f.subcategories],
    }));
  };
  const updateSubcategory = (id, key, value) => {
    setForm((f) => ({
      ...f,
      subcategories: f.subcategories.map((s) => (s.id === id ? { ...s, [key]: key === "name" ? value : value } : s)),
    }));
  };
  const removeSubcategory = (id) => {
    setForm((f) => ({ ...f, subcategories: f.subcategories.filter((s) => s.id !== id) }));
  };
  const autoSlugSub = (id, name) => {
    setForm((f) => ({
      ...f,
      subcategories: f.subcategories.map((s) => (s.id === id ? { ...s, name, slug: slugify(name) } : s)),
    }));
  };

  // Save category
  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name) return alert("Name required");
    if (!form.slug) setForm((f) => ({ ...f, slug: slugify(f.name) }));
    const payload = { ...form, slug: form.slug || slugify(form.name), id: form.id || uid() };
    if (editingId) {
      setCategories((prev) => prev.map((c) => (c.id === editingId ? payload : c)));
      alert("Category updated");
    } else {
      setCategories((prev) => [payload, ...prev]);
      alert("Category added");
    }
    closeModal();
  };

  // Delete
  const handleDelete = (id) => {
    if (!window.confirm("Delete this category?")) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Toggle status from table
  const toggleStatus = (id) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" } : c)));
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  // CSV export / import (subcategories serialized as JSON string in column "subcategories")
  const exportCSV = () => {
    if (!categories.length) return alert("No categories to export");
    const headers = ["id", "lang", "name", "slug", "description", "parent", "image", "status", "subcategories"];
    const rows = categories.map((c) =>
      headers
        .map((h) => {
          if (h === "subcategories") return JSON.stringify(c.subcategories || []);
          return JSON.stringify(c[h] || "");
        })
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "categories_export.csv";
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
      const headers = headerLine.split(",").map((h) => h.trim());
      const imported = lines.map((line) => {
        const cols = line.split(",");
        const obj = {};
        headers.forEach((h, i) => {
          let val = cols[i] || "";
          try {
            val = JSON.parse(val);
          } catch {}
          obj[h] = val;
        });
        const subs = obj.subcategories ? (typeof obj.subcategories === "string" ? JSON.parse(obj.subcategories || "[]") : obj.subcategories) : [];
        return {
          id: obj.id || uid(),
          lang: obj.lang || "en",
          name: obj.name || "Untitled",
          slug: obj.slug || slugify(obj.name || ""),
          description: obj.description || "",
          parent: obj.parent || "Home",
          image: obj.image || "",
          status: obj.status || "Active",
          subcategories: Array.isArray(subs) ? subs.map((s) => ({ id: s.id || uid(), name: s.name || "", slug: s.slug || slugify(s.name || ""), status: s.status || "Active" })) : [],
        };
      });
      setCategories((prev) => [...imported, ...prev]);
      alert(`Imported ${imported.length} categories`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white p-6 shadow rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Categories</h2>
        <div className="flex items-center gap-2">
          <button onClick={openAdd} className="bg-purple-600 text-white px-3 py-1 rounded">+ Add Category</button>
          <button onClick={exportCSV} className="bg-green-600 text-white px-3 py-1 rounded">Export CSV</button>
          <label className="bg-blue-600 text-white px-3 py-1 rounded cursor-pointer flex items-center gap-2">
            Import
            <input type="file" accept=".csv" onChange={(e) => e.target.files[0] && importCSV(e.target.files[0])} className="hidden" />
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search categories..." className="border px-3 py-2 rounded flex-1 min-w-[200px]" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border px-3 py-2 rounded">
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
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Slug</th>
              <th className="p-3 border">Parent</th>
              <th className="p-3 border">Image</th>
              <th className="p-3 border">Description</th>
              <th className="p-3 border">Subcategories</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 align-top">
                <td className="p-3 border font-medium">{c.name}</td>
                <td className="p-3 border">{c.slug}</td>
                <td className="p-3 border">{c.parent}</td>
                <td className="p-3 border">
                  {c.image ? <img src={c.image} alt={c.name} className="h-12 w-12 object-cover rounded" /> : <div className="h-12 w-12 bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Image</div>}
                </td>
                <td className="p-3 border text-sm text-gray-600">{c.description}</td>
                <td className="p-3 border text-sm">
                  {(c.subcategories || []).slice(0, 3).map((s) => s.name).join(", ") || <span className="text-gray-400">—</span>}
                  {c.subcategories && c.subcategories.length > 3 && <div className="text-xs text-gray-500 mt-1">+{c.subcategories.length - 3} more</div>}
                </td>
                <td className="p-3 border">
                  <button onClick={() => toggleStatus(c.id)} className={`px-2 py-1 rounded text-xs ${c.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {c.status}
                  </button>
                </td>
                <td className="p-3 border">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-6 text-center text-gray-500">No categories found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-auto p-4">
          <div className="bg-white w-full max-w-3xl rounded-lg p-6 shadow-xl mt-8 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingId ? "Update Category" : "Add Category"}</h3>
              <button onClick={closeModal} className="text-red-600">Close</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex justify-between gap-3">
                <div>
                  <label className="block text-sm font-medium">Language</label>
                  <select value={form.lang} onChange={(e) => setForm((f) => ({ ...f, lang: e.target.value }))} className="border px-3 py-2 rounded">
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Parent Category</label>
                  <select value={form.parent} onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))} className="border px-3 py-2 rounded">
                    {PARENT_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={form.status === "Active"} onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked ? "Active" : "Inactive" }))} />
                      <span className="text-sm">Active</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input value={form.name} onChange={(e) => { const name = e.target.value; setForm((f) => ({ ...f, name, slug: slugify(name) })); }} className="w-full border px-3 py-2 rounded" required />
                </div>

                <div>
                  <label className="block text-sm font-medium">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} className="w-full border px-3 py-2 rounded" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full border px-3 py-2 rounded h-24" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Image (drag & drop or click)</label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className="border-dashed border-2 border-gray-300 p-4 rounded cursor-pointer text-center"
                  >
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                    <div>Drag image here or click to upload</div>
                    <div className="text-xs text-gray-500 mt-1">(Only *.jpeg, *.webp and *.png images will be accepted)</div>
                    {filePreview && <div className="mt-3 flex justify-center"><img src={filePreview} alt="preview" className="h-28 object-contain rounded" /></div>}
                  </div>
                </div>
              </div>

              {/* Subcategories block */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Subcategories</h4>
                  <div className="flex gap-2">
                    <button type="button" onClick={addSubcategory} className="bg-blue-600 text-white px-3 py-1 rounded">+ Add Subcategory</button>
                  </div>
                </div>

                <div className="space-y-3">
                  {form.subcategories.length === 0 && <div className="text-sm text-gray-500">No subcategories yet.</div>}
                  {form.subcategories.map((s) => (
                    <div key={s.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                      <input value={s.name} onChange={(e) => autoSlugSub(s.id, e.target.value)} placeholder="Subcategory name" className="border px-3 py-2 rounded md:col-span-2" />
                      <input value={s.slug} onChange={(e) => updateSubcategory(s.id, "slug", slugify(e.target.value))} placeholder="Slug" className="border px-3 py-2 rounded md:col-span-2" />
                      <div className="flex items-center gap-2 md:col-span-1">
                        <select value={s.status} onChange={(e) => updateSubcategory(s.id, "status", e.target.value)} className="border px-2 py-1 rounded text-sm">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="md:col-span-1">
                        <button type="button" onClick={() => removeSubcategory(s.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{editingId ? "Update Category" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
