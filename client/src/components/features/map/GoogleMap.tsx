'use client';

import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';
import { Map, Satellite } from 'lucide-react';
import React, { useCallback, useEffect, useState, useRef } from 'react';

import { MissionType, RobotType } from '@/types';
import { CoordinatesType } from '@/types/coordinate.type';
import {
  createRectangle,
  updateRectangleBounds,
  coordinatesToBounds,
  removeRectangle,
  drawBots,
  drawMissionAreas,
  getMapOptions,
  GOOGLE_MAPS_LIBRARIES,
  initializeMapView
} from '@/components/features/map/MapTools';
import Search from '@/components/features/map/MapTools/search';

// ========== COMPONENT ==========

interface CustomGoogleMapProps {
  bots?: RobotType[];
  missionsData?: MissionType[];
  drawingMode?: boolean;
  currentRectangle?: { northWest: CoordinatesType; southEast: CoordinatesType } | null;
  onRectangleChange?: (northWest: CoordinatesType, southEast: CoordinatesType) => void;
  onRectangleSet?: (rectangle: google.maps.Rectangle | null) => void;
  showSearch?: boolean;
}

const CustomGoogleMap: React.FC<CustomGoogleMapProps> = ({
  bots,
  missionsData,
  drawingMode = false,
  currentRectangle,
  onRectangleChange,
  onRectangleSet,
  showSearch = true,
}) => {
  // Map State
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [satelliteView, setSatelliteView] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [editableRectangle, setEditableRectangle] = useState<google.maps.Rectangle | null>(null);
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  } as any);

  const mapOptions = isLoaded ? getMapOptions(satelliteView) : {};

  // ========== MAP CALLBACKS ==========

  const onLoad = useCallback(function callback(map: google.maps.Map | null) {
    if (map) {
      setMap(map);
    }
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // Handle map clicks to create rectangle when drawing mode is active and no rectangle exists
  useEffect(() => {
    if (!map || !drawingMode) return;

    const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!currentRectangle && e.latLng && onRectangleChange) {
        // Create a small rectangle at the clicked location
        const clickedLat = e.latLng.lat();
        const clickedLng = e.latLng.lng();
        const offset = 0.001; // Small default size
        
        onRectangleChange(
          { lat: clickedLat + offset, lng: clickedLng - offset },
          { lat: clickedLat - offset, lng: clickedLng + offset }
        );
      }
    });

    return () => {
      google.maps.event.removeListener(clickListener);
    };
  }, [map, drawingMode, currentRectangle, onRectangleChange]);

  // Create or update the editable rectangle
  useEffect(() => {
    if (!map || !drawingMode) return;

    // If no current rectangle, remove the editable one
    if (!currentRectangle) {
      removeRectangle(editableRectangle);
      setEditableRectangle(null);
      onRectangleSet?.(null);
      return;
    }

    const bounds = coordinatesToBounds(currentRectangle.northWest, currentRectangle.southEast);

    if (editableRectangle) {
      // Update existing rectangle bounds when coordinates change manually
      updateRectangleBounds(editableRectangle, bounds);
    } else {
      // Create new editable rectangle
      const rectangle = createRectangle(bounds, map, (northWest, southEast) => {
        onRectangleChange?.(northWest, southEast);
      });

      setEditableRectangle(rectangle);
      onRectangleSet?.(rectangle);
    }
  }, [map, drawingMode, currentRectangle, onRectangleChange, onRectangleSet, editableRectangle]);

  // Clean up rectangle when drawing mode is disabled
  useEffect(() => {
    if (!drawingMode && editableRectangle) {
      removeRectangle(editableRectangle);
      setEditableRectangle(null);
      onRectangleSet?.(null);
    }
  }, [drawingMode, editableRectangle, onRectangleSet]);

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

    initializeMapView(map, bots, missionsData);
    
    setHasInitialized(true);
  }, [map, bots, missionsData, hasInitialized]);

  // Update bot markers on map
  useEffect(() => {
    if (!map || !bots || bots.length === 0) return;
    drawBots(bots, map);
  }, [bots, map]);

  // Update mission areas on map (exclude editable one)
  useEffect(() => {
    if (!map || !missionsData || missionsData.length === 0) return;
    drawMissionAreas(missionsData, map);
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
      
      {/* Search Box */}
      {showSearch && isLoaded && (
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
      
      {/* Drawing Mode Indicator */}
      {drawingMode && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg">
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
