"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { Dropdown, MenuProps } from "antd";
import {
  useJsApiLoader,
  GoogleMap as GoogleMapReact, GoogleMap,
} from "@react-google-maps/api";
import FleetBar from "./FleetBar";
import MissionCreate from "./MissionControls/MissionCreate";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

// types/interfaces
import { MissionType } from "@/types/mission.type";

// custom hooks
import { useFleetData } from "@/hooks/useFleetData";
import { useMissions } from "@/hooks/useMissions";

import MapDrawUtils from "@/utils/MapDrawUtils";
import MapTools from "@/components/MapTools";
import EmbrDetails from "@/app/embr-details/page";

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
const ubcoCoorations: google.maps.LatLngLiteral = {
  lat: 49.939434,
  lng: -119.396427,
};

const newMissionTemplate: MissionType = {
  name: "",
  fleetId: "",
  process: 0,
  hotspots: [],
  averageTemperature: 0,
  timePassed: 0,
  timeEstimated: 2880,
  areaCoordinates: undefined,
  robots: [],
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
  const [activeFleet, setActiveFleet] = useState<string | number | null>(null);
  const [activeMissionCreate, setActiveMissionCreate] = useState<boolean>(false);
  const [cancelDrawing, setCancelDrawing] = useState<any>();
  const [newMission, setNewMission] = useState<MissionType>(newMissionTemplate);
  const [satelliteView, setSatelliteView] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(zoom);
  const [mapWidth, setMapWidth] = useState(66.67);

  const { fleets, bots, fleetLoading, fleetError } = useFleetData();
  const { mission, missionLoading, missionError, setMission } = useMissions();

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

  const saveCreate = (mission: MissionType) => {
    setActiveMissionCreate(false);
    // Missions not supported yet, so this is commented out for now
    // updateFleets([mission]);
    // localStorage.setItem(
    //   "customMissions",
    //   JSON.stringify([
    //     ...JSON.parse(localStorage.getItem("customMissions") || "[]"),
    //     mission,
    //   ])
    // );
  };

  const cancelCreate = () => {
    setActiveMissionCreate(false);
    cancelDrawing.cancelDrawing();
    enable(map!);
  };

  /*  Drawing stuff for missions is also commented out for now

  const handleDraw = () => {
    if (map) {
      disable(map);
      google.maps.event.addDomListener(map.getDiv(), "mousedown", function () {
        setCancelDrawing(drawFreeHand(map));
      });
    }
  };

  const drawFreeHand = (map: google.maps.Map) => {
    let poly = new google.maps.Polyline({ map, clickable: false });
    let path = poly.getPath();
    let move: google.maps.MapsEventListener | null = null;

    const cancelDrawing = () => {
      setNewMission(newMissionTemplate);
      if (move) {
        google.maps.event.removeListener(move);
        move = null;
      }
      path.clear();
      poly.setMap(null);
      google.maps.event.clearListeners(map.getDiv(), "mousedown");
    };

    const completeDrawing = () => {
      if (move) {
        google.maps.event.removeListener(move);
        move = null;
      }

      if (path.getLength() > 0) {
        poly.setMap(null);

        const smoothedPath = smoothPath(path);

        console.log(
          smoothedPath.getArray().map((latLng) => ({
            lat: latLng.lat(),
            lng: latLng.lng(),
          }))
        );

        setNewMission((prev) => ({
          ...prev,
          blueCoordinates: smoothedPath.getArray().map((latLng) => ({
            lat: latLng.lat(),
            lng: latLng.lng(),
          })),
        }));
        poly = new google.maps.Polygon({
          map,
          paths: smoothedPath,
          fillColor: "#0054EA",
          fillOpacity: 0.05,
          strokeColor: "#0054EA",
          strokeWeight: 2,
        });
      }

      google.maps.event.clearListeners(map.getDiv(), "mousedown");
      enable(map);
    };

    move = google.maps.event.addListener(
      map,
      "mousemove",
      function (e: MouseEvent) {
        path.push((e as any).latLng);
      }
    );

    google.maps.event.addListenerOnce(map, "mouseup", completeDrawing);

    return {
      cancelDrawing: () => {
        cancelDrawing();
      },
    };
  };

  */

  const smoothPath = (path: google.maps.MVCArray) => {
    const smoothedPath: google.maps.MVCArray = new google.maps.MVCArray();
    const pathLength = path.getLength();
    for (let i = 0; i < pathLength; i++) {
      const point1 = path.getAt(i);
      const point2 = path.getAt((i + 1) % pathLength);

      const firstQuarter = google.maps.geometry.spherical.interpolate(
        point1,
        point2,
        0.25
      );
      const thirdQuarter = google.maps.geometry.spherical.interpolate(
        point1,
        point2,
        0.75
      );

      smoothedPath.push(firstQuarter);
      smoothedPath.push(thirdQuarter);
    }
    return smoothedPath;
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

  /*    This is commented out because it uses hardcoded "missions" for each fleet, and for now the logic for missions is still undecided 

  const updateFleets = (newMissions: MissionType[]) => {
    const updatedFleets = fleets.map((fleet) => {
      const fleetMissions = newMissions.filter(
        (mission: MissionType) => mission.fleetId === fleet.id
      );
      return {
        ...fleet,
        missions: [...fleet.missions, ...fleetMissions],
      };
    });

    setFleets(updatedFleets);

    updatedFleets.forEach((fleet) =>
      fleet.missions.forEach((mission) => {
        const redPoly = new google.maps.Polygon({
          paths: mission.redCoordinates,
          strokeColor: "#FF3131",
          strokeWeight: 2,
          fillColor: "#FF3131",
          fillOpacity: 0.15,
        });
        const orangePoly = new google.maps.Polygon({
          paths: mission.orangeCoordinates,
          strokeColor: "#F57C15",
          strokeWeight: 2,
          fillColor: "#F57C15",
          fillOpacity: 0.1,
        });
        const bluePoly = new google.maps.Polygon({
          paths: mission.blueCoordinates,
          strokeColor: "#0054EA",
          strokeWeight: 2,
          fillColor: "#0054EA",
          fillOpacity: 0.05,
        });

        mission.robots?.forEach((robot: RobotType) => {
          const svgMarker = {
            path: `M5,10a5,5 0 1,0 10,0a5,5 0 1,0 -10,0`,
            fillColor: RobotStateType[robot.state].color,
            fillOpacity: 1,
            strokeWeight: 0,
            rotation: 0,
            scale: 2,
            anchor: new google.maps.Point(10, 10),
          };

          const marker = new google.maps.Marker({
            position: robot.coordinates,
            icon: svgMarker,
            label: {
              text: robot.name,
              color: RobotStateType[robot.state].color,
            },
            map,
          });

          marker.addListener("click", () => {
            router.push("/embr-details");
          });
        });

        mission.smokes?.forEach((smoke: CoordinatesType) => {
          const svgMarker = {
            path: "m91.44 54.89c-.29 10.89-4.84 20-10.16 29-5 8.37-12.74 13.82-20 19.76-4.65 3.78-9.63 7.15-14.37 10.82a16.1 16.1 0 0 0 -3.47 3.71c-5.94 8.8-11.26 17.89-13.16 28.6-.74 4.16-4 5.42-7.57 3.23a5.36 5.36 0 0 1 -1.36-1c-3.58-4.43-7.53-8.63-10.56-13.41s-5.22-10.16-7.69-15.32c-3.75-7.87-3.72-16-1.7-24.31 2.91-12 9.24-22 17.45-31 3.67-4 7.55-7.82 11.19-11.86 2.29-2.53 4.15-5.44 6.46-8 5.18-5.6 6.29-12.68 7.46-19.74.87-5.2-1.24-9.52-4.54-13.35-1.49-1.74-3.16-3.32-4.52-5.14a4.19 4.19 0 0 1 -.56-4.88 4.1 4.1 0 0 1 4.42-1.93c11.42 1.8 22.24 5.16 31.76 12.06a33.83 33.83 0 0 1 11.13 12.87 130.22 130.22 0 0 1 6.52 14.91c1.59 4.82 2.22 9.97 3.27 14.98zm-38.52-40.89c2.4 5.58 2.16 11 1.4 16.39-1.08 7.66-3.32 14.81-8.32 21.19a123.66 123.66 0 0 1 -14.3 16 68.2 68.2 0 0 0 -15.5 20.37 64.24 64.24 0 0 0 -5.06 15.4c-1.93 9 2.2 16.75 6.44 24.3 1.21 2.16 2.24 4.54 5 5.24 8.13-17.28 15.43-25.5 28.77-34.7a135.93 135.93 0 0 0 10.88-8.49 52.62 52.62 0 0 0 16.39-25.7c4.23-14.39-.5-27.07-8.6-38.85a26.32 26.32 0 0 0 -17.1-11.15z",
            fillOpacity: 1,
            strokeWeight: 0,
            rotation: 0,
            scale: 0.2,
            anchor: new google.maps.Point(20, 20),
          };

          new google.maps.Marker({
            position: smoke,
            icon: svgMarker,
            map,
          });
        });

        redPoly.setMap(map);
        orangePoly.setMap(map);
        bluePoly.setMap(map);
      })
    );

    return updatedFleets;
  };

  useEffect(() => {
    if (map) {
      const storedMissions = JSON.parse(
        localStorage.getItem("customMissions") || "[]"
      );

      updateFleets(storedMissions);
    }
  }, [map]);

  */

  /*
    TODO: implement this once the simulated position data makes sense for bots in a fleet

      1) for a simulation, bots in a fleet should start close together. probably even just 1 bot per fleet for now.
      2) fleet center should be centroid of all bots in the fleet (if only 1 bot, then use that bot's position).
      3) try to simulate decent movement patterns for the bots
  */


  // Adjust Camera Position to Active Fleet. 
  // If none move camera to UBCO campus.
  useEffect(() => {
    if (map === null)
      return;

    // No active fleet center on UBCO campus
    if (activeFleet === null) {
      map.setCenter(ubcoCoorations);
      map.setZoom(zoom);
      return;
    }

    // Center on active fleet
    map.setCenter(fleets.find((fleet) => fleet.id === activeFleet)?.center!);
    map.setZoom(zoomFleet);

  }, [activeFleet, map]);

  // Update map with new fleet data
  useEffect(updateFleets, [fleets, map])
  
  function updateFleets() {
    if (!map || !fleets || fleets.length === 0)
      return;

    MapDrawUtils.drawFleets(fleets, map);

  }



  const handleMissionClick: MenuProps["onClick"] = ({ key }) => {
    setActiveFleet(null);
    switch (key) {
      case "create":
        console.log('DEBUG: Create Fleet Event');
        setActiveMissionCreate(true);
        // handleDraw();
        break;
      case "edit":
        console.log('DEBUG: Edit Fleet Event');
        undefined;
        break;
      case "delete":
        console.log('DEBUG: Delete Fleet Event');
        undefined;
        break;
      default:
        console.log('DEBUG: ERROR: key undefined in fleet event');
        undefined;
        break;
    }
  };

  // Display loading page if page has not been loaded
  if (!isLoaded) {
    return (
      <></>
    );
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
      <FleetBar
        fleets={fleets}
        activeFleet={activeFleet}
        setActiveFleet={setActiveFleet}
        disabled={activeMissionCreate}
      />

      {/* Map tools */}
      <MapTools
        satelliteValue={satelliteView}
        onSatelliteViewChange={setSatelliteView}
      />

      {/* Top Right Bar */}
      <div className="absolute py-[30px] px-[30px] right-[0] flex flex-col gap-y-[36px] items-end max-w-[400px] z-[10]">
        {/* <Search /> */}
        <div className="flex flex-col gap-y-3 w-full">
          {activeFleet !== null ? (
            <>
              <div className="flex justify-start items-center gap-x-2.5">
                <button className="left-[35px] px-3.5 py-1 rounded-[22px] text-[15px] leading-[18px] bg-white">
                  Past
                </button>
                <button className="left-[35px] px-3.5 py-1 rounded-[22px] text-[15px] leading-[18px] bg-white">
                  Current
                </button>
                <button className="left-[35px] px-3.5 py-1 rounded-[22px] text-[15px] leading-[18px] bg-white">
                  All
                </button>
                <Dropdown
                  menu={{ items, onClick: handleMissionClick }}
                  align={{ offset: [60, -26] }}
                  placement="bottomRight"
                  className="cursor-pointer left-[35px] px-3.5 py-1 rounded-[22px] text-[15px] leading-[18px] bg-white select-none"
                  trigger={["click"]}
                >
                  <span>•••</span>
                </Dropdown>
              </div>
              {
                // TODO: implement this once the mission logic is in place
                //  - define table schema for a mission including a way to encode the area, define connection between a fleet and a mission
                /* <Stats
                  missions={
                    fleets.find((fleet) => fleet.id === activeFleet)
                      ?.missions!
                  }
                /> */
              }
            </>
          ) : activeMissionCreate ? (
            <MissionCreate
              cancelCreate={cancelCreate}
              saveCreate={saveCreate}
              newMission={newMission}
              setNewMission={setNewMission}
              fleets={fleets.map((fleet) => ({
                value: fleet.id,
                label: fleet.name,
              }))}
            />
          ) : (
            <></>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex h-screen max-w-screen max-h-screen overflow-hidden">
        <div className="h-full" style={{ width: `${activeFleet !== null ? mapWidth : '100'}%` }}>
          <GoogleMap
              options={mapOptions}
              mapContainerClassName="h-screen w-full"
              center={ubcoCoorations}
              zoom={zoom}
              onLoad={onLoad}
              onUnmount={onUnmount}
              onZoomChanged={() => {
                if (map) setZoomLevel(map.getZoom() || zoom);
              }}
          />
        </div>

        {/* Resizable Slider */}
        {activeFleet !== null ? (
            <div
                className="w-2 bg-gray-400 cursor-ew-resize"
                onMouseDown={handleResizeStart}
                onTouchStart={handleResizeStart}
            ></div>
        ) : (
            <></>
        )}

        {/* Split screen to show bot statistics */}
        {activeFleet !== null ? (
            <div className="h-full max-h-lvh p-4 bg-gray-100 overflow-y-auto" style={{ width: `${100 - mapWidth}%` }}>
              <EmbrDetails></EmbrDetails>
            </div>
        ) : (
            <></>
        )}

      </div>
    </>
  );
};

export default CustomGoogleMap;
