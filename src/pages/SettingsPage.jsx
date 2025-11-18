import React, { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    productImagesLimit: 2,
    autoTranslation: false,
    defaultLanguage: "English",
    defaultCurrency: "INR",
    defaultTimezone: "Asia/Kolkata (GMT+05:30)",
    defaultDateFormat: "MM/DD/YYYY",
    receiptSize: 57,
    invoiceEmail: false,
    shopName: "",
    companyName: "",
    vatNumber: "",
    address: "",
    postCode: "",
    contact: "",
    email: "",
    website: "",
  });

  // ✅ Load saved values from localStorage on first render
  useEffect(() => {
    const saved = localStorage.getItem("settings");
    if (saved) {
      setSettings((prev) => ({
        ...prev,
        ...JSON.parse(saved),
      }));
    }
  }, []);

  // ✅ Save settings to LocalStorage
  const saveSettings = () => {
    localStorage.setItem("settings", JSON.stringify(settings));
    alert("✅ Settings updated successfully!");
  };

  // ✅ Update single field
  const updateField = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow">

        {/* ---------------- GENERAL SETTINGS ---------------- */}
        <h2 className="col-span-full text-lg font-semibold border-b pb-2 mb-2">General Settings</h2>

        <div>
          <label className="block text-sm font-medium">Number of images per product</label>
          <input
            type="number"
            value={settings.productImagesLimit}
            onChange={(e) => updateField("productImagesLimit", Number(e.target.value))}
            className="mt-1 p-2 border rounded w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.autoTranslation}
            onChange={(e) => updateField("autoTranslation", e.target.checked)}
          />
          <label>Allow Auto Translation</label>
        </div>

        <div>
          <label className="block text-sm font-medium">Default Language</label>
          <select
            value={settings.defaultLanguage}
            onChange={(e) => updateField("defaultLanguage", e.target.value)}
            className="mt-1 p-2 border rounded w-full"
          >
            <option>English</option>
            <option>Hindi</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Default Currency</label>
          <select
            value={settings.defaultCurrency}
            onChange={(e) => updateField("defaultCurrency", e.target.value)}
            className="mt-1 p-2 border rounded w-full"
          >
            <option>INR</option>
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Default Time Zone</label>
          <select
            value={settings.defaultTimezone}
            onChange={(e) => updateField("defaultTimezone", e.target.value)}
            className="mt-1 p-2 border rounded w-full"
          >
            <option>Asia/Kolkata (GMT+05:30)</option>
            <option>UTC (GMT+00:00)</option>
            <option>America/New_York (GMT-05:00)</option>
            <option>Europe/London (GMT+01:00)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Default Date Format</label>
          <select
            value={settings.defaultDateFormat}
            onChange={(e) => updateField("defaultDateFormat", e.target.value)}
            className="mt-1 p-2 border rounded w-full"
          >
            <option>MM/DD/YYYY</option>
            <option>DD/MM/YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Receipt size (width in mm)</label>
          <input
            type="number"
            value={settings.receiptSize}
            onChange={(e) => updateField("receiptSize", Number(e.target.value))}
            className="mt-1 p-2 border rounded w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.invoiceEmail}
            onChange={(e) => updateField("invoiceEmail", e.target.checked)}
          />
          <label>Enable Invoice Email</label>
        </div>

        {/* ---------------- STORE DETAILS ---------------- */}
        <h2 className="col-span-full text-lg font-semibold border-b pb-2 mt-4 mb-2">Store Information</h2>

        <input
          type="text"
          placeholder="Shop Name"
          value={settings.shopName}
          onChange={(e) => updateField("shopName", e.target.value)}
          className="p-2 border rounded w-full"
        />

        <input
          type="text"
          placeholder="Company Name"
          value={settings.companyName}
          onChange={(e) => updateField("companyName", e.target.value)}
          className="p-2 border rounded w-full"
        />

        <input
          type="text"
          placeholder="VAT Number"
          value={settings.vatNumber}
          onChange={(e) => updateField("vatNumber", e.target.value)}
          className="p-2 border rounded w-full"
        />

        <textarea
          placeholder="Address"
          value={settings.address}
          onChange={(e) => updateField("address", e.target.value)}
          className="p-2 border rounded w-full col-span-full"
        />

        <input
          type="text"
          placeholder="Post Code"
          value={settings.postCode}
          onChange={(e) => updateField("postCode", e.target.value)}
          className="p-2 border rounded w-full"
        />

        <input
          type="text"
          placeholder="Contact Number"
          value={settings.contact}
          onChange={(e) => updateField("contact", e.target.value)}
          className="p-2 border rounded w-full"
        />

        <input
          type="email"
          placeholder="Email"
          value={settings.email}
          onChange={(e) => updateField("email", e.target.value)}
          className="p-2 border rounded w-full"
        />

        <input
          type="text"
          placeholder="Website"
          value={settings.website}
          onChange={(e) => updateField("website", e.target.value)}
          className="p-2 border rounded w-full"
        />

        {/* SAVE BUTTON */}
        <button
          onClick={saveSettings}
          className="col-span-full mt-4 p-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Settings
        </button>

      </div>
    </div>
  );
}
