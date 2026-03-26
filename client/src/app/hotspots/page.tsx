'use client';

// Navigation is rendered in RootLayout; remove local render
import Link from 'next/link';
import { useState } from 'react';
import {HotspotType} from '@/types/hotspot.type';
import { useMissions } from '@/hooks/useMissions';


export default function Hotspots() {
  const { missionsData } = useMissions();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  //UI fields added to HotspotType for display purposes
  type HotspotListItem = HotspotType & {
  missionName: string;
  missionIdx: number;
  hotspotIdx: number;
  displayName: string;
  averageTemperature: string;
  displayDate: string;
  displayTime: string;
};

  // Collect all hotspots from all missions
  const allHotspots =
    missionsData?.flatMap(
      (mission, missionIdx) =>
        mission.hotspots?.map((hotspot, hotspotIdx) => {
          const detectedDate = new Date(hotspot.detectedAt);  

        return {
          ...hotspot,
          missionName: mission.missionName,
          missionIdx,
          hotspotIdx,
          displayName: `Hotspot #${hotspot.id}`,
          averageTemperature: 'N/A',
          displayDate: detectedDate.toLocaleDateString(),
          displayTime: detectedDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        }) || [],
      )|| [];

  const totalHotspots = allHotspots.length;

  return (
    <div className="bg-gray-100 min-h-full">
      <main className="mb-16 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Hotspot Management</h1>

        {/* Priority Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Total Hotspots</h3>
            <p className="text-3xl font-bold mt-2">{totalHotspots}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-3">
            <h3 className="text-gray-600 text-sm">UnResolved</h3>
            <p className="text-3xl font-bold mt-2 text-red-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-3">
            <h3 className="text-gray-600 text-sm">Resolved</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">0</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md ${
                viewMode === 'map' ? 'bg-brand-orange text-brand-white' : 'border hover:bg-gray-100'
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md ${
                viewMode === 'list'
                  ? 'bg-brand-orange text-brand-white'
                  : 'border hover:bg-gray-100'
              }`}
            >
              List View
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button className="px-6 py-3 border-b-2 border-orange-600 font-semibold">All</button>
            <button className="px-6 py-3 text-gray-600 hover:text-gray-900">Unresolved</button>
            <button className="px-6 py-3 text-gray-600 hover:text-gray-900">Resolved</button>
          </div>
        </div>

        {/* Hotspot List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Detected Hotspots</h2>

            {viewMode === 'map' ? (
              <div className="bg-gray-100 h-96 rounded flex items-center justify-center">
                <p className="text-gray-500">
                  Map view showing all hotspots (integrate with GoogleMap component)
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Average Temperature (°F)</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Mission Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Time</th>
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
                      allHotspots.map((hotspot) => (
                        <tr key={hotspot.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{hotspot.displayName}</td>
                          <td className="px-4 py-3">{hotspot.averageTemperature}</td>
                          <td className="px-4 py-3">{hotspot.missionName}</td>
                          <td className="px-4 py-3">{hotspot.displayDate}</td>
                          <td className="px-4 py-3">{hotspot.displayTime}</td>
                          <td className="px-4 py-3">
                            <Link href={`/hotspots/${hotspot.id}`}>
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
          <button className="px-6 py-2 border rounded-md hover:bg-gray-100">Export CSV</button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Export Report
          </button>
        </div>
      </main>
    </div>
  );
}
