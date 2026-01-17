"use client";

import Navigation from "@/components/Navigation";
import { useMissions } from "@/hooks/useMissions";
import { useBotData } from "@/hooks/useBotData";
import Link from "next/link";
import { useState } from "react";
import { startAndEndMissionButton, getMissionStatus } from "@/components/MissionControls/MissionStartEnd";
import { updateMissionInDB } from "@/api/missions.api";
//import MissionStartEnd, { getMissionStatus }  from "./MissionControls/MissionStartEnd";


export default function Missions() {
  const { missionsData, missionsLoading, missionsError, setMissions } = useMissions();
  const { bots, setBots } = useBotData();
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const saveUpdate = async (updatedMission: MissionType) => {
    console.log("Updating mission:", updatedMission);

    // Update missions in React state. Checks for matching missionID to replace the updated mission.
    const newMissionList = (missionsData ?? []).map(m => 
      m.missionID === updatedMission.missionID ? updatedMission : m
    );
    const updateMissionStatus=getMissionStatus(updatedMission.timeStart, updatedMission.timeEnd);
        
    if (updatedMission.botID != null) {
      let newBotStatus: RobotType["assignmentStatus"] | null = null;

      if (
        updateMissionStatus === "not started" ||
        updateMissionStatus === "completed"
      ) {
        newBotStatus = "assigned";
      } else if (updateMissionStatus === "in progress") {
        newBotStatus = "active";
      }

      if (newBotStatus) {
        setBots(prevBots =>
          prevBots.map(bot =>
            bot.id === String(updatedMission.botID)
              ? { ...bot, assignmentStatus: newBotStatus }
              : bot
          )
        );
      }
    }

    setMissions(newMissionList);

    // Push update to the database
    const response = await updateMissionInDB(updatedMission);
    console.log("Mission updated:", response);

  };

  return (
  <div className="bg-gray-100 min-h-full">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Missions</h1>
          <Link href="/missions/create">
            <button className="px-6 py-3 bg-brand-orange text-white rounded-md hover:bg-brand-orange/90">
              + Create New Mission
            </button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-3 ${
                filter === "all"
                  ? "border-b-2 border-brand-orange font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-6 py-3 ${
                filter === "active"
                  ? "border-b-2 border-orange-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-6 py-3 ${
                filter === "completed"
                  ? "border-b-2 border-orange-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Mission List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Mission List</h2>
            {missionsLoading ? (
              <div className="text-gray-500">Loading missions...</div>
            ) : !missionsData || missionsData.length === 0 ? (
              <div className="text-gray-500">
                <p>No missions found. Create your first mission to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {missionsData.map((mission, idx) => {
                  const assignedBot = bots.find((b) => Number(b.id) === mission.botID);
                  
                  return (
                    <div
                      key={idx}
                      className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{mission.missionName}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Bot</p>
                              <p className="font-medium">{assignedBot?.name || `Bot ${mission.botID}`}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Progress</p>
                              <p className="font-medium">{mission.progress}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Time Passed</p>
                              <p className="font-medium">{mission.timePassed} min</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Hotspots Found</p>
                              <p className="font-medium">{mission.hotspots?.length || 0}</p>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div
                              className="bg-brand-orange h-2 rounded-full"
                              style={{ width: `${mission.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <td className="px-4 py-2 space-y-2"> 
                          <div className="ml-4">
                            <Link href={`/missions/${idx + 1}`}>
                              <button className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-700 text-sm">
                                View Details
                              </button>
                            </Link>

                          </div>
                          {/* Start/End Mission button placed underneath */}
                          <div className="ml-4">
                            {startAndEndMissionButton(
                              mission,
                              undefined,
                              saveUpdate,
                              bots,
                              "w-full px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-700 text-sm"
                            )}
                          </div>
                        </td>
                      </div>
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
