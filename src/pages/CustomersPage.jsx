import React, { useEffect, useState, useMemo } from "react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editData, setEditData] = useState({ fullname: "", mail: "", mobile: "" });

  const [page, setPage] = useState(1);
  const pageSize = 10;

  // ✅ Fix: Normalize without overwriting values
  const normalizeUsers = (arr) =>
    arr.map((u, i) => ({
      uid: u.uid || i + 1,
      fullname:
        u.fullname ||
        `${u.firstName || ""} ${u.lastName || ""}`.trim(),
      mail: u.mail || u.email || "",
      mobile: u.mobile || u.phone || "",
      createdAt: u.createdAt || new Date().toISOString().split("T")[0],
      _raw: u, // stores original to avoid losing keys
    }));

  useEffect(() => {
    try {
      const raw = localStorage.getItem("users");
      const parsed = raw ? JSON.parse(raw) : [];
      const normalized = normalizeUsers(parsed);
      normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setCustomers(normalized);
    } catch (err) {
      console.error("Failed to load users:", err);
      setCustomers([]);
    }
  }, []);

  // ✅ CORRECTED: Save only edited data, don't repeat same email for all users
  const persistUsers = (nextUsers) => {
    const dataToStore = nextUsers.map((u) => ({
      ...u._raw,
      firstName: u.fullname.split(" ")[0] || "",
      lastName: u.fullname.split(" ").slice(1).join(" ") || "",
      email: u.mail,
      mobile: u.mobile,
      createdAt: u.createdAt,
      uid: u.uid,
    }));

    localStorage.setItem("users", JSON.stringify(dataToStore));
    setCustomers(nextUsers);
  };

  const filtered = useMemo(() => {
    const q = (search || "").toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (u) =>
        (u.fullname || "").toLowerCase().includes(q) ||
        (u.mail || "").toLowerCase().includes(q) ||
        String(u.mobile || "").includes(q)
    );
  }, [customers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openEdit = (u) => {
    setEditUser(u);
    setEditData({
      fullname: u.fullname || "",
      mail: u.mail || "",
      mobile: u.mobile || "",
    });
  };

  const closeEdit = () => {
    setEditUser(null);
    setEditData({ fullname: "", mail: "", mobile: "" });
  };

  const handleSave = () => {
    if (!editData.fullname.trim()) return alert("Name is required");
    if (!editData.mail.trim()) return alert("Email is required");
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(editData.mail)) return alert("Enter a valid email");

    const next = customers.map((u) =>
      String(u.uid) === String(editUser.uid)
        ? {
            ...u,
            fullname: editData.fullname.trim(),
            mail: editData.mail.trim(),
            mobile: editData.mobile.trim(),
          }
        : u
    );

    persistUsers(next);
    closeEdit();
    alert("✅ User updated");
  };

  const handleDelete = (uid) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const next = customers.filter((u) => String(u.uid) !== String(uid));
    persistUsers(next);
    alert("✅ User deleted");
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button
          onClick={() => setIsOptionsOpen((s) => !s)}
          className="px-3 py-2 bg-gray-100 rounded"
        >
          ⚙ Options
        </button>
      </div>

      {/* Search */}
      {isOptionsOpen && (
        <div className="mb-4 p-4 bg-white rounded shadow">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search name/email/phone"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="border px-3 py-2 rounded flex-1"
            />
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="px-3 py-2 bg-gray-300 rounded"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">UID</th>
              <th className="p-3 border">Join Date</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length > 0 ? (
              paginated.map((u) => (
                <tr key={u.uid} className="hover:bg-gray-50">
                  <td className="p-3 border">{u.uid}</td>
                  <td className="p-3 border">{u.createdAt}</td>
                  <td className="p-3 border">{u.fullname}</td>
                  <td className="p-3 border">{u.mail}</td>
                  <td className="p-3 border">{u.mobile}</td>
                  <td className="p-3 border">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="px-2 py-1 bg-yellow-400 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(u.uid)}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          editUser ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: 360 }}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Edit User</h2>
            <button onClick={closeEdit} className="text-gray-600">✖</button>
          </div>

          {editUser ? (
            <>
              <div className="bg-gray-100 p-3 rounded mb-4">
                <p className="font-bold text-lg">{editUser.fullname}</p>
                <p className="text-sm text-gray-700">📞 {editUser.mobile}</p>
                <p className="text-sm text-gray-700">✉️ {editUser.mail}</p>
                <p className="text-xs text-gray-500 mt-1">Joined: {editUser.createdAt}</p>
              </div>

              <label className="text-sm text-gray-600">Full Name</label>
              <input
                value={editData.fullname}
                onChange={(e) => setEditData((p) => ({ ...p, fullname: e.target.value }))}
                className="w-full p-2 border rounded mb-3"
              />

              <label className="text-sm text-gray-600">Email</label>
              <input
                value={editData.mail}
                onChange={(e) => setEditData((p) => ({ ...p, mail: e.target.value }))}
                className="w-full p-2 border rounded mb-3"
              />

              <label className="text-sm text-gray-600">Phone</label>
              <input
                value={editData.mobile}
                onChange={(e) => setEditData((p) => ({ ...p, mobile: e.target.value }))}
                className="w-full p-2 border rounded mb-3"
              />

              <div className="mt-auto flex gap-2">
                <button onClick={closeEdit} className="flex-1 p-2 border rounded">Cancel</button>
                <button onClick={handleSave} className="flex-1 p-2 bg-yellow-400 rounded">Save</button>
              </div>
            </>
          ) : (
            <div className="text-gray-500">Select a user to edit</div>
          )}
        </div>
      </div>
    </div>
  );
}
