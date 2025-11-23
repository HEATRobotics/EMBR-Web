import React from "react";
import { MissionType } from "@/types/mission.type";
import { useMissions } from "@/hooks/useMissions";
import { useBotData } from "@/hooks/useBotData";
import { RobotType } from "@/types/robot.type";

type MissionStartEndProps = {
  missionsData: MissionType[];
  saveUpdate: (updatedMission: MissionType) => Promise<void>;
};

export default function MissionStartEnd({ missionsData, saveUpdate, bots }: MissionStartEndProps) {
  //const { bots, botsLoading, botError } = useBotData();
  console.log("Bots is from MissionStartEnd:", bots);
  return (
    <div
      className="z-[20] absolute right-4 top-20 w-auto max-h-[350px] overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg overflow-auto"
      style={{ pointerEvents: "auto" }}
    >
      <div className="p-4 font-semibold border-b border-gray-100">
        Missions
      </div>

      <div className="p-4">
        <table className="min-w-full border border-gray-200 text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border-b">Mission Name</th>
              <th className="px-4 py-2 border-b">Mission ID</th>
              <th className="px-4 py-2 border-b">Bot ID</th>
              <th className="px-4 py-2 border-b">Mission Status</th>
              <th className="px-4 py-2 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {missionsData?.map((mission) => {
              const missionStatus = getMissionStatus(mission.timeStart, mission.timeEnd);
              

              return (
                <tr key={mission.missionID} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 border-b font-medium text-gray-800">
                    {mission.missionName}
                  </td>

                  <td className="px-4 py-2 border-b font-medium text-gray-800">
                    {mission.missionID}
                  </td>

                  <td className="px-4 py-2 border-b text-gray-600">
                    {mission.botID}
                  </td>

                  <td className="px-4 py-2 border-b text-gray-600">
                    {missionStatus}
                  </td>

                  <td className="px-4 py-2 border-b">
                    {startAndEndMissionButton(
                      mission,
                      missionStatus,
                      saveUpdate,
                      bots
                      )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div> 
    </div>
  );
}

// Mission logic update
function handleStartEndMission(
  mission: MissionType,
  saveUpdate: (m: MissionType) => Promise<void>,
  missionStatus?: 'not started' | 'in progress' | 'completed',
) {
  {/* In case missionStatus is not provided */}
  if (!missionStatus) {
    console.log("Mission status not provided, computing manually");
    missionStatus = getMissionStatus(mission.timeStart, mission.timeEnd);}

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Use provided missionStatus, otherwise compute it
  const status =
    missionStatus ??
    getMissionStatus(mission.timeStart, mission.timeEnd);

  if (status === 'not started') {
    const updatedMission: MissionType = { ...mission, timeStart: now };
    console.log("timeStart Updated Mission:", updatedMission);
    return saveUpdate(updatedMission);
  }

  if (status === 'in progress') {
    const updatedMission: MissionType = { ...mission, timeEnd: now };
    console.log("timeEnd Updated Mission:", updatedMission);
    return saveUpdate(updatedMission);
  }

  console.log("Mission already completed. No action taken.");
}

// Determine mission status. These status are not presented in the database but are useful for frontend logic.
function getMissionStatus(start_time:string, end_time:string): 'not started' | 'in progress' | 'completed'{
  if (!start_time) return 'not started';
  if (start_time && !end_time) return 'in progress';
  return 'completed'; 
}

// Render action button based on mission status
export function startAndEndMissionButton(
  mission: MissionType,
  missionStatus?: 'not started' | 'in progress' | 'completed',
  saveUpdate: (m: MissionType) => Promise<void>,
  bots: RobotType[],
  className?: string
) {
  {/* In case missionStatus is not provided */}
  if (!missionStatus) {
    console.log("Mission status not provided, computing manually");
    missionStatus = getMissionStatus(mission.timeStart, mission.timeEnd);}
  {/* in case class name is not provided */}
  if (!className) {
    className = "px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors";
  }


  const bot = bots.find(b => Number(b.id) === mission.botID); //Why the hell must bot ID be returned as a string???
  let showButton = false;
  if (bot) {
    if (missionStatus === 'not started' && bot.assignmentStatus === 'assigned') {
    showButton = true;
    }
    if (missionStatus === 'in progress' && bot.assignmentStatus === 'active') {
      showButton = true;
    }
  }
  
  if (showButton) {
    const buttonLabel =
      missionStatus === "not started"
        ? "Start"
        : missionStatus === "in progress"
        ? "End"
        : "Completed"; //This is just for reference, button will always show "Start or End"
    return (
    <button
      className={className}
      onClick={() => handleStartEndMission(mission, saveUpdate, missionStatus)}
    >
      {buttonLabel}

    </button>
  );  } else {
    return (
      null
    );
  }

  
}
