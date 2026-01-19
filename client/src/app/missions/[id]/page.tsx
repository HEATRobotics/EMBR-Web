"use client";

import Navigation from "@/components/Navigation";
import { useParams } from "next/navigation";
import { useJsApiLoader, GoogleMap } from "@react-google-maps/api";
import { useState, useCallback, useEffect } from "react";
import { useMission } from "@/hooks/useMissions";
import { useBotData } from "@/hooks/useBotData";
import MapDrawUtils from "@/utils/MapDrawUtils";
import MissionPanel from "@/components/Details/MissionPanel";
import { addMissionToDB, updateMissionInDB } from "@/api/missions.api";
import MissionStartEnd from "./MissionControls/MissionStartEnd";
import { MissionType } from "@/types/mission.type";
import React from "react";
import { startAndEndMissionButton, getMissionStatus } from "@/components/MissionControls/MissionStartEnd";
import { deleteMission } from "@/api/missions.api";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";


const UBCO_COORDS = {
  lat: 49.939434,
  lng: -119.396427,
};

const exampleMapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
];

export default function MissionDetail() {
  const params = useParams();
  const router = useRouter();
  const missionId = Number(params.id);
  //const missionId = params.id as string | undefined;
 // const missionId = params.id? Number(params.id) : undefined; // Ensure ID is a number
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [satelliteView, setSatelliteView] = useState<boolean>(false);
  
  const { missionData } = useMission(missionId);
  const { bots } = useBotData();
  
// Find the mission by the ID from the URL params
//const mission: MissionType | undefined = missionsData?.find((m) => m.missionId === missionId);
//const mission: MissionType | undefined = missionsData?.find((m) => String(m.missionId) === missionId);
const mission = missionData;
const assignedBot = bots.find((b) => Number(b.id) === mission?.botID);


  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    libraries: ["places"],
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const mapOptions = isLoaded
    ? {
        styles: exampleMapStyles,
        streetViewControl: false,
        scaleControl: false,
        fullscreenControl: false,
        panControl: false,
        zoomControl: false,
        mapTypeControl: false,
        rotateControl: false,
        mapTypeId: satelliteView ? "satellite" : "roadmap",
      }
    : {};

  const onLoad = useCallback(function callback(map: google.maps.Map | null) {
    if (map) setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const saveUpdate = async (updatedMission: MissionType) => {
      console.log("Updating mission:", updatedMission);
  
      // Update missions in React state. Checks for matching missionID to replace the updated mission.
      const newMissionList = (missionsData ?? []).map(m => 
        m.missionID === updatedMission.missionID ? updatedMission : m
      );
      const updateMissionStatus=getMissionStatus(updatedMission.timeStart, updatedMission.timeEnd);
  
      
      if (updatedMission.botID != null) {
        let newBotStatus: RobotType["assignmentStatus"] | null = null;
  
        if (
          updateMissionStatus === "not started" ||
          updateMissionStatus === "completed"
        ) {
          newBotStatus = "assigned";
        } else if (updateMissionStatus === "in progress") {
          newBotStatus = "active";
        }
  
        if (newBotStatus) {
          setBots(prevBots =>
            prevBots.map(bot =>
              bot.id === String(updatedMission.botID)
                ? { ...bot, assignmentStatus: newBotStatus }
                : bot
            )
          );
        }
      }
      setMissions(newMissionList);
  
      // Push update to the database
      const response = await updateMissionInDB(updatedMission);
      console.log("Mission updated:", response);
  
    };


  // Draw bot and mission area on map
  useEffect(() => {
    if (!map || !assignedBot) return;
    MapDrawUtils.drawBots([assignedBot], map);
  }, [assignedBot, map]);

  useEffect(() => {
    if (!map || !mission) return;
    MapDrawUtils.drawMissionAreas([mission], map);
  }, [mission, map]);

 const handleDelete = async (missionId: number, missionName: string) => {
  const confirmed = window.confirm(`Are you sure you want to delete mission "${missionName}"?`);
  if (!confirmed) return;

  try {
    const response = await deleteMission(missionId.toString());
    alert(response.message);
    // Optionally, you can refresh the page or refetch missions after deletion
    router.push("/missions"); // Next.js 13+ app router
  } catch (error: any) {
    alert(error.message || 'Failed to delete mission.');
  }
};


  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return (
  <div className="bg-gray-100 min-h-full">
      <Navigation />
      
      <main className="h-[calc(100vh-64px)]">
        <div className="flex h-full">
          {/* Map View - Main Content */}
          <div className="flex-1 relative">
            <GoogleMap
              options={mapOptions}
              mapContainerClassName="h-full w-full"
              center={UBCO_COORDS}
              zoom={14}
              onLoad={onLoad}
              onUnmount={onUnmount}
            />
            
            {/* Mission Controls Overlay */}
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow p-4">
              <div className="mb-2">
                <h2 className="text-xl font-bold">Mission #{missionId}</h2>
                <p className="text-gray-600">{mission?.missionName || "Loading..."}</p>
              </div>
            </div>

            {/* Toggle Satellite View */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setSatelliteView(!satelliteView)}
                className="px-4 py-2 bg-white rounded-md shadow hover:bg-gray-100"
              >
                {satelliteView ? "Map" : "Satellite"}
              </button>
            </div>
          </div>

          {/* Side Panel - Mission Details */}
          <div className="w-96 bg-white border-l overflow-y-auto">
            {/* The MissionPanel check handles the main display */}
{mission && assignedBot ? (
 <MissionPanel selectedBot={assignedBot} activeMission={mission} />
) : (
 <div className="p-6">
<p className="text-gray-500">Loading mission details...</p>
</div>
 )}
            
            {/* Export Button, Export Mission Data */}
            <div className="p-4 border-t space-y-4">
              <button className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Export Mission Data
              </button>
              {mission && (
                startAndEndMissionButton(
                mission,
                undefined,
                saveUpdate,
                bots,
                "w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
                "absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded shadow-lg z-50"
              )
              )}

              {mission && ( // <-- **CRITICAL: Only render button if mission is defined**
<button
// Remove the non-null assertion operator (!) now that you have checked above
 onClick={() => handleDelete(mission.missionID, mission.missionName)} 
 className="w-full mt-3 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2 shadow"
>
<Trash2 size={20} color="red" />
<span>Delete Mission</span>
</button>)}
              
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}