import {RobotType} from "@/types/robot.type";
import {useState} from "react";
import JanusStreaming from "@/components/VideoStream";
import BotInfoPanel from "@/components/Details/BotInfo/BotInfoPanel";


function BotPanel({ activeBot }: { activeBot: RobotType }) {
    const [activeTab, setActiveTab] = useState<"Flir" | "FPV">("Flir");


    return (
        <>
            {/* Tab Menu */}
            <div className="flex w-full overflow-hidden shadow border-b border-black">
                <button
                    onClick={() => setActiveTab("Flir")}
                    className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
                        activeTab === "Flir"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                    Flir
                </button>
                <button
                    onClick={() => setActiveTab("FPV")}
                    className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
                        activeTab === "FPV"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                    FPV
                </button>
            </div>

            {activeTab === "FPV" && (
                <>
                    {/*<JanusStreaming/>*/}
                    <div className="w-full overflow-hidden shadow bg-white">
                        <img
                            src="/fpv_sample.jpg"
                            alt="LiDAR Image"
                            className="w-full max-h-80 object-contain"
                        />
                    </div>
                </>
            )}

            {activeTab === "Flir" && (
                <div className="w-full overflow-hidden shadow bg-white">
                    <img
                        src="/flir_sample.png"
                        alt="Flir Image"
                        className="w-full max-h-80 object-contain"
                    />
                </div>
            )}

            <BotInfoPanel activeBot={activeBot}/>
        </>
    )
}

export default BotPanel;