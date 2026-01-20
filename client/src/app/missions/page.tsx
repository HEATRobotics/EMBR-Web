"use client";

import Navigation from "@/components/Navigation";
import { useMissions } from "@/hooks/useMissions";
import { useBotData } from "@/hooks/useBotData";
import Link from "next/link";
import { useState } from "react";
import MissionPanel from "@/components/Details/MissionPanel";
import { Trash2 } from "lucide-react";
import { deleteMission } from "@/api/missions.api";
import { useRouter } from "next/navigation";


export default function Missions() {
  const [isEditMode, setIsEditMode] = useState(false);
  const { missionsData, missionsLoading, setMissions } = useMissions();
  const { bots } = useBotData();
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const router = useRouter();

const handleDelete = async (missionId: number, missionName: string) => {
  const confirmed = window.confirm(`Are you sure you want to delete mission "${missionName}"?`);
  if (!confirmed) return;

    try {
      const response = await deleteMission(missionId.toString());
      alert(response.message);
      // Update local state so UI rerenders immediately
      setMissions((prev) => (prev ? prev.filter((m) => m.missionID !== missionId) : null));
      
  } catch (error: any) {
    alert(error.message || 'Failed to delete mission.');
  }
};

  return (
  <div className="bg-gray-100 min-h-full">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
  <h1 className="text-3xl font-bold">Missions</h1>

  <div className="flex items-center gap-3">
    {!isEditMode && (
      <button
        onClick={() => setIsEditMode(true)}
        className="px-6 py-3 bg-white text-gray-800 rounded-md
                   border border-gray-300
                   hover:bg-gray-100 hover:border-gray-400
                   transition-colors"
      >
        Edit Missions
      </button>
    )}

    {isEditMode && (
      <button
        onClick={() => setIsEditMode(false)}
        className="px-6 py-3 bg-red-50 text-red-600 rounded-md
                   border border-red-200
                   hover:bg-red-100 transition-colors"
      >
        Cancel Editing
      </button>
    )}
    <Link href="/missions/create">
      <button className="px-6 py-3 bg-brand-orange text-white rounded-md hover:bg-brand-orange/90">
        + Create New Mission
      </button>
    </Link>
  </div>
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
                {missionsData.map((mission) => {
                  const assignedBot = bots.find((b) => Number(b.id) === mission.botID);
                  
                  return (
                    <div
 
  key={mission.missionID}
  onClick={() => {
    if (!isEditMode) return;

    setIsEditMode(false);
    // later: router.push(`/missions/${mission.missionID}/edit`);
  }}
  className={`rounded-lg p-4 transition-colors
    ${
      isEditMode
        ? 'border-2 border-brand-orange cursor-pointer hover:bg-brand-orange/50'
        : 'border hover:shadow-lg'
    }
  `}
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
                        
                        <div className="ml-4">
                          <Link href={`/missions/${mission.missionID}`}>
                            <button className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-700 text-sm">
                              View Details
                            </button>
                          </Link>

                           {/*Delete button thats included in the loop*/}
                          <button
                            // Call the handler function, passing the ID and Name
                           onClick={() => handleDelete(mission.missionID, mission.missionName)}
                            className="w-full mt-3 px-6 py-2 bg-red-100 hover:bg-red-200 rounded-md flex items-center justify-center gap-2 shadow"
>
  <Trash2 size={20} color="red" />
  </button>
                        </div>
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