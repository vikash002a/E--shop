// src/pages/OrdersPage.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import InvoicePrint from "../components/InvoicePrint"; // adjust path if needed

const LOCAL_ORDERS_KEY = "hood";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);

  // pagination + selection
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const selectAllRef = useRef(null);

  // search + filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // sorting
  const [sortBy, setSortBy] = useState("date"); // 'date' | 'total' | 'fullName'
  const [sortDir, setSortDir] = useState("desc");

  // ---------- Load orders & live update ----------
  useEffect(() => {
    const loadOrders = () => {
      const localOrders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || "[]");
      setOrders(localOrders);
      calculateStats(localOrders);
    };
    loadOrders();
    const interval = setInterval(loadOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  // ---------- Stats calculation ----------
  const calculateStats = (ordersArr = []) => {
    let pending = 0, processing = 0, delivered = 0;
    ordersArr.forEach((order) => {
      const s = (order.status || order.orderStatus || "pending").toLowerCase();
      if (s === "pending") pending++;
      else if (s === "processing" || s === "shipped") processing++;
      else if (s === "delivered") delivered++;
    });
    setStats({ total: ordersArr.length, pending, processing, delivered });
  };

  // ---------- Status update ----------
  const handleStatusChange = (orderId, newStatus) => {
    const updated = orders.map((o) => (o.orderId === orderId ? { ...o, status: newStatus, orderStatus: newStatus } : o));
    setOrders(updated);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
    calculateStats(updated);
  };

  // ---------- Invoice modal ----------
  const openInvoice = (order) => setSelectedOrder(order);
  const closeInvoice = () => setSelectedOrder(null);

  // ---------- Filtering + Sorting ----------
  const filtered = useMemo(() => {
    let data = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(o => {
        const fields = [
          o.orderId?.toString() || "",
          o.fullName || "",
          o.email || "",
          o.city || "",
          o.payment?.method || ""
        ];
        return fields.join(" ").toLowerCase().includes(q);
      });
    }

    if (statusFilter) data = data.filter(o => (o.status || o.orderStatus || "Pending") === statusFilter);

    if (startDate) {
      const start = new Date(startDate);
      data = data.filter(o => new Date(o.date) >= start);
    }
    if (endDate) {
      const end = new Date(endDate); end.setHours(23,59,59,999);
      data = data.filter(o => new Date(o.date) <= end);
    }

    if (sortBy) {
      data.sort((a,b) => {
        if(sortBy==="total") return sortDir==="asc"? (a.totalPrice||0)-(b.totalPrice||0) : (b.totalPrice||0)-(a.totalPrice||0);
        if(sortBy==="date") return sortDir==="asc"? new Date(a.date)-new Date(b.date) : new Date(b.date)-new Date(a.date);
        const as = (a.fullName||"").toLowerCase(), bs=(b.fullName||"").toLowerCase();
        return sortDir==="asc"? (as<bs?-1:as>bs?1:0) : (as<bs?1:as>bs?-1:0);
      });
    }

    return data;
  }, [orders, search, statusFilter, startDate, endDate, sortBy, sortDir]);

  // ---------- Pagination ----------
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  useEffect(() => { if(page>totalPages) setPage(totalPages); }, [totalPages,page]);
  const paginated = useMemo(() => {
    const start = (page-1)*rowsPerPage;
    return filtered.slice(start, start+rowsPerPage);
  }, [filtered,page,rowsPerPage]);

  // ---------- Selection ----------
  const toggleSelect = id => setSelectedIds(prev => { const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s; });
  const toggleSelectAllOnPage = () => {
    const pageIds = paginated.map(o=>o.orderId);
    const allSelected = pageIds.every(id=>selectedIds.has(id));
    setSelectedIds(prev=>{
      const s=new Set(prev);
      if(allSelected) pageIds.forEach(id=>s.delete(id));
      else pageIds.forEach(id=>s.add(id));
      return s;
    });
  };
  useEffect(()=>{
    if(!selectAllRef.current) return;
    const pageIds = paginated.map(o=>o.orderId);
    const selectedCount = pageIds.filter(id=>selectedIds.has(id)).length;
    selectAllRef.current.indeterminate = selectedCount>0 && selectedCount<pageIds.length;
    selectAllRef.current.checked = selectedCount===pageIds.length && pageIds.length>0;
  }, [paginated,selectedIds]);

  // ---------- Export helpers ----------
  const prepareExportRows = rows => rows.map(o=>({
    orderId: o.orderId || "",
    customer: o.fullName || "",
    total: o.totalPrice || 0,
    status: o.status || o.orderStatus || "",
    orderDate: o.date || "",
    paymentMethod: o.payment?.method || "N/A",
  }));

  const downloadCSV = (onlySelected=false) => {
    const rows = onlySelected ? orders.filter(o=>selectedIds.has(o.orderId)) : filtered;
    if(!rows.length) return alert("No orders to export");
    const headers = ["Order ID","Customer","Total","Status","Order Date","Payment Method"];
    const data = prepareExportRows(rows).map(r=>[r.orderId,r.customer,r.total,r.status,r.orderDate,r.paymentMethod]);
    const csv = [headers,...data].map(row=>row.map(c=>`"${c}"`).join(",")).join("\n");
    saveAs(new Blob([csv],{type:"text/csv;charset=utf-8;"}), onlySelected?"orders-selected.csv":"orders.csv");
  };

  const downloadExcel = (onlySelected=false) => {
    const rows = onlySelected ? orders.filter(o=>selectedIds.has(o.orderId)) : filtered;
    if(!rows.length) return alert("No orders to export");
    const ws = XLSX.utils.json_to_sheet(prepareExportRows(rows));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, onlySelected?"orders-selected.xlsx":"orders.xlsx");
  };

  // ---------- Badge color helper ----------
  const statusBadge = status => {
    const s = (status||"Pending").toLowerCase();
    if(s==="pending") return "bg-yellow-100 text-yellow-800";
    if(s==="processing") return "bg-blue-100 text-blue-800";
    if(s==="delivered") return "bg-green-100 text-green-800";
    if(s==="cancelled") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Filters + Export */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="border px-3 py-2 rounded w-60"/>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">All Status</option>
          <option>Pending</option>
          <option>Processing</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>
        <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="border px-3 py-2 rounded"/>
        <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="border px-3 py-2 rounded"/>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="border px-3 py-2 rounded">
          <option value="date">Date</option>
          <option value="total">Total</option>
          <option value="fullName">Customer</option>
        </select>
        <button onClick={()=>setSortDir(d=>d==="asc"?"desc":"asc")} className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300">{sortDir==="asc"?"ASC":"DESC"}</button>

        <button onClick={()=>downloadCSV(false)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">CSV</button>
        <button onClick={()=>downloadExcel(false)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Download All Orders</button>
        <button onClick={()=>downloadCSV(true)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">CSV Selected</button>
        <button onClick={()=>downloadExcel(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Excel Selected</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3"><input ref={selectAllRef} type="checkbox" onChange={toggleSelectAllOnPage}/></th>
              <th className="p-3 text-left">Invoice</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Method</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((order,i)=>(
              <tr key={order.orderId || i} className="hover:bg-gray-50 transition">
                <td className="p-3"><input type="checkbox" checked={selectedIds.has(order.orderId)} onChange={()=>toggleSelect(order.orderId)}/></td>
                <td className="p-3">{order.orderId || `INV-${1000+i}`}</td>
                <td className="p-3">{new Date(order.date).toLocaleString()}</td>
                <td className="p-3">{order.fullName||"Unknown"}</td>
                <td className="p-3">{order.payment?.method?.toUpperCase() || "N/A"}</td>
                <td className="p-3 text-right font-semibold">₹{Number(order.totalPrice||0).toFixed(2)}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(order.status || order.orderStatus)}`}>
                    {order.status || order.orderStatus || "Pending"}
                  </span>

                </td>
                 <td className="p-3 text-center">
  <div className="flex justify-center gap-1">
    {/* Status Dropdown */}
    <select
      className="border rounded px-2 py-1 text-sm mr-2"
      value={order.status || "Pending"}
      onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
    >
      <option>Pending</option>
      <option>Processing</option>
      <option>Delivered</option>
      <option>Cancelled</option>
    </select>

    {/* View Invoice */}
    <button
      onClick={() => openInvoice(order)}
      className="text-blue-600 font-semibold hover:underline"
    >
      View
    </button>
                  
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length===0 && <tr><td colSpan={8} className="p-4 text-gray-400 text-center">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
        <div>
          Rows per page:
          <select value={rowsPerPage} onChange={e=>{setRowsPerPage(Number(e.target.value)); setPage(1)}} className="border px-3 py-2 rounded ml-2">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={()=>setPage(p=>Math.max(p-1,1))} disabled={page===1} className="border px-3 py-2 rounded disabled:opacity-50 hover:bg-gray-100">Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={()=>setPage(p=>Math.min(p+1,totalPages))} disabled={page===totalPages} className="border px-3 py-2 rounded disabled:opacity-50 hover:bg-gray-100">Next</button>
        </div>
      </div>

      {/* Invoice modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <InvoicePrint order={selectedOrder} onClose={closeInvoice}/>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
