import { RobotType } from "@/types/robot.type";
import BotPanel from "@/components/Details/BotPanel";
import { useState } from "react";
import MissionPanel from "@/components/Details/MissionPanel";
import { MissionType } from "@/types/mission.type";

function DetailsPanel({
  selectedBot,
  activeMission,
  onClose,
}: {
  selectedBot: RobotType;
  activeMission: MissionType | undefined;
  onClose: () => void;
}) {
  const [currentTab, setCurrentTab] =
    useState<"Mission Info" | "Bot Info">("Bot Info");

  return (
    <div className="relative h-full">

      {/* Top black tab with close button */}
      <div className="bg-black h-10 flex items-center justify-center rounded-t-md relative">

        {/* Handle */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 
                        w-14 h-2 rounded-full bg-gray-700 opacity-80" />

        {/* The ONLY bordered element */}
        <button
          onClick={onClose}
          aria-label="Close details panel"
          title="Close"
          className="absolute right-3 top-1/2 -translate-y-1/2
             px-2 py-1 text-white text-xl font-bold rounded
             hover:bg-gray-800 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Content container */}
      <div className="flex flex-col h-[calc(100%-2.5rem)] overflow-hidden border border-t-0 border-black">

        {/* Tab Menu*/}
        <div className="flex w-full border-b border-black">
          <button
            onClick={() => setCurrentTab("Bot Info")}
            className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
              currentTab === "Bot Info"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}
          >
            Bot Info
          </button>

          <button
            onClick={() => setCurrentTab("Mission Info")}
            className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
              currentTab === "Mission Info"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}
          >
            Mission Info
          </button>
        </div>

        {/* Inner content – NO borders added */}
        <div className="flex-1 overflow-y-auto">
          {currentTab === "Bot Info" && (
            <BotPanel selectedBot={selectedBot} onClose={onClose} />
          )}

          {currentTab === "Mission Info" && (
            <MissionPanel
              selectedBot={selectedBot}
              activeMission={activeMission}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailsPanel;