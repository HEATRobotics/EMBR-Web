"use client";

// Navigation is rendered in RootLayout; remove local render

export default function Reports() {
  return (
  <div className="bg-gray-100 min-h-full">
      
      <main className="mb-16 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>

        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input type="date" className="w-full px-4 py-2 border rounded-md" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input type="date" className="w-full px-4 py-2 border rounded-md" />
            </div>
            <button className="px-6 py-2 bg-brand-orange text-white rounded-md hover:bg-brand-orange/90">
              Generate Report
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Total Missions</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Hotspots Found</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Total Flight Time</h3>
            <p className="text-3xl font-bold mt-2">0h</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Area Covered</h3>
            <p className="text-3xl font-bold mt-2">0 sq m</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mission History Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Mission History</h2>
            <div className="bg-gray-100 h-64 rounded flex items-center justify-center">
              <p className="text-gray-500">Chart: Missions over time</p>
            </div>
          </div>

          {/* Hotspot Heatmap */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Hotspot Frequency Map</h2>
            <div className="bg-gray-100 h-64 rounded flex items-center justify-center">
              <p className="text-gray-500">Heatmap: Frequently detected areas</p>
            </div>
          </div>

          {/* Bot Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Bot Performance</h2>
            <div className="bg-gray-100 h-64 rounded flex items-center justify-center">
              <p className="text-gray-500">Chart: Bot usage and efficiency</p>
            </div>
          </div>

          {/* Temperature Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Temperature Trends</h2>
            <div className="bg-gray-100 h-64 rounded flex items-center justify-center">
              <p className="text-gray-500">Chart: Temperature readings over time</p>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-6 flex justify-end gap-2">
          <button className="px-6 py-2 border rounded-md hover:bg-gray-100">
            Export as CSV
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Export as PDF
          </button>
        </div>
      </main>
    </div>
  );
}
