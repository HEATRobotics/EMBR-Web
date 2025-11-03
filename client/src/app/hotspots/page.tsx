"use client";

import Navigation from "@/components/Navigation";
import { useMissions } from "@/hooks/useMissions";
import { useState } from "react";
import Link from "next/link";

export default function Hotspots() {
  const { missionsData } = useMissions();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  
  // Collect all hotspots from all missions
  const allHotspots = missionsData?.flatMap((mission, missionIdx) => 
    mission.hotspots?.map((hotspot, hotspotIdx) => ({
      ...hotspot,
      missionName: mission.missionName,
      missionIdx,
      hotspotIdx,
    })) || []
  ) || [];

  const totalHotspots = allHotspots.length;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Hotspot Management</h1>

        {/* Priority Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Total Hotspots</h3>
            <p className="text-3xl font-bold mt-2">{totalHotspots}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
            <h3 className="text-gray-600 text-sm">Critical</h3>
            <p className="text-3xl font-bold mt-2 text-red-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
            <h3 className="text-gray-600 text-sm">High</h3>
            <p className="text-3xl font-bold mt-2 text-orange-600">{totalHotspots}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm">Resolved</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">0</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-md ${
                viewMode === "list"
                  ? "bg-orange-600 text-white"
                  : "border hover:bg-gray-100"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-md ${
                viewMode === "map"
                  ? "bg-orange-600 text-white"
                  : "border hover:bg-gray-100"
              }`}
            >
              Map View
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button className="px-6 py-3 border-b-2 border-orange-600 font-semibold">
              All
            </button>
            <button className="px-6 py-3 text-gray-600 hover:text-gray-900">
              New
            </button>
            <button className="px-6 py-3 text-gray-600 hover:text-gray-900">
              Investigating
            </button>
            <button className="px-6 py-3 text-gray-600 hover:text-gray-900">
              Resolved
            </button>
          </div>
        </div>

        {/* Hotspot List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Detected Hotspots</h2>
            
            {viewMode === "map" ? (
              <div className="bg-gray-100 h-96 rounded flex items-center justify-center">
                <p className="text-gray-500">Map view showing all hotspots (integrate with GoogleMap component)</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Priority</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Location (GPS)</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Mission</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allHotspots.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          No hotspots detected yet
                        </td>
                      </tr>
                    ) : (
                      allHotspots.map((hotspot, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded font-semibold">
                              High
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-sm">
                            {hotspot.lat.toFixed(4)}, {hotspot.lng.toFixed(4)}
                          </td>
                          <td className="px-4 py-3">{hotspot.missionName}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              New
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/hotspots/${idx + 1}`}>
                              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                                View
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-6 flex justify-end gap-2">
          <button className="px-6 py-2 border rounded-md hover:bg-gray-100">
            Export CSV
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Export Report
          </button>
        </div>
      </main>
    </div>
  );
}
