import { useState, useEffect } from "react";

type Point = {
    x: number;
    y: number;
    distance: number;
};

type LidarVisualizerProps = {
    data: number[];
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
    const red = Math.max(0, Math.min(255, 255 - ratio * 255));
    const green = Math.max(0, Math.min(255, ratio * 255));
    return `rgb(${red},${green},0)`;
}

const LidarVisualizer: React.FC<LidarVisualizerProps> = ({ data, minAngle, maxAngle }) => {
    const [lidarData, setLidarData] = useState<number[]>(data);

    // Update lidarData when new data is received
    useEffect(() => {
        const correctedData = data.map(distance => distance === 10000 ? 0 : distance);

        setLidarData(correctedData);
    }, [data]);

    // // Animate small changes to the data
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setLidarData(prevData => updateData(prevData));
    //     }, 100); // Update every 100ms
    //
    //     return () => clearInterval(interval);
    // }, []);

    const width = 400;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.max(...lidarData, 1); // Avoid division by zero
    const minDistance = Math.min(...lidarData);
    const medDistance = lidarData.reduce((sum, val) => sum + val, 0) / lidarData.length;
    const scale = (width / 2 - 10) / maxDistance;
    const numPoints = lidarData.length;

    const minRad = (minAngle * Math.PI) / 180;
    const maxRad = (maxAngle * Math.PI) / 180;

    // Convert polar to Cartesian coordinates
    const points: Point[] = lidarData.map((distance, index) => {
        const angle = maxRad - ((index / (numPoints - 1)) * (maxRad - minRad)) + Math.PI / 2; // Mapping from right to left
        const scaledDistance = distance * scale;
        const x = centerX + scaledDistance * Math.cos(angle);
        const y = centerY + scaledDistance * Math.sin(angle);
        return { x, y, distance };
    });

    points.push({ x: centerX, y: centerY, distance: 0 });

    const blindspotPoints: Point[] = [
        { x: centerX, y: centerY, distance: 0 },
        { x: centerY + centerY * Math.tan(minRad), y: height, distance: 0 },
        { x: centerY + centerY * Math.tan(maxRad), y: height, distance: 0 }
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
        <circle key={index} cx={point.x} cy={point.y} r="2" fill={getColor(point, minDistance, maxDistance)} />
    ))}

    {/* Lidar Center */}
    <circle cx={centerX} cy={centerY} r="5" fill="black" />

        {/* Circles */}
        <circle cx={centerX} cy={centerY} r={maxDistance * scale} stroke="green" fill="none" />
    <circle cx={centerX} cy={centerY} r={medDistance * scale} stroke="orange" fill="none" />
    <circle cx={centerX} cy={centerY} r={minDistance * scale} stroke="red" fill="none" />

        {/* Blind Spot */}
        <polygon points={blindspotPoints.map((p) => `${p.x},${p.y}`).join(" ")} fill="rgba(49, 49, 58)" stroke="none" />
        </svg>
        </div>
);
};

export default LidarVisualizer;
