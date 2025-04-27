import {RobotType} from "@/types/robot.type";
import BotPanel from "@/components/Details/BotPanel";
import {useState} from "react";
import MissionPanel from "@/components/Details/MissionPanel";

function DetailsPanel({
                     activeBot,
                 }: {
    activeBot: RobotType;
}) {
    const [activeTab, setActiveTab] = useState<"Mission Info" | "Bot Info">("Bot Info");


    return (
        <>
            {/* Tab Menu */}
            <div className="flex w-full overflow-hidden shadow border-b border-black">
                <button
                    onClick={() => setActiveTab("Bot Info")}
                    className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
                        activeTab === "Bot Info"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                    Bot Info
                </button>
                <button
                    onClick={() => setActiveTab("Mission Info")}
                    className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
                        activeTab === "Mission Info"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                    Mission Info
                </button>
            </div>

            {activeTab === 'Bot Info' && (
                <BotPanel activeBot={activeBot}/>
            )}

            {activeTab === 'Mission Info' && (
                <MissionPanel activeBot={activeBot}/>
            )}

        </>
    );
}

export default DetailsPanel;