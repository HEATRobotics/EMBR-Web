/**
 * Calculates the area of a rectangle defined by lat/lng bounds
 * Uses the Haversine formula to account for Earth's curvature
 * 
 * @param bounds - The bounding box with north, south, east, west coordinates
 * @returns Area in square kilometers
 */
export function calculateRectangleArea(bounds: google.maps.LatLngBoundsLiteral): number {
    const { north, south, east, west } = bounds;
    
    // Earth's radius in kilometers
    const EARTH_RADIUS = 6371;
    
    // Convert degrees to radians
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    
    // Calculate width (distance between west and east at the center latitude)
    const centerLat = (north + south) / 2;
    const latRad = toRad(centerLat);
    const lngDiff = toRad(east - west);
    const width = EARTH_RADIUS * Math.abs(lngDiff) * Math.cos(latRad);
    
    // Calculate height (distance between north and south)
    const latDiff = toRad(north - south);
    const height = EARTH_RADIUS * Math.abs(latDiff);
    
    // Area = width * height
    return width * height;
}

/**
 * Formats area value for display
 * @param areaKm2 - Area in square kilometers
 * @returns Formatted string with appropriate units
 */
export function formatArea(areaKm2: number): string {
    if (areaKm2 < 0.01) {
        // For very small areas, show in square meters
        const areaM2 = areaKm2 * 1_000_000;
        return `${areaM2.toFixed(0)} m²`;
    } else if (areaKm2 < 1) {
        // For small areas, show with 3 decimal places
        return `${areaKm2.toFixed(3)} km²`;
    } else {
        // For larger areas, show with 2 decimal places
        return `${areaKm2.toFixed(2)} km²`;
    }
}
