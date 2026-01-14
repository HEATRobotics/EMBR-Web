"use client";

// Navigation is rendered in RootLayout; remove local render
import { useParams } from "next/navigation";

export default function HotspotDetail() {
  const params = useParams();
  const hotspotId = params.id;

  return (
  <div className="bg-gray-100 min-h-full">
      
      <main className="mb-16 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Hotspot #{hotspotId}</h1>
            <p className="text-gray-600">Detected: N/A</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
              Mark as Investigating
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Mark as Resolved
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map and Location */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="bg-gray-200 h-96 rounded flex items-center justify-center">
                <p className="text-gray-500">Map showing hotspot location</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">GPS Coordinates</p>
                  <p className="font-mono">N/A</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Altitude</p>
                  <p className="font-mono">N/A</p>
                </div>
              </div>
            </div>

            {/* Temperature History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Temperature History</h2>
              <div className="bg-gray-100 h-64 rounded flex items-center justify-center">
                <p className="text-gray-500">Chart: Temperature readings over time</p>
              </div>
            </div>

            {/* Images/Thermal Data */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Thermal Images</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-200 h-48 rounded flex items-center justify-center">
                  <p className="text-gray-500">Thermal image</p>
                </div>
                <div className="bg-gray-200 h-48 rounded flex items-center justify-center">
                  <p className="text-gray-500">Visual image</p>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Hotspot Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                    Critical
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Temperature</p>
                  <p className="text-2xl font-bold">N/A</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">First Detected</p>
                  <p>N/A</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p>N/A</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold">New</p>
                </div>
              </div>
            </div>

            {/* Mission Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Mission Info</h2>
              <div className="space-y-2">
                <p><span className="text-sm text-gray-600">Mission:</span> N/A</p>
                <p><span className="text-sm text-gray-600">Bot:</span> N/A</p>
              </div>
            </div>

            {/* Assignment */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Field Assignment</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Assign to Team Member
                  </label>
                  <select className="w-full px-4 py-2 border rounded-md">
                    <option>Select member...</option>
                  </select>
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Assign
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <textarea
                className="w-full px-4 py-2 border rounded-md"
                rows={4}
                placeholder="Add notes about this hotspot..."
              />
              <button className="mt-2 w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                Save Notes
              </button>
            </div>
          </div>
        </div>

        {/* Action Log */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Action Log</h2>
          <div className="text-gray-500">
            <p>No actions recorded yet</p>
          </div>
        </div>
      </main>
    </div>
  );
}
