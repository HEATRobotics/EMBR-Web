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
import { MissionType } from "@/types/mission.type";
import { useBotData } from "@/hooks/useBotData";
import { useMissions } from "@/hooks/useMissions";
import MapDrawUtils from "@/utils/MapDrawUtils";
import MapTools from "@/components/MapTools";
import { RobotType } from "@/types/robot.type";
import { addMissionToDB } from "@/api/missions.api";
import DetailsPanel from "@/components/Details/DetailsPanel";

// ========== CONSTANTS ==========

// Map Zoom Levels
const DEFAULT_ZOOM = 14;
const BOT_FOCUS_ZOOM = 20;

// Map Width Constraints (percentage)
const MIN_MAP_WIDTH = 30;
const MAX_MAP_WIDTH = 70;
const DEFAULT_MAP_WIDTH = 66.67;

// Default Map Center (UBCO Campus)
const UBCO_COORDS: google.maps.LatLngLiteral = {
  lat: 49.939434,
  lng: -119.396427,
};

// Mission Template
const NEW_MISSION_TEMPLATE: MissionType = {
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

// Map Styling
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

// Dropdown Menu Items (currently disabled)
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

// ========== COMPONENT ==========

const CustomGoogleMap: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Map State
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [satelliteView, setSatelliteView] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(DEFAULT_ZOOM);
  const [mapWidth, setMapWidth] = useState(DEFAULT_MAP_WIDTH);
  
  // Bot & Mission State
  const [selectedBot, setSelectedBot] = useState<RobotType | null>(null);
  const [activeMissionCreate, setActiveMissionCreate] = useState<boolean>(false);
  const [newMission, setNewMission] = useState<MissionType>(NEW_MISSION_TEMPLATE);

  // Data Hooks
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

  // ========== MAP CALLBACKS ==========

  const onLoad = useCallback(function callback(map: google.maps.Map | null) {
    if (map) setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // ========== MISSION HANDLERS ==========

  const saveCreate = async (mission: MissionType) => {
    setActiveMissionCreate(false);
    console.log("Saving mission:", mission);

    const updatedMissions = [...(missionsData ?? []), mission];
    setMissions(updatedMissions);

    const response = await addMissionToDB(mission);
    console.log("Mission created with ID:", response.missionID);
    if (map) enableMapInteraction(map);
  };

  const cancelCreate = () => {
    setActiveMissionCreate(false);
    if (map) enableMapInteraction(map);
  };

  const createMission = () => {
    setActiveMissionCreate(true);
    if (map) disableMapInteraction(map);
  };

  const deleteMission = () => {
    // TODO: Implement mission deletion
  };

  // ========== MAP INTERACTION HELPERS ==========

  const disableMapInteraction = (map: google.maps.Map) => {
    map.setOptions({
      draggable: false,
      zoomControl: false,
      scrollwheel: false,
      disableDoubleClickZoom: false,
    });
  };

  const enableMapInteraction = (map: google.maps.Map) => {
    map.setOptions({
      draggable: true,
      scrollwheel: true,
      disableDoubleClickZoom: true,
    });
  };

  // ========== EFFECTS ==========

  // Adjust camera position when bot is selected
  useEffect(() => {
    if (map === null) return;

    if (selectedBot === null) {
      // No bot selected - center on default location
      map.setCenter(UBCO_COORDS);
      map.setZoom(DEFAULT_ZOOM);
      return;
    }

    // Center on selected bot
    const botPosition = bots.find((bot) => bot.id === selectedBot.id)?.coordinates;
    if (botPosition) {
      map.setCenter(botPosition);
      map.setZoom(BOT_FOCUS_ZOOM);
    }
  }, [selectedBot, map, bots]);

  // Update bot markers on map
  useEffect(() => {
    if (!map || !bots || bots.length === 0) return;
    MapDrawUtils.drawBots(bots, map);
  }, [bots, map]);

  // Update mission areas on map
  useEffect(() => {
    if (!map || !missionsData || missionsData.length === 0) return;
    MapDrawUtils.drawMissionAreas(missionsData, map);
  }, [missionsData, map]);

  // ========== RESIZE HANDLER ==========

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    const startX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const startWidth = mapWidth;

    const onMove = (event: MouseEvent | TouchEvent) => {
      const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
      const deltaX = clientX - startX;
      const newWidth = Math.min(
        Math.max(startWidth + (deltaX / window.innerWidth) * 100, MIN_MAP_WIDTH), 
        MAX_MAP_WIDTH
      );
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

  // ========== LOADING STATE ==========

  if (!isLoaded) {
    return <></>;
  }

  // ========== RENDER ==========
  return (
    <>
      <BotsBar
        bots={bots}
        selectedBot={selectedBot}
        setSelectedBot={setSelectedBot}
        disabled={activeMissionCreate}
        createMissionCallback={createMission}
        deleteMissionCallback={deleteMission}
      />

      {/* Map tools */}
      <MapTools
        satelliteValue={satelliteView}
        onSatelliteViewChange={setSatelliteView}
      />

      <div className="flex h-nav-content max-w-screen max-h-screen overflow-hidden">
        {/* Map Container */}
        <div className="h-full" style={{ width: `${selectedBot !== null ? mapWidth : '100'}%` }}>
          {activeMissionCreate && (
              <div className="z-[10] absolute right-0 top-0 mt-16">
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
            mapContainerClassName="h-full w-full"
            center={UBCO_COORDS}
            zoom={DEFAULT_ZOOM}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onZoomChanged={() => {
              if (map) setZoomLevel(map.getZoom() || DEFAULT_ZOOM);
            }}
          />
        </div>

        {/* Resizable Slider */}
        {selectedBot !== null ? (
          <div
            className="w-0.5 bg-black cursor-ew-resize"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
          ></div>
        ) : (
          <></>
        )}

        {/* Split Screen Details Panel */}
        {selectedBot !== null && missionsData ? (
          <div className="h-full bg-gray-100 overflow-y-auto" style={{ width: `${100 - mapWidth}%` }}>
            <DetailsPanel
              selectedBot={selectedBot}
              activeMission={missionsData.filter((mission) => mission.botID === Number(selectedBot.id))[0]}
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
