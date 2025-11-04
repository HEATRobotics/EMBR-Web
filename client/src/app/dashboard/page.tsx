"use client";

import Navigation from "@/components/Navigation";
import { useBotData } from "@/hooks/useBotData";
import { useMissions } from "@/hooks/useMissions";
import Link from "next/link";

export default function Dashboard() {
  const { bots } = useBotData();
  const { missionsData } = useMissions();

  const activeMissions = missionsData?.length || 0;
  const onlineBots = bots.filter((b) => b.operationalStatus === "operational").length;
  
  // Count hotspots from all missions
  const totalHotspots = missionsData?.reduce((acc, mission) => {
    return acc + (mission.hotspots?.length || 0);
  }, 0) || 0;

  return (
  <div className="bg-gray-100 min-h-full">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Active Missions</h3>
            <p className="text-3xl font-bold mt-2">{activeMissions}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Online Bots</h3>
            <p className="text-3xl font-bold mt-2">{onlineBots}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Total Hotspots</h3>
            <p className="text-3xl font-bold mt-2">{totalHotspots}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Total Bots</h3>
            <p className="text-3xl font-bold mt-2">{bots.length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Link href="/">
              <button className="px-6 py-3 text-white rounded-md hover:bg-brand-orange">
                Go to Map View
              </button>
            </Link>
            <Link href="/bots">
              <button className="px-6 py-3 text-white rounded-md hover:bg-brand-orange">
                View All Bots
              </button>
            </Link>
            <Link href="/hotspots">
              <button className="px-6 py-3 text-white rounded-md hover:bg-brand-orange">
                View Hotspots
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Activity / Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Bot Status</h2>
            <div className="space-y-3">
              {bots.length === 0 ? (
                <p className="text-gray-500">No bots available</p>
              ) : (
                bots.slice(0, 5).map((bot) => (
                  <div key={bot.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{bot.name}</p>
                      <p className="text-sm text-gray-600">{bot.assignmentStatus}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      bot.operationalStatus === "operational"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {bot.operationalStatus}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Active Missions</h2>
            <div className="space-y-3">
              {!missionsData || missionsData.length === 0 ? (
                <p className="text-gray-500">No active missions</p>
              ) : (
                missionsData.map((mission, idx) => (
                  <div key={idx} className="border-b pb-2">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{mission.missionName}</p>
                      <span className="text-sm text-gray-600">{mission.progress}%</span>
                    </div>
                    <p className="text-sm text-gray-600">Bot ID: {mission.botID}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-brand-orange h-2 rounded-full"
                        style={{ width: `${mission.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
