import { useState, useEffect } from "react";
import { useLidarData } from "@/hooks/useLidarData";

type Point = {
    x: number;
    y: number;
    distance: number;
};

type LidarVisualizerProps = {
    minAngle: number;
    maxAngle: number;
};

function updateData(data: number[], minValue = 100, maxValue = 400, step = 1): number[] {
    return data.map(value => {
        let change = Math.floor(Math.random() * (2 * step + 1)) - step;
        return Math.max(minValue, Math.min(maxValue, value + change)); // Keep within bounds
    });
}

function getColor(point: Point, minDistance: number, maxDistance: number): string {
    const ratio = (point.distance - minDistance) / (maxDistance - minDistance);
    const red = Math.round(Math.max(0, Math.min(255, 255 - ratio * 255)));
    const green = Math.round(Math.max(0, Math.min(255, ratio * 255)));
    return `rgb(${red},${green},0)`;
}

const LidarVisualizer: React.FC<LidarVisualizerProps> = ({ minAngle, maxAngle }) => {
    const { lidarData, loading } = useLidarData();

    // @ts-ignore
    const width = 400;

    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    if (loading || !lidarData) {

        return <div>Loading...</div>;
    }

    let distances: number[] = lidarData!.distances;
    distances = distances.map(distance => distance === 10000 ? 0 : distance);


    const maxDistance = Math.max(...distances, 1); // Safe since lidarData is not empty now
    const minDistance = Math.min(...distances);
    const medDistance = distances.reduce((sum, val) => sum + val, 0) / distances.length;
    const scale = (width / 2 - 10) / maxDistance;
    const numPoints = distances.length;

    const minRad = (minAngle * Math.PI) / 180;
    const maxRad = (maxAngle * Math.PI) / 180;

    // Convert polar to Cartesian coordinates
    const points: Point[] = distances.map((distance, index) => {
        const angle = maxRad - (index / (numPoints - 1)) * (maxRad - minRad) + Math.PI / 2;
        const scaledDistance = distance * scale;
        const x = centerX + scaledDistance * Math.cos(angle);
        const y = centerY + scaledDistance * Math.sin(angle);
        return { x, y, distance };
    });

    points.push({ x: centerX, y: centerY, distance: 0 }); // Close the polygon if necessary

    const blindspotPoints: Point[] = [
        { x: centerX, y: centerY, distance: 0 },
        { x: centerX + (centerY * Math.tan(minRad)), y: height, distance: 0 },
        { x: centerX + (centerY * Math.tan(maxRad)), y: height, distance: 0 },
    ];

    return (
        <div style={{ width, height, backgroundColor: "white" }}>
            <svg width={width} height={height} style={{ border: "1px solid black" }}>
                {/* Polygon Around the Bot */}
                <polygon
                    points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="rgba(49, 49, 58, 0.4)"
                    stroke="none"
                />

                {/* Points */}
                {points.map((point, index) => (
                    <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r="2"
                        fill={getColor(point, minDistance, maxDistance)}
                    />
                ))}

                {/* Lidar Center */}
                <circle cx={centerX} cy={centerY} r="5" fill="black" />

                {/* Distance Circles */}
                <circle cx={centerX} cy={centerY} r={maxDistance * scale} stroke="green" fill="none" />
                <circle cx={centerX} cy={centerY} r={medDistance * scale} stroke="orange" fill="none" />
                <circle cx={centerX} cy={centerY} r={minDistance * scale} stroke="red" fill="none" />

                {/* Blind Spot */}
                <polygon
                    points={blindspotPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="rgba(49, 49, 58, 1)"
                    stroke="none"
                />
            </svg>
        </div>
    );
};

export default LidarVisualizer;
