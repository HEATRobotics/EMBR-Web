import {RobotType} from "@/types/robot.type";
import {useState} from "react";
import JanusStreaming from "@/components/VideoStream";
import BotInfoPanel from "@/components/Details/BotInfo/BotInfoPanel";


function BotPanel({ selectedBot }: { selectedBot: RobotType }) {
    const [currentTab, setCurrentTab] = useState<"Flir" | "FPV">("Flir");


    return (
        <>
            {/* Tab Menu */}
            <div className="flex w-full overflow-hidden shadow border-b border-black">
                <button
                    onClick={() => setCurrentTab("Flir")}
                    style={{
                     backgroundColor: currentTab === "Flir" ? "#a5592aff" : "#FFFFFF",
                     color: currentTab === "Flir" ? "#d9d7d7ff" : "#333333", 
                     transition: "background-color 0.2s, color 0.2s",
                    }}
                    className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 rounded-md ${
                        currentTab === "Flir"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                    Flir
                </button>
                <button
                    onClick={() => setCurrentTab("FPV")}
                    style={{
                     backgroundColor: currentTab === "FPV" ? "#a5592aff" : "#FFFFFF",
                     color: currentTab === "FPV" ? "#d9d7d7ff" : "#333333", 
                    transition: "background-color 0.2s, color 0.2s",
                    }}
                    className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 rounded-md ${
                        currentTab === "FPV"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                    FPV
                </button>
            </div>

            {currentTab === "FPV" && (
                <>
                    {/*<JanusStreaming/>*/}
                    <div className="w-full overflow-hidden shadow bg-white">
                        <img
                            src="/fpv_sample.jpg"
                            alt="fpv Image"
                            className="w-full max-h-80 object-contain"
                        />
                    </div>
                </>
            )}

            {currentTab === "Flir" && (
                <div className="w-full overflow-hidden shadow bg-white">
                    <img
                        src="/flir_sample.png"
                        alt="Flir Image"
                        className="w-full max-h-80 object-contain"
                    />
                </div>
            )}

            <BotInfoPanel selectedBot={selectedBot}/>
        </>
    )
}

export default BotPanel;