import {RobotType} from "@/types/robot.type";
import DetailsPanel from "@/components/Details/DetailsPanel";
import InfoGrid from "@/components/Details/BotInfo/InfoGrid";
import {MissionType} from "@/types/mission.type";
import {useMemo} from "react";


function MissionPanel({ selectedBot, activeMission }: { selectedBot: RobotType, activeMission: MissionType | undefined }) {
    const {
        centerData,
        upCornerData,
        downCornerData,
        areaData
    } = useMemo(() => {

        console.log("MissionPanel", activeMission);

        if (!activeMission || !activeMission.areaCoordinates || activeMission.areaCoordinates.length !== 2) {
            // Provide defaults if activeMission is missing

            return {
                centerData: [],
                upCornerData: [],
                downCornerData: [],
                areaData: []
            };
        }

        const topLeft = activeMission.areaCoordinates[0];
        const bottomRight = activeMission.areaCoordinates[1];

        // Calculate center
        const centerLatitude = (topLeft.lat + bottomRight.lat) / 2;
        const centerLongitude = (topLeft.lng + bottomRight.lng) / 2;

        const centerData = [
            { title: "Latitude", value: centerLatitude.toFixed(6) },
            { title: "Longitude", value: centerLongitude.toFixed(6) }
        ];

        const upCornerData = [
            { title: "Latitude", value: topLeft.lat.toFixed(6) },
            { title: "Longitude", value: topLeft.lng.toFixed(6) }
        ];

        const downCornerData = [
            { title: "Latitude", value: bottomRight.lat.toFixed(6) },
            { title: "Longitude", value: bottomRight.lng.toFixed(6) }
        ];

        // Calculate area
        const avgLatitudeRad = (centerLatitude * Math.PI) / 180;
        const latDistanceKm = Math.abs(topLeft.lat - bottomRight.lat) * 111;
        const lonDistanceKm = Math.abs(topLeft.lng - bottomRight.lng) * 111 * Math.cos(avgLatitudeRad);

        const areaKm2 = latDistanceKm * lonDistanceKm;
        const areaHa = areaKm2 * 100;

        const areaData = [
            { title: "Area", value: `${areaKm2.toFixed(2)} km²` },
            { title: "Area", value: `${areaHa.toFixed(1)} ha` },
            { title: "Time passed", value: activeMission.timePassed + " min" || "N/A" },
            { title: "Est Duration", value: activeMission.timeEstimated + " min" || "N/A" }
        ];

        return {
            centerData,
            upCornerData,
            downCornerData,
            areaData
        };
    }, [activeMission]);

    if (!activeMission) {
        return (
            <>
            No Active Mission Found
            </>
        );
    }

    return (
        <>
            <div className="flex w-full overflow-hidden shadow border-t-2  border-t-[#1c1c1c]  " 
                    >
                <span
                    className={`w-full py-3 text-center text-sm font-semibold transition-colors duration-200  text-gray-600 "}`} 
                    style={{
                        backgroundColor: "rgba(62, 60, 56, 0.5)",
                    }}
                    >
                        General Information for {activeMission.missionName}
                </span>
            </div>
            <InfoGrid data={areaData}/>

            <div className="flex w-full overflow-hidden ">  
                <span
                    className={`w-full py-3 text-center  font-semibold transition-colors duration-200  text-gray-600 "}`}   //hover:bg-gray-200 hover:text-gray-800  bg-gray-100  text-sm 
                    style={{
                        backgroundColor: "rgba(62, 60, 56, 0.5)",
                    }}
                >
                    Area Center
                </span>
            </div>
            <InfoGrid data={centerData}/>

            <div className="flex w-full overflow-hidden shadow ">
                <span
                    className={`w-full py-3 text-center text-sm font-semibold transition-colors duration-200 text-gray-600 "}`}   
                    style={{
                        backgroundColor: "rgba(62, 60, 56, 0.5)",
                    }}
                >
                    Top Left Corner
                </span>
            </div>
            <InfoGrid data={upCornerData}/>

            <div className="flex w-full overflow-hidden shadow">
                <span
                    className={`w-full py-3 text-center text-sm font-semibold transition-colors duration-200  text-gray-600 "}`}
                    style={{
                        backgroundColor: "rgba(62, 60, 56, 0.5)",
                    }} 
                >
                    Bottom Right Corner
                </span>
            </div>
            <InfoGrid data={downCornerData}/>


        </>
    )
}

export default MissionPanel;