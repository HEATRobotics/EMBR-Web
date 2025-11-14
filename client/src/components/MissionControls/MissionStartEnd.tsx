import React from "react";
import { MissionType } from "@/types/mission.type";

type MissionStartEndProps = {
  missionsData: MissionType[];
};

export default function MissionStartEnd({ missionsData }: MissionStartEndProps) {
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
              <th className="px-4 py-2 border-b">Bot ID</th>
              <th className="px-4 py-2 border-b">Start</th>
              <th className="px-4 py-2 border-b">End</th>
              <th className="px-4 py-2 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {missionsData?.map((mission) => (
              <tr key={mission.botID} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2 border-b font-medium text-gray-800">
                  {mission.missionName}
                </td>
                <td className="px-4 py-2 border-b text-gray-600">{mission.botID}</td>
                <td className="px-4 py-2 border-b text-gray-600">
                  {mission.timeStart || "—"}
                </td>
                <td className="px-4 py-2 border-b text-gray-600">
                  {mission.timeEnd || "—"}
                </td>
                <td className="px-4 py-2 border-b">
                  <button
                    className="px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    Start/End
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> 
    </div>
  );
}
