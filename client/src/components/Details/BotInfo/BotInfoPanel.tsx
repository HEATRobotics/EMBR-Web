import {RobotType} from "@/types/robot.type";
import {useState} from "react";
import InfoGrid from "@/components/Details/BotInfo/InfoGrid";
import TemperatureChart from "@/components/TemperatureChart";
import LidarVisualizer from "@/components/Lidar/LidarVisualizer";



function BotInfoPanel({
                          activeBot,
                      }: {
    activeBot: RobotType;
}) {
    const [activeTab, setActiveTab] = useState<"Overview" | "Orientation" | "Position" | "Temperature" | "Lidar">("Orientation");

    const overviewData = [
        { title: "Battery", value: "85%" },
        { title: "Temperature", value: "42°C" },
        { title: "Speed", value: "1.5 m/s" },
        { title: "Altitude", value: "120 m" },
    ];

    const orientationData = [
        { title: "Yaw", value: "85.8°" },
        { title: "Roll", value: "-12.9°" },
        { title: "Pitch", value: "2.3°" },
        { title: "Ground Speed", value: "1.25 m/s" },
    ];

    const positionData = [
        { title: "Latitude", value: "49.94308" },
        { title: "Longitude", value: "-119.37831" },
        { title: "Altitude", value: "120 m" },
        { title: "Speed", value: "1.5 m/s" },
    ];


    return (
        <>
            {/* Tab Menu */}
            <div className="flex w-full overflow-hidden shadow border-b border-t border-black">
                <button
                    onClick={() => setActiveTab("Overview")}
                    className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
                        activeTab === "Overview"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab("Orientation")}
                    className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
                        activeTab === "Orientation"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                    Orientation
                </button>
                <button
                    onClick={() => setActiveTab("Position")}
                    className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
                        activeTab === "Position"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                    Position
                </button>
                <button
                    onClick={() => setActiveTab("Lidar")}
                    className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
                        activeTab === "Lidar"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                    Lidar
                </button>
                <button
                    onClick={() => setActiveTab("Temperature")}
                    className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
                        activeTab === "Temperature"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                    Temperature
                </button>

            </div>

            {activeTab === "Overview" && (
                <InfoGrid data={overviewData}/>
            )}

            {activeTab === "Orientation" && (
                <InfoGrid data={orientationData}/>
            )}

            {activeTab === "Position" && (
                <InfoGrid data={positionData}/>
            )}

            {activeTab === "Lidar" && (
                <LidarVisualizer minAngle={0} maxAngle={360}/>
            )}

            {activeTab === "Temperature" && (
                <TemperatureChart></TemperatureChart>
            )}

        </>
    );
}

export default BotInfoPanel;
