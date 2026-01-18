'use client';

import { useJsApiLoader, GoogleMap, StandaloneSearchBox } from '@react-google-maps/api';
import { Map, Satellite } from 'lucide-react';
import React, { useCallback, useEffect, useState, useRef } from 'react';

import { MissionType } from '@/types/mission.type';
import { RobotType } from '@/types/robot.type';
import { CoordinatesType } from '@/types/coordinate.type';
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
  
  // Search box ref
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
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

  const handleGeocodeSearch = async (address: string) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    if (data.results?.[0]?.geometry?.location) {
      const { lat, lng } = data.results[0].geometry.location;
      map?.setCenter({ lat, lng });
      map?.setZoom(17);
    }
  };

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
      if (editableRectangle) {
        editableRectangle.setMap(null);
        setEditableRectangle(null);
        onRectangleSet?.(null);
      }
      return;
    }

    const bounds: google.maps.LatLngBoundsLiteral = {
      north: Math.max(currentRectangle.northWest.lat, currentRectangle.southEast.lat),
      south: Math.min(currentRectangle.northWest.lat, currentRectangle.southEast.lat),
      west: Math.min(currentRectangle.northWest.lng, currentRectangle.southEast.lng),
      east: Math.max(currentRectangle.northWest.lng, currentRectangle.southEast.lng),
    };

    if (editableRectangle) {
      // Update existing rectangle bounds when coordinates change manually
      const currentBounds = editableRectangle.getBounds();
      if (currentBounds) {
        const ne = currentBounds.getNorthEast();
        const sw = currentBounds.getSouthWest();
        // Only update if bounds have actually changed to avoid infinite loops
        if (Math.abs(ne.lat() - bounds.north) > 0.000001 ||
            Math.abs(sw.lat() - bounds.south) > 0.000001 ||
            Math.abs(sw.lng() - bounds.west) > 0.000001 ||
            Math.abs(ne.lng() - bounds.east) > 0.000001) {
          editableRectangle.setBounds(bounds);
        }
      }
    } else {
      // Create new editable rectangle
      const rectangle = new google.maps.Rectangle({
        bounds,
        map,
        editable: true,
        draggable: true,
        strokeColor: '#2563eb',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: '#3b82f6',
        fillOpacity: 0.25,
      });

      // Listen for bounds changes from user interaction
      rectangle.addListener('bounds_changed', () => {
        const newBounds = rectangle.getBounds();
        if (newBounds && onRectangleChange) {
          const ne = newBounds.getNorthEast();
          const sw = newBounds.getSouthWest();
          onRectangleChange(
            { lat: ne.lat(), lng: sw.lng() },
            { lat: sw.lat(), lng: ne.lng() }
          );
        }
      });

      setEditableRectangle(rectangle);
      onRectangleSet?.(rectangle);
    }
  }, [map, drawingMode, currentRectangle, onRectangleChange, onRectangleSet, editableRectangle]);

  // Clean up rectangle when drawing mode is disabled
  useEffect(() => {
    if (!drawingMode && editableRectangle) {
      editableRectangle.setMap(null);
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
      map.fitBounds(bounds, 50);
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

  // Update mission areas on map (exclude editable one)
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
      
      {/* Search Box */}
      {showSearch && isLoaded && (
        <div className="absolute top-4 left-4 z-10 w-80">
          <input
            type="text"
            placeholder="Enter address..."
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                handleGeocodeSearch(e.currentTarget.value);
              }
            }}
            className="w-full px-4 py-2 bg-gray-100 rounded-md shadow-lg border border-gray-300"
          />
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
