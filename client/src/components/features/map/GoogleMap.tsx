'use client';

import { useJsApiLoader, GoogleMap, OverlayViewF, OverlayView } from '@react-google-maps/api';
import { Map, Satellite } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import {
  createRectangle,
  updateRectangleBounds,
  coordinatesToBounds,
  removeRectangle,
  drawBots,
  drawMissionAreas,
  getMapOptions,
  GOOGLE_MAPS_LIBRARIES,
  initializeMapView,
} from '@/components/features/map/MapTools';
import Search from '@/components/features/map/MapTools/search';
import { MissionType, RobotType } from '@/types';
import { CoordinatesType } from '@/types/coordinate.type';
import { useRouter } from 'next/navigation';


// ========== COMPONENT ==========

interface CustomGoogleMapProps {
  bots?: RobotType[];
  missionsData?: MissionType[] | null;
  drawingMode?: boolean;
  currentRectangle?: { northWest: CoordinatesType; southEast: CoordinatesType } | null;
  onRectangleChange?: (northWest: CoordinatesType, southEast: CoordinatesType) => void;
  onRectangleSet?: (rectangle: google.maps.Rectangle | null) => void;
  showSearch?: boolean;

  center?: google.maps.LatLngLiteral;
  zoom?: number;
  // above two lines allows to pass hotspot location into map
  hotspotLocation ?: google.maps.LatLngLiteral; 
}

const CustomGoogleMap: React.FC<CustomGoogleMapProps> = ({
  bots,
  missionsData,
  drawingMode = false,
  currentRectangle,
  onRectangleChange,
  onRectangleSet,
  showSearch = true,
  center, 
  zoom = 18,
  hotspotLocation,
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [satelliteView, setSatelliteView] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [editableRectangle, setEditableRectangle] = useState<google.maps.Rectangle | null>(null);
  const router = useRouter();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  } as any);

  const mapOptions = isLoaded ? getMapOptions(satelliteView) : {};

  const onLoad = useCallback(function callback(map: google.maps.Map | null) {
    if (map) setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // Handle drawing mode logic
  useEffect(() => {
    if (!map || !drawingMode) return;

    const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!currentRectangle && e.latLng && onRectangleChange) {
        const clickedLat = e.latLng.lat();
        const clickedLng = e.latLng.lng();
        const offset = 0.001;
        onRectangleChange(
          { lat: clickedLat + offset, lng: clickedLng - offset },
          { lat: clickedLat - offset, lng: clickedLng + offset },
        );
      }
    });

    return () => google.maps.event.removeListener(clickListener);
  }, [map, drawingMode, currentRectangle, onRectangleChange]);

  useEffect(() => {
    if(!map || !hotspotLocation) return; 

    const marker = new google.maps.Marker({
      position: hotspotLocation, 
      map, 
      title: 'Hotspot', 
      label: {
        text: '🔥',
        fontSize: '40px', 

      }

    });

    return () => {
      marker.setMap(null);
    }; 

  }, [map, hotspotLocation]);

  // Create or update the editable rectangle
  useEffect(() => {
    if (!map || !drawingMode) return;

    if (!currentRectangle) {
      removeRectangle(editableRectangle);
      setEditableRectangle(null);
      onRectangleSet?.(null);
      return;
    }

    const bounds = coordinatesToBounds(currentRectangle.northWest, currentRectangle.southEast);

    if (editableRectangle) {
      updateRectangleBounds(editableRectangle, bounds);
    } else {
      const rectangle = createRectangle(bounds, map, (nw, se) => onRectangleChange?.(nw, se));
      setEditableRectangle(rectangle);
      onRectangleSet?.(rectangle);
    }
  }, [map, drawingMode, currentRectangle, onRectangleChange, onRectangleSet, editableRectangle]);

  useEffect(() => {
    if (!drawingMode && editableRectangle) {
      removeRectangle(editableRectangle);
      setEditableRectangle(null);
      onRectangleSet?.(null);
    }
  }, [drawingMode, editableRectangle, onRectangleSet]);

  useEffect(() => {
    if (!map || hasInitialized) return;

    if(center) {
      map.setCenter(center); 
      map.setZoom(zoom);
      setHasInitialized(true);
      return;
    }

    const hasBots = bots && bots.length > 0;
    const hasMissions = missionsData && missionsData.length > 0;

    if (!hasBots && !hasMissions) {
      // No data yet - wait for it to load
      return;
    }

    initializeMapView(map, bots, missionsData ?? undefined);

    setHasInitialized(true);
  }, [map, bots, missionsData, hasInitialized, center, zoom]);

  useEffect(() => {
    if (!map || !bots || bots.length === 0) return;
    drawBots(bots, map);
  }, [bots, map]);

  useEffect(() => {
    if (!map || !missionsData || missionsData.length === 0) return;
    drawMissionAreas(missionsData, map); // Only drawing rectangle areas, not clickable names, which are handled in the main component render
  }, [missionsData, map]);

  useEffect(() => {
    if (!map) return;
    map.setMapTypeId(satelliteView ? 'satellite' : 'roadmap');
  }, [satelliteView, map]);

  if (loadError) return <div className="flex items-center justify-center h-full">Error loading maps</div>;
  if (!isLoaded) return <div className="flex items-center justify-center h-full">Loading maps...</div>;

  return (
    <div className="h-full w-full relative">
      <GoogleMap
        options={mapOptions}
        mapContainerClassName="h-full w-full"
        center = {center}
        zoom = {zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Overlay for Clickable Mission Names */}
        {missionsData?.map((mission) => {
          if (!mission.areaCoordinates) return null;

          const position = {
            lat: mission.areaCoordinates[0].lat,
            lng: (mission.areaCoordinates[0].lng + mission.areaCoordinates[1].lng) / 2,
          };

          return (
            <OverlayViewF
              key={mission.missionID}
              position={position}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div
                style={{ transform: 'translate(-50%, -180%)', whiteSpace: 'nowrap' }}
                className="z-50"
              >
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/missions/${mission.missionID}`);
                  }}
                  className="cursor-pointer font-bold text-sm text-black bg-white/90 px-2 py-0.5 rounded shadow-md border border-gray-200 hover:text-blue-600 hover:underline transition-all"
                >
                  {mission.missionName || 'Unnamed Mission'}
                </span>
              </div>
            </OverlayViewF>
          );
        })}
      </GoogleMap>

      {/* Search Box */}
      {showSearch && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Search />
        </div>
      )}

      {/* Satellite/Map Toggle Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setSatelliteView(!satelliteView)}
          className="px-4 py-2 bg-white rounded-md shadow hover:bg-gray-100 flex items-center gap-2 transition-colors"
        aria-label={satelliteView ? 'Switch to map view' : 'Switch to satellite view'}
        >
          {satelliteView ? (
            <>
              <Map size={18} /> <span>Map</span>
            </>
          ) : (
            <>
              <Satellite size={18} /> <span>Satellite</span>
            </>
          )}
        </button>
      </div>

      {/* Drawing Mode Indicator */}
      {drawingMode && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg text-center">
            {currentRectangle
              ? '🖊️ Drawing Mode Active - Drag corners/edges to adjust area'
              : '📍 Click anywhere on the map to create a new area'}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomGoogleMap;