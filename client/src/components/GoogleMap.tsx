"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { Dropdown, MenuProps } from "antd";
import {
  useJsApiLoader,
  GoogleMap as GoogleMapReact, GoogleMap,
} from "@react-google-maps/api";
import BotsBar from "./BotsBar";
import MissionCreate from "./MissionControls/MissionCreate";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

// types/interfaces
import { MissionType } from "@/types/mission.type";

// custom hooks
import { useBotData } from "@/hooks/useBotData";
import { useMissions } from "@/hooks/useMissions";

import MapDrawUtils from "@/utils/MapDrawUtils";
import MapTools from "@/components/MapTools";
import EmbrDetails from "@/app/embr-details/page";
import { RobotType } from "@/types/robot.type";
import { addMissionToDB } from "@/api/missions.api";
import DetailsPanel from "@/components/Details/DetailsPanel";
import MissionCreateRectangle from "@/components/MapTools/MissionCreateRectangle";

/*
  Main TODO's: 
    - Create a mission
    - Assign a fleet to the mission
    - View the bot and its details: including preview under mission stats, and details in embr-details (with charts, and cams)
    - Get the bot positions and show live movement maybe
  
  Just focus on one bot
  Improve logic for detecting and showing hotspots on the map
  Look into whether its possible to send mission coords to the bot based on what's drawn
*/

const exampleMapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
];

const zoom: number = 14;
const zoomFleet: number = 20;
const ubcoCoords: google.maps.LatLngLiteral = {
  lat: 49.939434,
  lng: -119.396427,
};

const newMissionTemplate: MissionType = {
  missionName: "",
  botID: 0,
  progress: 0,
  hotspots: [],
  averageTemperature: 0,
  timePassed: 0,
  timeEstimated: 2880,
  areaCoordinates: [
    { lat: 49.94909, lng: -119.40673 },
    { lat: 49.92712, lng: -119.38269 },
  ],
};

const items: MenuProps["items"] = [
  {
    key: "edit",
    label: (
      <button
        disabled
        className="left-[35px] px-3.5 py-1 rounded-[22px] text-[15px] leading-[18px] border border-black hover:!bg-lightgray disabled:!bg-transparent"
      >
        Edit
      </button>
    ),
  },
  {
    key: "create",
    label: (
      <button className="left-[35px] px-3.5 py-1 rounded-[22px] text-[15px] leading-[18px] border border-black hover:!bg-lightgray disabled:!bg-transparent">
        Create
      </button>
    ),
  },
  {
    key: "delete",
    label: (
      <button
        disabled
        className="left-[35px] px-3.5 py-1 rounded-[22px] text-[15px] leading-[18px] border border-black hover:!bg-lightgray disabled:!bg-transparent"
      >
        Delete
      </button>
    ),
  },
];

