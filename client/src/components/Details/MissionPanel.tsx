import {RobotType} from "@/types/robot.type";
import DetailsPanel from "@/components/Details/DetailsPanel";
import InfoGrid from "@/components/Details/BotInfo/InfoGrid";


function MissionPanel({ activeBot }: { activeBot: RobotType }) {

    const centerData = [
        { title: "Latitude", value: "49.94308" },
        { title: "Longitude", value: "-119.37831" }
    ];

    const upCornerData = [
        { title: "Latitude", value: "49.94308" },
        { title: "Longitude", value: "-119.37831" }
    ];

    const downCornerData = [
        { title: "Latitude", value: "49.94308" },
        { title: "Longitude", value: "-119.37831" }
    ];

    const areaData = [
        { title: "Area", value: "12.2 km²" },
        { title: "Area", value: "1220.0 ha" },
        { title: "Start Time", value: "2025-04-26 14:37:58" },
        { title: "Est Duration", value: "02:15:47" }
    ];

    return (
        <>
            <div className="flex w-full overflow-hidden shadow border-b border-t border-black">
                <span
                    className={`w-full py-3 text-center text-sm font-semibold transition-colors duration-200 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"}`}
                >
                General Information
                </span>
            </div>
            <InfoGrid data={areaData}/>

            <div className="flex w-full overflow-hidden shadow border-b border-t border-black">
                <span
                    className={`w-full py-3 text-center text-sm font-semibold transition-colors duration-200 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"}`}
                >
                    Area Center
                </span>
            </div>
            <InfoGrid data={centerData}/>

            <div className="flex w-full overflow-hidden shadow border-b border-t border-black">
                <span
                    className={`w-full py-3 text-center text-sm font-semibold transition-colors duration-200 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"}`}
                >
                    Top Left Corner
                </span>
            </div>
            <InfoGrid data={upCornerData}/>

            <div className="flex w-full overflow-hidden shadow border-b border-t border-black">
                <span
                    className={`w-full py-3 text-center text-sm font-semibold transition-colors duration-200 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"}`}
                >
                    Bottom Right Corner
                </span>
            </div>
            <InfoGrid data={downCornerData}/>


        </>
    )
}

export default MissionPanel;