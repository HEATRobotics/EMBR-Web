// components/MapTools/MapRectangleDrawTool.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMap } from '@react-google-maps/api';

interface MapRectangleDrawToolProps {
    onBoundsChanged: (bounds: google.maps.LatLngBoundsLiteral | undefined) => void;
    drawingMode: boolean;
}

const MapRectangleDrawTool: React.FC<MapRectangleDrawToolProps> = ({ onBoundsChanged, drawingMode }) => {
    const map = useGoogleMap();
    const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
    const rectangleRef = useRef<google.maps.Rectangle | null>(null);

    useEffect(() => {
        if (!map) return;

        if (!drawingManagerRef.current) {
            drawingManagerRef.current = new google.maps.drawing.DrawingManager({
                drawingMode: google.maps.drawing.OverlayType.RECTANGLE, // Initialize in rectangle drawing mode
                drawingControl: false, // We'll control drawing mode programmatically
                rectangleOptions: {
                    editable: true,
                    draggable: true,
                    fillColor: '#AA0000',
                    fillOpacity: 0.2,
                    strokeColor: '#FF0000',
                    strokeWeight: 1,
                },
                map: map,
            });
        }

        const drawingManager = drawingManagerRef.current;

        if (drawingMode) {
            drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
        } else {
            drawingManager.setDrawingMode(null); 
        }


        const handleRectangleComplete = (rectangle: google.maps.Rectangle) => {
            if (rectangleRef.current) {
                rectangleRef.current.setMap(null); // remove previous rectangle if exists
            }
            rectangleRef.current = rectangle;
            drawingManager.setDrawingMode(null); // disable drawing mode after drawing once

            rectangle.addListener('bounds_changed', () => {
                const bounds = rectangle.getBounds();
                if (bounds) {
                    const ne = bounds.getNorthEast();
                    const sw = bounds.getSouthWest();
                    onBoundsChanged({
                        north: ne.lat(),
                        east: ne.lng(),
                        south: sw.lat(),
                        west: sw.lng(),
                    });
                } else {
                    onBoundsChanged(undefined); 
                }
            });

            const bounds = rectangle.getBounds();
            if (bounds) {
                const ne = bounds.getNorthEast();
                const sw = bounds.getSouthWest();
                onBoundsChanged({
                    north: ne.lat(),
                    east: ne.lng(),
                    south: sw.lat(),
                    west: sw.lng(),
                });
            }
        };


        const overlayCompleteListener = google.maps.event.addListener(drawingManager, 'rectanglecomplete', handleRectangleComplete);


        return () => {
            google.maps.event.removeListener(overlayCompleteListener);
            if (drawingManagerRef.current) {
                drawingManagerRef.current.setMap(null); // Clean up drawing manager on unmount
                drawingManagerRef.current = null;
            }
             if (rectangleRef.current) {
                rectangleRef.current.setMap(null);
                rectangleRef.current = null;
             }
        };
    }, [map, onBoundsChanged, drawingMode]);


    return null; // this component only controls map drawing, so nothing is returned
};

export default MapRectangleDrawTool;