"use client";

import Navigation from "@/components/Navigation";

export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <ul className="space-y-2">
              <li>
                <button className="w-full text-left px-4 py-2 bg-orange-100 text-orange-900 rounded-md">
                  General
                </button>
              </li>
              <li>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md">
                  Detection Thresholds
                </button>
              </li>
              <li>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md">
                  Alerts & Notifications
                </button>
              </li>
              <li>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md">
                  Bot Configuration
                </button>
              </li>
              <li>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md">
                  Map Preferences
                </button>
              </li>
              <li>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md">
                  System
                </button>
              </li>
            </ul>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">General Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-md"
                    placeholder="Fire Department Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Time Zone
                  </label>
                  <select className="w-full px-4 py-2 border rounded-md">
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC-7 (Mountain Time)</option>
                    <option>UTC-6 (Central Time)</option>
                    <option>UTC-5 (Eastern Time)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Unit System
                  </label>
                  <select className="w-full px-4 py-2 border rounded-md">
                    <option>Metric (°C, meters)</option>
                    <option>Imperial (°F, feet)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Temperature Thresholds */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Temperature Thresholds</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Normal Temperature Range
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      className="flex-1 px-4 py-2 border rounded-md"
                      placeholder="Min"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      className="flex-1 px-4 py-2 border rounded-md"
                      placeholder="Max"
                    />
                    <span>°C</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Moderate Concern Threshold
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      className="flex-1 px-4 py-2 border rounded-md"
                      placeholder="e.g., 50"
                    />
                    <span>°C</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    High Priority Threshold
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      className="flex-1 px-4 py-2 border rounded-md"
                      placeholder="e.g., 100"
                    />
                    <span>°C</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Critical Alert Threshold
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      className="flex-1 px-4 py-2 border rounded-md"
                      placeholder="e.g., 200"
                    />
                    <span>°C</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Alert Preferences</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Enable sound alerts for new hotspots</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Enable email notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Enable SMS alerts for critical temperatures</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Show desktop notifications</span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-2">
              <button className="px-6 py-2 border rounded-md hover:bg-gray-100">
                Reset to Defaults
              </button>
              <button className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
