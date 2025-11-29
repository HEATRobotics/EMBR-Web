import {RobotType} from "@/types/robot.type";
import {useState} from "react";
import JanusStreaming from "@/components/VideoStream";
import BotInfoPanel from "@/components/Details/BotInfo/BotInfoPanel";


function BotPanel({ selectedBot }: { selectedBot: RobotType }) {
    const [currentTab, setCurrentTab] = useState<"Flir" | "FPV">("Flir");

    //border-b border-black

    return (
        <>
            {/* Tab Menu */}
            <div className="flex w-full overflow-hidden shadow gap-3 justify-center">      
                <button
                    onClick={() => setCurrentTab("Flir")}
                    style={{
                     backgroundColor: currentTab === "Flir" ? "#262626"  : "#FFFFFF",
                     color: currentTab === "Flir" ? "#ee2b2493" : "#333333", 
                     transition: "background-color 0.2s, color 0.2s",
                    }}
                    className={` py-2 px-20 mt-1 mb-2 text-center text-xl font-afacad font-semibold transition-colors duration-200 rounded-md ${
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
                     backgroundColor: currentTab === "FPV" ? "#262626"  : "#FFFFFF",
                     color: currentTab === "FPV" ? "#8c351bff" : "#333333", 
                    transition: "background-color 0.2s, color 0.2s",
                    }}
                    className={`py-2 px-20 mt-1 mb-2 text-center text-xl font-afacad font-semibold transition-colors duration-200 rounded-md ${
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