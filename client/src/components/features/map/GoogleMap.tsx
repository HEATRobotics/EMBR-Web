'use client';

import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';
import { Map, Satellite } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { useBotData } from '@/hooks/useBotData';
import { useMissions } from '@/hooks/useMissions';
import { MissionType } from '@/types/mission.type';
import { RobotType } from '@/types/robot.type';
import MapDrawUtils from '@/utils/MapDrawUtils';

// ========== CONSTANTS ==========

// Google Maps API Libraries
const GOOGLE_MAPS_LIBRARIES: ('places')[] = ['places'];

// Map Zoom Levels
const DEFAULT_ZOOM = 14;

// Default Map Center (UBCO Campus)
const UBCO_COORDS: google.maps.LatLngLiteral = {
  lat: 49.939434,
  lng: -119.396427,
};

// ========== COMPONENT ==========

interface CustomGoogleMapProps {
  bots?: RobotType[];
  missionsData?: MissionType[];
}

const CustomGoogleMap: React.FC<CustomGoogleMapProps> = ({
  bots: propBots,
  missionsData: propMissionsData,
}) => {
  // Map State
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [satelliteView, setSatelliteView] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  // Data Hooks
  const hookBots = useBotData();
  const hookMissions = useMissions();
  
  // Use provided props if available, otherwise use hooks
  const bots = propBots ?? hookBots.bots;
  const missionsData = propMissionsData ?? hookMissions.missionsData;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    libraries: GOOGLE_MAPS_LIBRARIES,
  } as any);

  const mapOptions = isLoaded
    ? {
        streetViewControl: false,
        scaleControl: false,
        fullscreenControl: false,
        panControl: false,
        zoomControl: false,
        mapTypeControl: false,
        rotateControl: false,
        mapTypeId: satelliteView ? 'satellite' : 'roadmap',
      }
    : {};

  // ========== MAP CALLBACKS ==========

  const onLoad = useCallback(function callback(map: google.maps.Map | null) {
    if (map) {
      setMap(map);
    }
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // ========== EFFECTS ==========

  // Initialize map view based on bots and missions
  useEffect(() => {
    if (!map || hasInitialized) return;

    const hasBots = bots && bots.length > 0;
    const hasMissions = missionsData && missionsData.length > 0;

    if (!hasBots && !hasMissions) {
      // No data yet - wait for it to load
      return;
    }

    // Calculate bounds to include all bots and missions
    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    // Add bot positions to bounds
    if (hasBots) {
      bots.forEach((bot) => {
        if (bot.coordinates) {
          bounds.extend(bot.coordinates);
          hasPoints = true;
        }
      });
    }

    // Add mission area coordinates to bounds
    if (hasMissions) {
      missionsData.forEach((mission) => {
        if (mission.areaCoordinates && mission.areaCoordinates.length >= 2) {
          bounds.extend(mission.areaCoordinates[0]);
          bounds.extend(mission.areaCoordinates[1]);
          hasPoints = true;
        }
      });
    }

    // Fit map to calculated bounds or set default
    if (hasPoints) {
      map.fitBounds(bounds, {
        padding: 50, // Add padding around the edges
      });
    } else {
      // Fallback to UBCO if no valid coordinates
      map.setCenter(UBCO_COORDS);
      map.setZoom(DEFAULT_ZOOM);
    }
    
    setHasInitialized(true);
  }, [map, bots, missionsData, hasInitialized]);

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

  // Update map type when satelliteView changes
  useEffect(() => {
    if (!map) return;
    map.setMapTypeId(satelliteView ? 'satellite' : 'roadmap');
  }, [satelliteView, map]);

  // ========== LOADING STATE ==========

  if (loadError) {
    return <div className="flex items-center justify-center h-full">Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-full">Loading maps...</div>;
  }

  // ========== RENDER ==========
  return (
    <div className="h-full w-full relative">
      <GoogleMap
        options={mapOptions}
        mapContainerClassName="h-full w-full"
        onLoad={onLoad}
        onUnmount={onUnmount}
      />
      
      {/* Satellite/Map Toggle Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setSatelliteView(!satelliteView)}
          className="px-4 py-2 bg-white rounded-md shadow hover:bg-gray-100 flex items-center gap-2 transition-colors"
          aria-label={satelliteView ? 'Switch to map view' : 'Switch to satellite view'}
        >
          {satelliteView ? (
            <>
              <Map size={18} />
              <span>Map</span>
            </>
          ) : (
            <>
              <Satellite size={18} />
              <span>Satellite</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CustomGoogleMap;
