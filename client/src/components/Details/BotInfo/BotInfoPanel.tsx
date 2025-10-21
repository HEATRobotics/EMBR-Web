import {RobotType} from "@/types/robot.type";
import {useEffect, useState} from "react";
import InfoGrid from "@/components/Details/BotInfo/InfoGrid";
import TemperatureChart from "@/components/TemperatureChart";
import LidarVisualizer from "@/components/Lidar/LidarVisualizer";



function BotInfoPanel({
                          activeBot,
                      }: {
    activeBot: RobotType;
}) {
    const [activeTab, setActiveTab] = useState<"Overview" | "Orientation" | "Position" | "Temperature" | "Lidar">("Orientation");

    const [overviewData, setOverviewData] = useState([
        { title: "Battery", value: "" },
        { title: "Temperature", value: "" },
        { title: "Speed", value: "" },
        { title: "Altitude", value: "" },
    ]);

    const [orientationData, setOrientationData] = useState([
        { title: "Yaw", value: "" },
        { title: "Roll", value: "" },
        { title: "Pitch", value: "" },
        { title: "Ground Speed", value: "" },
    ]);

    const [positionData, setPositionData] = useState([
        { title: "Latitude", value: "" },
        { title: "Longitude", value: "" },
        { title: "Altitude", value: "" },
        { title: "Speed", value: "" },
    ]);

    useEffect(() => {
        if (!activeBot) return; // Safeguard against undefined

        setOverviewData([
            { title: "Battery", value: `75.1%` },
            { title: "Temperature", value: `${Math.round(activeBot.temperature * 100) / 100}°C` },
            { title: "Speed", value: `${ Math.sqrt(activeBot.gz ** 2 + activeBot.gy ** 2 + activeBot.gx ** 2)  ?? "N/A"} m/s` },
            { title: "Altitude", value: `0 m` },
        ]);

        setOrientationData([
            { title: "Yaw", value: `N/A°` },
            { title: "Roll", value: `N/A°` },
            { title: "Pitch", value: `N/A°` },
            { title: "Ground Speed", value: `${ Math.sqrt(activeBot.gz ** 2 + activeBot.gy ** 2 + activeBot.gx ** 2)  ?? "N/A"} m/s` },
        ]);

        setPositionData([
            { title: "Latitude", value: `${activeBot.lat ?? "N/A"}` },
            { title: "Longitude", value: `${activeBot.lng ?? "N/A"}` },
            { title: "Altitude", value: `0 m` },
            { title: "Speed", value: `${ Math.sqrt(activeBot.gz ** 2 + activeBot.gy ** 2 + activeBot.gx ** 2)  ?? "N/A"} m/s` },
        ]);
    }, [activeBot]);


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
