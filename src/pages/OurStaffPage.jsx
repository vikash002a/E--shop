import React, { useEffect, useMemo, useState } from "react";

const DEFAULT_ROLES = ["SuperAdmin", "CEO", "Manager", "Designer", "Technician"];
const PAGE_SIZE = 10;
const PERMISSIONS = ["Dashboard", "Staff Management", "Reports", "Settings"];

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    joinDate: "",
    role: DEFAULT_ROLES[0],
    password: "",
    published: true,
    permissions: {},
  });

  // Load data from localStorage -> adminUsers
  useEffect(() => {
    const raw = localStorage.getItem("adminUsers");
    const data = raw ? JSON.parse(raw) : [];
    setStaff(
      data.map((u, i) => ({
        id: u.email || `U${i}`,
        name: u.name || "-",
        email: u.email,
        contact: u.contact || "-",
        joinDate: u.joinDate || new Date().toISOString().slice(0, 10),
        role: u.role || "Unknown",
        password: u.password || "",
        published: u.published !== undefined ? u.published : true,
        status: u.published ? "Active" : "Inactive",
        permissions: u.permissions || {},
      }))
    );
  }, []);

  const persist = (next) => {
    setStaff(next);
    // update adminUsers in localStorage
    localStorage.setItem(
      "adminUsers",
      JSON.stringify(
        next.map((u) => ({
          name: u.name,
          email: u.email,
          contact: u.contact,
          joinDate: u.joinDate,
          role: u.role,
          password: u.password,
          published: u.published,
          permissions: u.permissions,
        }))
      )
    );
  };

  // Filter & search
  const filtered = useMemo(() => {
    let arr = staff;
    if (roleFilter) arr = arr.filter((s) => s.role === roleFilter);
    if (!search) return arr;
    const q = search.toLowerCase();
    return arr.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        (s.contact || "").includes(q)
    );
  }, [staff, search, roleFilter]);

  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Published toggle
  const togglePublished = (id) => {
    const next = staff.map((s) => {
      if (s.id === id) {
        const newPublished = !s.published;
        return {
          ...s,
          published: newPublished,
          status: newPublished ? "Active" : "Inactive",
        };
      }
      return s;
    });
    persist(next);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this staff member?")) return;
    persist(staff.filter((s) => s.id !== id));
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.password)
      return alert("Name, Email & Password required");
    if (editing) {
      persist(
        staff.map((s) =>
          s.id === editing.id
            ? { ...s, ...form, status: form.published ? "Active" : "Inactive" }
            : s
        )
      );
    } else {
      persist([
        { ...form, id: `U${Date.now()}`, status: form.published ? "Active" : "Inactive" },
        ...staff,
      ]);
    }
    setIsModalOpen(false);
    setEditing(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Staff</h1>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by name/email/contact"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded"
        />
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Roles</option>
          {DEFAULT_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setEditing(null);
            setForm({
              name: "",
              email: "",
              contact: "",
              joinDate: new Date().toISOString().slice(0, 10),
              role: DEFAULT_ROLES[0],
              password: "",
              published: true,
              permissions: {},
            });
            setIsModalOpen(true);
          }}
          className="px-3 py-2 bg-purple-600 text-white rounded"
        >
          + Add Staff
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Contact</th>
              <th className="p-3 border">Joining Date</th>
              <th className="p-3 border">Role</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Published</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length > 0 ? (
              pageData.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{s.name}</td>
                  <td className="p-3 border">{s.email}</td>
                  <td className="p-3 border">{s.contact}</td>
                  <td className="p-3 border">{s.joinDate}</td>
                  <td className="p-3 border">{s.role}</td>
                  <td className="p-3 border">{s.status}</td>
                  <td className="p-3 border">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={s.published}
                        onChange={() => togglePublished(s.id)}
                      />
                      <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-all duration-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-7"></div>
                    </label>
                  </td>
                  <td className="p-3 border flex gap-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="px-2 py-1 bg-yellow-400 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  No staff found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50 overflow-auto p-4">
          <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-xl mt-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">{editing ? "Edit Staff" : "Add Staff"}</h2>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Contact"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="date"
                value={form.joinDate}
                onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              >
                {DEFAULT_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              {/* Permissions */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {PERMISSIONS.map((p) => (
                  <label key={p} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={form.permissions[p] || false}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          permissions: { ...form.permissions, [p]: e.target.checked },
                        })
                      }
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditing(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-yellow-400 rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
