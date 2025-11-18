// src/components/InvoicePrint.jsx
import React, { useRef } from "react";

const COMPANY = {
  name: "e shop",
  address: "Delhi, India",
  phone: "+91 9876543210",
  email: "support@eshop.com",
  gst: "GSTIN: 07AAAAA0000A1Z5",
  logoUrl: "", // Add logo URL if available
};

const InvoicePrint = ({ order, onClose }) => {
  const invoiceEl = useRef(null);

  if (!order) {
    return (
      <div className="p-6">
        <p>No order data available.</p>
        <div className="mt-4">
          <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded">
            Close
          </button>
        </div>
      </div>
    );
  }

  const formatINR = (n) => `₹${Number(n || 0).toFixed(2)}`;

  const subtotal = (order.items || []).reduce(
    (s, it) =>
      s +
      Number(it.price || it.unitPrice || 0) *
        Number(it.quantity || it.qty || 1),
    0
  );

  const discount = Number(order.discount || 0);
  const shipping = Number(order.shippingCharge || order.shipping || 0);
  const taxRate = 0.18;
  const taxAmount = Number(((subtotal - discount) * taxRate).toFixed(2));
  const grandTotal = Number(
    (subtotal - discount + taxAmount + shipping).toFixed(2)
  );

  const handlePrint = () => {
    const content = document.getElementById("print-area").innerHTML;
    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.orderId}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 10px; font-size: 13px; }
            th { background: #f5f5f5; text-align: left; }
            .right { text-align: right; }
            .section { margin-bottom: 18px; }
            .total-row td { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="invoice-wrap">${content}</div>
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
    }, 250);
  };

  const handleDownloadPDF = () => {
    handlePrint();
  };

  const renderAddress = (o) => {
    if (!o) return "";
    if (typeof o.address === "string") return o.address;
    return [
      o.address?.street,
      o.city,
      o.state,
      o.pincode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="bg-white p-4 rounded">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mb-4 no-print">
        <button onClick={handlePrint} className="bg-green-600 text-white px-4 py-2 rounded">
          🖨️ Print Invoice
        </button>
        <button onClick={handleDownloadPDF} className="bg-yellow-500 text-black px-4 py-2 rounded">
          ⬇ Download PDF
        </button>
        {onClose && (
          <button onClick={onClose} className="bg-gray-300 px-3 py-2 rounded">
            Close
          </button>
        )}
      </div>

      {/* Invoice Content */}
      <div id="print-area" ref={invoiceEl} style={{ background: "#fff", padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{COMPANY.name}</div>
            <div style={{ color: "#444", marginTop: 6 }}>
              {COMPANY.address} <br />
              {COMPANY.email} | {COMPANY.phone}
            </div>
            <div style={{ fontSize: 12, marginTop: 8, color: "#666" }}>{COMPANY.gst}</div>
          </div>

          <div style={{ textAlign: "right" }}>
            {COMPANY.logoUrl ? (
              <img src={COMPANY.logoUrl} style={{ maxWidth: 140 }} alt="Company Logo" />
            ) : (
              <div
                style={{
                  width: 140,
                  height: 50,
                  border: "1px solid #ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fafafa",
                  color: "#777",
                  fontSize: 12,
                  borderRadius: 6,
                }}
              >
                LOGO
              </div>
            )}
            <div style={{ marginTop: 10, fontSize: 13 }}>
              <strong>Invoice:</strong> {order.orderId} <br />
              <strong>Date:</strong>{" "}
              {order.date ? new Date(order.date).toLocaleString() : new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Bill To + Payment */}
        <div style={{ display: "flex", gap: 20, marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Bill To</div>
            <div style={{ fontSize: 13 }}>
              <div>{order.fullName}</div>
              <div>{renderAddress(order)}</div>
              {order.phone && <div>Phone: {order.phone}</div>}
              {order.email && <div>Email: {order.email}</div>}
            </div>
          </div>

          <div style={{ width: 260 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Payment</div>
            <div style={{ fontSize: 12 }}>
              Method: <strong>{order.payment?.method?.toUpperCase() || "N/A"}</strong> <br />
              Status: <strong>{order.payment?.status || "Pending"}</strong>
              {order.payment?.method === "card" && order.payment?.cardNumber && (
                <div>Card: **** **** **** {order.payment.cardNumber.slice(-4)}</div>
              )}
              {order.payment?.method === "upi" && order.payment?.upiId && (
                <div>UPI ID: {order.payment.upiId}</div>
              )}
            </div>
            <div style={{ marginTop: 12, fontSize: 13 }}>
              <div>Subtotal: <strong>{formatINR(subtotal)}</strong></div>
              <div>Discount: <strong>{formatINR(discount)}</strong></div>
              <div>Tax (18%): <strong>{formatINR(taxAmount)}</strong></div>
              <div>Shipping: <strong>{formatINR(shipping)}</strong></div>
              <div style={{ height: 8 }} />
              <div style={{ fontSize: 16, fontWeight: 800 }}>
                Grand Total: {formatINR(order.totalPrice ?? grandTotal)}
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th className="right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((it, i) => {
              const qty = Number(it.quantity || it.qty || 1);
              const price = Number(it.price || it.unitPrice || 0);
              return (
                <tr key={i}>
                  <td>
                    <strong>{it.title || it.name}</strong>
                    {it.variant && <div style={{ fontSize: 12, color: "#666" }}>Variant: {it.variant}</div>}
                  </td>
                  <td>{qty}</td>
                  <td>{formatINR(price)}</td>
                  <td className="right">{formatINR(price * qty)}</td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={3} className="right">Subtotal</td>
              <td className="right">{formatINR(subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="right">Discount</td>
              <td className="right">-{formatINR(discount)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="right">Tax (18%)</td>
              <td className="right">{formatINR(taxAmount)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="right">Shipping</td>
              <td className="right">{formatINR(shipping)}</td>
            </tr>
            <tr style={{ background: "#fafafa", fontWeight: 700 }}>
              <td colSpan={3} className="right">Grand Total</td>
              <td className="right">{formatINR(order.totalPrice ?? grandTotal)}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ marginTop: 18, fontSize: 13, color: "#444" }}>
          <div>Thank you for shopping with {COMPANY.name}.</div>
          <div style={{ marginTop: 8, fontSize: 12 }}>
            This is a computer-generated invoice and does not require signature.
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;
