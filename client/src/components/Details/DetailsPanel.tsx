import {RobotType} from "@/types/robot.type";
import BotPanel from "@/components/Details/BotPanel";
import {useState} from "react";
import MissionPanel from "@/components/Details/MissionPanel";
import {MissionType} from "@/types/mission.type";

function DetailsPanel({
                     selectedBot,
                     activeMission,
                 }: {
    selectedBot: RobotType;
    activeMission: MissionType | undefined;
}) {
    const [currentTab, setCurrentTab] = useState<"Mission Info" | "Bot Info">("Bot Info");

    return (
        <>
            {/* Tab Menu */}
            <div className="flex w-full overflow-hidden shadow border-b border-black">
                <button
                    onClick={() => setCurrentTab("Bot Info")}
                    style={{
                     backgroundColor: currentTab === "Bot Info" ? "#8c351bff" : "#FFFFFF",
                     color: currentTab === "Bot Info" ? "#d9d7d7ff" : "#333333", 
                    transition: "background-color 0.2s, color 0.2s",
                    }}
                    className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 rounded-md ${
                        currentTab === "Bot Info"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                    Bot Info
                </button>
                <button
                    onClick={() => setCurrentTab("Mission Info")}
                    style={{
                     backgroundColor: currentTab === "Mission Info" ? "#8c351bff" : "#FFFFFF",
                     color: currentTab === "Mission Info" ? "#d9d7d7ff" : "#333333", 
                     fontfamily: "Epilogue, sans-serif",
                    transition: "background-color 0.2s, color 0.2s",
                    }}
                    className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 rounded-md ${
                        currentTab === "Mission Info"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                    Mission Info
                </button>
            </div>

            {currentTab === 'Bot Info' && (
                <BotPanel selectedBot={selectedBot}/>
            )}

            {currentTab === 'Mission Info' && (
                <MissionPanel selectedBot={selectedBot}
                    activeMission={activeMission}/>
            )}

        </>
    );
}

export default DetailsPanel;