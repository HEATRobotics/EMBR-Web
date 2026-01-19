"use client";

import Navigation from "@/components/Navigation";
import { useParams } from "next/navigation";
import { useBotData } from "@/hooks/useBotData";
import { useMissions } from "@/hooks/useMissions";
import BotPanel from "@/components/Details/BotPanel";
import TemperatureChart from "@/components/TemperatureChart";
import BatteryChart from "@/components/BatteryChart";
import StatusOverviewComponent from "@/components/FleetDetails/StatusOverview";



export default function BotDetail() {
  const params = useParams();
  const botId = params.id;
  
  const { bots } = useBotData();
  const { missionsData } = useMissions();
  
  const selectedBot = bots.find((b) => b.id === botId);
  const botMission = missionsData?.find((m) => m.botID === Number(botId));

  if (!selectedBot) {
    return (
  <div className="bg-gray-100 min-h-full">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <p>Bot not found</p>
        </main>
      </div>
    );
  }

  return (
  <div className="bg-gray-100 min-h-full">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Bot #{selectedBot.id}</h1>
            <p className="text-gray-600">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                selectedBot.operationalStatus === 'operational' ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              {selectedBot.operationalStatus}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border rounded-md hover:bg-gray-100">
              Edit Configuration
            </button>
            <button className="px-4 py-2 border rounded-md hover:bg-gray-100">
              Delete Bot
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bot Panel with Camera Views */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <BotPanel selectedBot={selectedBot} />
            </div>

            {/* Mission History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Mission History</h2>
              <div className="text-gray-500">
                {botMission ? (
                  <div>
                    <p><span className="font-medium">Current Mission:</span> {botMission.missionName}</p>
                    <p><span className="font-medium">Progress:</span> {botMission.progress}%</p>
                  </div>
                ) : (
                  <p>No missions completed yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <StatusOverviewComponent />
            </div>

            {/* Bot Specifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Specifications</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {selectedBot.name}</p>
                <p><span className="font-medium">ID:</span> {selectedBot.id}</p>
                <p><span className="font-medium">Assignment:</span> {selectedBot.assignmentStatus}</p>
                <p><span className="font-medium">Location:</span> {selectedBot.lat.toFixed(4)}, {selectedBot.lng.toFixed(4)}</p>
                <p><span className="font-medium">Heading:</span> {selectedBot.heading}°</p>
              </div>
            </div>

            {/* Current Assignment */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Current Assignment</h2>
              {botMission ? (
                <div>
                  <p className="font-medium">{botMission.missionName}</p>
                  <p className="text-sm text-gray-600 mt-1">Progress: {botMission.progress}%</p>
                </div>
              ) : (
                <p className="text-gray-500">Not assigned to any mission</p>
              )}
            </div>

            {/* Sensors */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Sensors</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Thermal Camera</span>
                  <span className="text-sm text-green-600">●</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">GPS</span>
                  <span className="text-sm text-green-600">●</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Temperature Sensor</span>
                  <span className="text-sm text-green-600">●</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
