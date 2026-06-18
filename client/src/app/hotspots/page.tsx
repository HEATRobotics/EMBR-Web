'use client';


// Navigation is rendered in RootLayout; remove local render
import Link from 'next/link';
import { useState } from 'react';
import {HotspotType} from '@/types/hotspot.type';
import CustomGoogleMap from '@/components/features/map/GoogleMap'; 

import { useMissions } from '@/hooks/useMissions';
import { useHotspots } from '@/hooks/useHotspots';


export default function Hotspots() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');

  //UI fields added to HotspotType for display purposes
  type HotspotListItem = HotspotType & {
  missionName: string;
  displayName: string;
  averageTemperature: number | null | string;
  displayDate: string;
  displayTime: string;
};


  // Collect all hotspots from all missions
  const { hotspots, hotspotsLoading, hotspotError} = useHotspots(); 
  const { missionsData } = useMissions();
  const uniqueHotspots=Array.from(new Map(hotspots.map(h => [h.id, h])).values()); // Remove duplicates based on hotspot ID
const allHotspots: HotspotListItem[] = uniqueHotspots.map((hotspot) => {
  const detectedDate = new Date(hotspot.detectedAt);

  const missionName =
    hotspot.missionName ?? 'N/A';

  return {
    ...hotspot,
    missionName,
    displayName:
      typeof window !== 'undefined'
        ? localStorage.getItem(`hotspot-name-${hotspot.id}`) ?? `Hotspot #${hotspot.id}`
        : `Hotspot #${hotspot.id}`,
    averageTemperature:
      hotspot.averageTemperature != null && !isNaN(Number(hotspot.averageTemperature))
        ? Number(hotspot.averageTemperature).toFixed(2)
        : 'N/A',
    displayDate: detectedDate.toLocaleDateString(),
    displayTime: detectedDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
});
  const totalHotspots = allHotspots.length;
  const filteredHotspots = allHotspots.filter((hotspot)=>{
    if (activeFilter === 'all') return true;
    return hotspot.status === activeFilter;
  })

  return (
    <div className="bg-gray-100 min-h-screen pt-10">
      <main className="mb-16 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Hotspot Management</h1>

        {/* Priority Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Total Hotspots</h3>
            <p className="text-3xl font-bold mt-2">{totalHotspots}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-3">
            <h3 className="text-gray-600 text-sm">Unresolved</h3>
            <p className="text-3xl font-bold mt-2 text-red-600">{allHotspots.filter(h => h.status === 'unresolved').length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-3">
            <h3 className="text-gray-600 text-sm">Resolved</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">{allHotspots.filter(h => h.status === 'resolved').length}</p>
          </div>
        </div>

        {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md ${
                viewMode === 'map' ? 'bg-brand-orange text-brand-white' : 'border hover:bg-white/5 transition-colors duration-200'
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md ${
                viewMode === 'list' ? 'bg-brand-orange text-brand-white' : 'border hover:bg-white/5 transition-colors duration-200'
              }`} 
            >
              List View
            </button>
          </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button 
              onClick ={() =>setActiveFilter('all')} 
              className={`px-6 py-3 border-b-2 font-semibold ${
              activeFilter==='all' ? 'border-b-2 border-orange-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveFilter('unresolved')} 
              className={`px-6 py-3 border-b-2 font-semibold ${
              activeFilter==='unresolved' ? 'border-b-2 border-orange-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unresolved
            </button>
            <button 
              onClick={() => setActiveFilter('resolved')} 
              className={`px-6 py-3 border-b-2 font-semibold ${
              activeFilter==='resolved' ? 'border-b-2 border-orange-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Hotspot List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Detected Hotspots</h2>

            {viewMode === 'map' ? (
              <div className="h-96 rounded overflow-hidden">
                <CustomGoogleMap
                  bots = {[]}
                  missionsData= {missionsData}
                  drawingMode = {false}
                  showSearch = {false}
                />
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
                      <th className="px-4 py-3 text-left text-sm font-semibold">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHotspots.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          No hotspots detected yet
                        </td>
                      </tr>
                    ) : (
                      filteredHotspots.map((hotspot) => (
                       
                        <tr key={hotspot.id} className="border-t hover:bg-white/5 transition-colors duration-200">
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
