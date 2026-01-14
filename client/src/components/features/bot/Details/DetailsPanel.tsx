import {RobotType} from "@/types/robot.type";
import BotPanel from "@/components/features/bot/Details/BotPanel";
import {useState} from "react";
import MissionPanel from "@/components/features/bot/Details/MissionPanel";
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