"use client";

import Navigation from "@/components/Navigation";
import { useBotData } from "@/hooks/useBotData";
import { useMissions } from "@/hooks/useMissions";
import Link from "next/link";
import { RobotOperationalStatusType } from "@/constants/robotConstants";
import Operation from "antd/es/transfer/operation";

export default function Bots() {
  const { bots, botsLoading } = useBotData();
  const { missionsData } = useMissions();

  const totalBots = bots.length;
  const onlineBots = bots.filter((b) => b.operationalStatus === "operational").length;
  const onMission = bots.filter((b) => b.assignmentStatus === "assigned").length;

  return (
  <div className="bg-gray-100 min-h-full">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Bot Management</h1>
          <button className="px-6 py-3 bg-brand-blue text-white rounded-md hover:bg-brand-blue/90">
            + Add New Bot
          </button>
        </div>

        {/* Bot Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Total Bots</h3>
            <p className="text-3xl font-bold mt-2">{totalBots}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Online</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">{onlineBots}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">On Mission</h3>
            <p className="text-3xl font-bold mt-2">{onMission}</p>
          </div>
        </div>

        {/* Bot List/Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Bots</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 border rounded-md hover:bg-gray-100">
                  Grid View
                </button>
                <button className="px-4 py-2 border rounded-md hover:bg-gray-100">
                  List View
                </button>
              </div>
            </div>
            
            {botsLoading ? (
              <div className="text-gray-500 text-center py-8">Loading bots...</div>
            ) : bots.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No bots available</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bots.map((bot) => {
                  const botMission = missionsData?.find((m) => m.botID === Number(bot.id));
                  
                  return (
                    <div key={bot.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{bot.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${
                          bot.operationalStatus === "operational"
                            ? "bg-green-100 text-green-800"
                            : bot.operationalStatus === "chargingRequired"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {RobotOperationalStatusType[bot.operationalStatus].text}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600">Temperature:</span> {bot.temperature.toFixed(1)}°C</p>
                        <p><span className="text-gray-600">Status:</span> {bot.assignmentStatus}</p>
                        <p><span className="text-gray-600">Mission:</span> {botMission?.missionName || "None"}</p>
                      </div>
                      <Link href={`/bots/${bot.id}`}>
                        <button className="mt-3 w-full px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue/90 text-sm">
                          View Details
                        </button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
