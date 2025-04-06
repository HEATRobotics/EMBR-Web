import React, { useEffect, useRef } from 'react';

interface MissionCreateRectangleProps {
  map: google.maps.Map | null;
  onBoundsChanged: (bounds: google.maps.LatLngBoundsLiteral | undefined) => void;
  initialBounds?: google.maps.LatLngBoundsLiteral;
}

const MissionCreateRectangle: React.FC<MissionCreateRectangleProps> = ({
  map,
  onBoundsChanged,
  initialBounds,
}) => {
  const rectangleRef = useRef<google.maps.Rectangle | null>(null);

  useEffect(() => {
    if (!map) return;

    // Use sample initial bounds around campus if not provided
    // TODO: make this bounds start around the coordinates of the chosen bot.
    const bounds = initialBounds || {
      north: 49.959099,
      south: 49.917121,
      east: -119.387693,
      west: -119.402733
    };

    // Create the rectangle with editable and draggable options.
    const rectangle = new google.maps.Rectangle({
      bounds: bounds,
      editable: true,
      draggable: true,
    });
    rectangle.setMap(map);
    rectangleRef.current = rectangle;

    // Listen for events to track changes.
    const events = ['bounds_changed', 'dragstart', 'drag', 'dragend'];
    events.forEach((eventName) => {
      rectangle.addListener(eventName, () => {
        const currentBounds = rectangle.getBounds();
        if (currentBounds) {
          onBoundsChanged(currentBounds.toJSON());
        } else {
          onBoundsChanged(undefined);
        }
      });
    });

    // Clean up on unmount.
    return () => {
      if (rectangleRef.current) {
        rectangleRef.current.setMap(null);
        rectangleRef.current = null;
      }
    };
  }, [map, onBoundsChanged, initialBounds]);

  return null; // This component does not render any visible element.
};

export default MissionCreateRectangle;
