import React from "react";

export default function AttributesPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-2xl w-full text-center bg-white rounded-lg shadow-md p-8">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-yellow-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1M4.2 6.8l.7.7M19.1 6.8l-.7.7M4.2 17.2l.7-.7M19.1 17.2l-.7-.7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2">Attributes — Coming Soon</h1>
        <p className="text-sm text-gray-600 mb-6">
      
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 border rounded bg-gray-50">
            <div className="text-xs text-gray-500">Attribute Groups</div>
            <div className="mt-2 font-semibold text-gray-700">Coming soon</div>
          </div>
          <div className="p-3 border rounded bg-gray-50">
            <div className="text-xs text-gray-500">Attribute Values</div>
            <div className="mt-2 font-semibold text-gray-700">Coming soon</div>
          </div>
          <div className="p-3 border rounded bg-gray-50">
            <div className="text-xs text-gray-500">Import / Export</div>
            <div className="mt-2 font-semibold text-gray-700">Coming soon</div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => alert("Feature is coming soon — stay tuned!")}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded text-black font-medium"
          >
            Notify me
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-400">
        
        </p>
      </div>
    </div>
  );
}