const CustomGoogleMap: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeBot, setActiveBot] = useState<RobotType | null>(null);
  const [activeMissionCreate, setActiveMissionCreate] = useState<boolean>(false);
  const [cancelDrawing, setCancelDrawing] = useState<any>();
  const [newMission, setNewMission] = useState<MissionType>(newMissionTemplate);
  const [satelliteView, setSatelliteView] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(zoom);
  const [mapWidth, setMapWidth] = useState(66.67);

  const { bots, botsLoading, botError } = useBotData();
  const { missionsData, missionsLoading, missionsError, setMissions } = useMissions();

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
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      mapTypeId: satelliteView ? "satellite" : "roadmap",
      zoom: zoomLevel,
    }
    : {};

  const onLoad = useCallback(function callback(map: google.maps.Map | null) {
    if (map) setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const saveCreate = async (mission: MissionType) => {
    setActiveMissionCreate(false);
    console.log("Called saveCreate");

    // Ensure missionsData is always an array
    const updatedMissions = [...(missionsData ?? []), mission];
    setMissions(updatedMissions);

    const response = await addMissionToDB(mission);
    console.log("Mission with ID ", response.missionID, " created successfully.");
    console.log("Response from addMissionToDB:", response);

    /*
    localStorage.setItem(
      "customMissions",
      JSON.stringify([
        ...JSON.parse(localStorage.getItem("customMissions") || "[]"),
        mission,
      ])
    );
    */
  };

  const cancelCreate = () => {
    setActiveMissionCreate(false);
    cancelDrawing.cancelDrawing();
    enable(map!);
  };

  const disable = (map: google.maps.Map) => {
    map.setOptions({
      draggable: false,
      zoomControl: false,
      scrollwheel: false,
      disableDoubleClickZoom: false,
    });
  };

  const enable = (map: google.maps.Map) => {
    map.setOptions({
      draggable: true,
      scrollwheel: true,
      disableDoubleClickZoom: true,
    });
  };

  // Adjust Camera Position to Active Fleet. 
  // If none move camera to UBCO campus.
  useEffect(() => {
    if (map === null)
      return;

    // No active fleet center on UBCO campus
    if (activeBot === null) {
      map.setCenter(ubcoCoords);
      map.setZoom(zoom);
      return;
    }

    // Center on active fleet
    map.setCenter(bots.find((bot) => bot.id === activeBot.id)?.coordinates!);
    map.setZoom(zoomFleet);

  }, [activeBot, map]);

  // Update map with new fleet data
  useEffect(updateBots, [bots, map])
  useEffect(updateAreaCoordinates, [missionsData, map])

  function updateBots() {
    if (!map || !bots || bots.length === 0)
      return;

    MapDrawUtils.drawBots(bots, map);
  }

  function updateAreaCoordinates() {
    if (!map || !missionsData || missionsData.length === 0)
      return;
    console.log("Drawing Rectangle")
    MapDrawUtils.drawMissionAreas(missionsData, map);
  }

  // Display loading page if page has not been loaded
  if (!isLoaded) {
    return (
      <></>
    );
  }

  const createMission = () => {
    setActiveMissionCreate(true);
  }

  const deleteMission = () => {

  }

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    const startX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const startWidth = mapWidth;

    const onMove = (event: MouseEvent | TouchEvent) => {
      const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
      const deltaX = clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + (deltaX / window.innerWidth) * 100, 30), 70);
      setMapWidth(newWidth);
    };

    const onEnd = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);
  };

  // Display map page
  return (
    <>
      <BotsBar
        bots={bots}
        activeBot={activeBot}
        setActiveBot={setActiveBot}
        disabled={activeMissionCreate}
        createMissionCallback={createMission}
        deleteMissionCallback={deleteMission}
      />

      {/* Map tools */}
      <MapTools
        satelliteValue={satelliteView}
        onSatelliteViewChange={setSatelliteView}
      />

      <div className="flex h-screen max-w-screen max-h-screen overflow-hidden">


        {/* Map */}
        <div className="h-full" style={{ width: `${activeBot !== null ? mapWidth : '100'}%` }}>
          {activeMissionCreate && (
              <div className="z-[10] absolute right-0 top-0">
                <MissionCreate
                    cancelCreate={cancelCreate}
                    saveCreate={saveCreate}
                    newMission={newMission}
                    setNewMission={setNewMission}
                    bots={bots}
                    map={map}/>
              </div>
          )}
          <GoogleMap
            options={mapOptions}
            mapContainerClassName="h-screen w-full"
            center={ubcoCoords}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onZoomChanged={() => {
              if (map) setZoomLevel(map.getZoom() || zoom);
            }}
          />

        </div>

        {/* Resizable Slider */}
        {activeBot !== null ? (
          <div
            className="w-0.5 bg-black cursor-ew-resize"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
          ></div>
        ) : (
          <></>
        )}

        {/* Split screen to show bot statistics */}
        {activeBot !== null && missionsData ? (
          <div className="h-full max-h-lvh bg-gray-100 overflow-y-auto" style={{ width: `${100 - mapWidth}%` }}>
            <DetailsPanel
              activeBot={activeBot}
              activeMission={missionsData.filter((mission) => mission.botID === Number(activeBot.id))[0]}
            ></DetailsPanel>
          </div>
        ) : (
          <></>
        )}

      </div>
    </>
  );
};

export default CustomGoogleMap;
