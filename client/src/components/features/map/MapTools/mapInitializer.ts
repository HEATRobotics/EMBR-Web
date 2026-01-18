import { MissionType } from '@/types/mission.type';
import { RobotType } from '@/types/robot.type';
import { DEFAULT_ZOOM, UBCO_COORDS } from './mapConfig';

/**
 * Calculate bounds from bots and missions data
 */
export const calculateBoundsFromData = (
  bots?: RobotType[],
  missionsData?: MissionType[]
): { bounds: google.maps.LatLngBounds; hasPoints: boolean } => {
  const bounds = new google.maps.LatLngBounds();
  let hasPoints = false;

  // Add bot positions to bounds
  if (bots && bots.length > 0) {
    bots.forEach((bot) => {
      if (bot.coordinates) {
        bounds.extend(bot.coordinates);
        hasPoints = true;
      }
    });
  }

  // Add mission area coordinates to bounds
  if (missionsData && missionsData.length > 0) {
    missionsData.forEach((mission) => {
      if (mission.areaCoordinates && mission.areaCoordinates.length >= 2) {
        bounds.extend(mission.areaCoordinates[0]);
        bounds.extend(mission.areaCoordinates[1]);
        hasPoints = true;
      }
    });
  }

  return { bounds, hasPoints };
};

/**
 * Initialize map view based on available data
 */
export const initializeMapView = (
  map: google.maps.Map,
  bots?: RobotType[],
  missionsData?: MissionType[]
): void => {
  const hasBots = bots && bots.length > 0;
  const hasMissions = missionsData && missionsData.length > 0;

  if (!hasBots && !hasMissions) {
    // No data yet - keep default view
    return;
  }

  const { bounds, hasPoints } = calculateBoundsFromData(bots, missionsData);

  if (hasPoints) {
    map.fitBounds(bounds, 50);
  } else {
    // Fallback to UBCO if no valid coordinates
    map.setCenter(UBCO_COORDS);
    map.setZoom(DEFAULT_ZOOM);
  }
};
