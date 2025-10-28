import React from "react";
import { MissionType} from "../../types/mission.type";
import { RobotType } from "../../types/robot.type";
import { convertMinutes } from "../../utils/convertMinutes";

const StatLine = ({ name, value }: { name: string; value: string }) => (
  <p className="text-[15px] leading-[18px]">
    {name}: <span className="text-[#FF5001]">{value}</span>
  </p>
);

function Stats({ missions, bots }: Readonly<{ missions: MissionType[], bots?: RobotType[] }>) {
  // Calculate bot statistics if bots are provided
  const readyBots = bots?.filter(bot => bot.assignmentStatus === "ready").length || 0;
  const assignedBots = bots?.filter(bot => bot.assignmentStatus === "assigned").length || 0;
  const totalBots = bots?.length || 0;
  
  return (
    <div className="flex flex-col gap-y-3 w-full text-[20px] leading-6">
      <div className="flex flex-col py-5 px-[30px] gap-y-2.5 rounded-[22px] bg-white">
        <p className="mb-2.5">Fleet Stats</p>
        {bots && (
          <>
            <StatLine
              name="Ready Bots"
              value={`${readyBots}/${totalBots} available`}
            />
            <StatLine
              name="Assigned Bots"
              value={`${assignedBots}/${totalBots} on missions`}
            />
          </>
        )}
        <StatLine
          name="Total Missions"
          value={`${missions.length} mission${
            missions.length === 1 ? "" : "s"
          } in the system`}
        />
      </div>
      <div className="flex flex-col gap-y-3 w-full overflow-auto h-full max-h-[calc(100vh-320px)]">
        {missions.map((mission, i) => (
          <div
            key={i}
            className="flex flex-col py-6 px-[30px] gap-y-2.5 rounded-[22px] bg-white"
          >
            <p className="mb-2.5">{mission.missionName} Stats</p>
            <div className="w-full flex justify-start items-center gap-x-3">
              <div className="rounded-[22px] bg-white border-2 border-black max-w-[293px] h-[30px] w-full relative">
                <div
                  className="bg-[#FF5001] rounded-[22px] absolute left-0 top-0 h-full"
                  style={{ width: `${mission.process}%` }}
                ></div>
              </div>
              <span className="text-[15px] leading-[18px] text-[#FF5001]">
                {mission.process}%
              </span>
            </div>
            <StatLine
              name="# of smokes"
              value={`${mission.smokesDetected} smokes detected`}
            />
            <StatLine
              name="Average Temp of the area"
              value={`${mission.averageTemperature || "-"}C°`}
            />
            <StatLine
              name="Time Passed"
              value={`${convertMinutes(mission.timePassed)} `}
            />
            <StatLine
              name="Time Estimated"
              value={`${convertMinutes(mission.timeEstimated)} `}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Stats;
