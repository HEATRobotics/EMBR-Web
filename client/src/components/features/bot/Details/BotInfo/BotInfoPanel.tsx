import {RobotType} from "@/types/robot.type";
import {useEffect, useState} from "react";
import InfoGrid from "@/components/features/bot/Details/BotInfo/InfoGrid";

function BotInfoPanel({
                          selectedBot,
                      }: {
    selectedBot: RobotType;
}) {
    const [currentTab, setCurrentTab] = useState<"Overview" | "Orientation" | "Position" >("Orientation");

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
        if (!selectedBot) return; // Safeguard against undefined

        setOverviewData([
            { title: "Battery", value: `75.1%` },
            { title: "Temperature", value: `${Math.round(selectedBot.temperature * 100) / 100}°C` },
            { title: "Speed", value: `${ Math.sqrt(selectedBot.gz ** 2 + selectedBot.gy ** 2 + selectedBot.gx ** 2)  ?? "N/A"} m/s` },
            { title: "Altitude", value: `0 m` },
        ]);

        setOrientationData([
            { title: "Yaw", value: `N/A°` },
            { title: "Roll", value: `N/A°` },
            { title: "Pitch", value: `N/A°` },
            { title: "Ground Speed", value: `${ Math.sqrt(selectedBot.gz ** 2 + selectedBot.gy ** 2 + selectedBot.gx ** 2)  ?? "N/A"} m/s` },
        ]);

        setPositionData([
            { title: "Latitude", value: `${selectedBot.lat ?? "N/A"}` },
            { title: "Longitude", value: `${selectedBot.lng ?? "N/A"}` },
            { title: "Altitude", value: `0 m` },
            { title: "Speed", value: `${ Math.sqrt(selectedBot.gz ** 2 + selectedBot.gy ** 2 + selectedBot.gx ** 2)  ?? "N/A"} m/s` },
        ]);
    }, [selectedBot]);


    return (
        <>
            {/* Tab Menu */}
            <div className="flex w-full overflow-hidden shadow border-b border-t border-black">
                <button
                    onClick={() => setCurrentTab("Overview")}
                    className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
                        currentTab === "Overview"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setCurrentTab("Orientation")}
                    className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
                        currentTab === "Orientation"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                    Orientation
                </button>
                <button
                    onClick={() => setCurrentTab("Position")}
                    className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
                        currentTab === "Position"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                    Position
                </button>
                

            </div>

            {currentTab === "Overview" && (
                <InfoGrid data={overviewData}/>
            )}

            {currentTab === "Orientation" && (
                <InfoGrid data={orientationData}/>
            )}

            {currentTab === "Position" && (
                <InfoGrid data={positionData}/>
            )}

        </>
    );
}

export default BotInfoPanel;
