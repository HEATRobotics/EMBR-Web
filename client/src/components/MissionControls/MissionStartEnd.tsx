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
  // In case missionStatus is not provided 
  if (!missionStatus) {
    missionStatus = getMissionStatus(mission.timeStart, mission.timeEnd);}

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Use provided missionStatus, otherwise compute it
  const status =
    missionStatus ??
    getMissionStatus(mission.timeStart, mission.timeEnd);

  if (status === 'not started') {
    const updatedMission: MissionType = { ...mission, timeStart: now };
    return saveUpdate(updatedMission);
  }

  if (status === 'in progress') {
    const updatedMission: MissionType = { ...mission, timeEnd: now };
    return saveUpdate(updatedMission);
  }
 
}

// Determine mission status. These status are not presented in the database but are useful for frontend logic.
export function getMissionStatus(start_time:string, end_time:string): 'not started' | 'in progress' | 'completed'{
  if (!start_time) return 'not started';
  if (start_time && !end_time) return 'in progress';
  return 'completed'; 
}

// Render action button based on mission status
export function startAndEndMissionButton(
  mission: MissionType,
  missionStatus?: 'not started' | 'in progress' | 'completed',
  saveUpdate: (m: MissionType) => Promise<void>,
  bots: RobotType[] | RobotType, //You can pass either a single bot or all bots
  className: string = "px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors",
  warningPanelclassName: string = "absolute top-0 left-0 -translate-x-full -translate-y-full hidden group-hover:block bg-black text-white text-xs p-2 rounded shadow-lg z-50"
) {
  //* In case missionStatus is not provided *
  if (!missionStatus) {
    
    missionStatus = getMissionStatus(mission.timeStart, mission.timeEnd);}
  
  let bot: RobotType | undefined;
  if (!Array.isArray(bots)) {
    bot = bots;
  } else {
    bot = bots.find(b => Number(b.id) === mission.botID); //Why the hell must bot ID be returned as a string???
  }

  let isDisabled = true;

  if (bot) {
    if (missionStatus === 'not started' && bot.assignmentStatus === 'assigned') {
    isDisabled = false;
    }
    if (missionStatus === 'in progress' && bot.assignmentStatus === 'active') {
      isDisabled = false;
    }
  }
  const buttonLabel =
    isDisabled
      ? "No Action"
      : missionStatus === "not started"
        ? "Start Mission"
      : missionStatus === "in progress"
        ? "End Mission"
      : "No Action";




  return (
    <div className="relative group">  
      <button
        className={`
          ${className}
          ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
          relative
        `}
        onClick={() => !isDisabled && handleStartEndMission(mission, saveUpdate, missionStatus)}
  
        disabled={isDisabled}
      >
        {buttonLabel}
      </button>
      {isDisabled && (
        <div
          className={warningPanelclassName}
        >
          Cannot start mission: Bot is busy or misison already ended
        </div>
      )}
    </div>

  )

  
  
}
