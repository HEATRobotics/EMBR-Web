import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import Tag from '@/components/FleetDetails/Tag';
import { useAllTemperatureData } from '@/hooks/useAllTemperatureData';
import { useLatestTemperatureData } from '@/hooks/useLatestTemperatureData';

interface TemperatureChartProps {
    title?: string;
    lineColor?: string;
    tags?: { label: string; url?: string }[];
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({
    title = 'Temperature Chart',
    lineColor = 'rgb(75, 192, 192)',
    tags = [],
}) => {
    const {temperature: allTemperatures, clockTime: allClockTimes } = useAllTemperatureData();
    const {temperature, clockTime } = useLatestTemperatureData();
    
    const [data, setData] = useState({
        labels: [] as string[],
        datasets: [
            {
                label: 'Temperature',
                data: [] as number[],
                borderColor: lineColor,
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
            },
        ],
    });

    // Initialize with all historical data
    const hasInitialized = useRef(false); // Tracks if effect has already run

    useEffect(() => {
        if (!allTemperatures?.length || !allClockTimes?.length) { // Ensure data is available
            return;
        } 
        if (hasInitialized.current) return; // Prevent running more than once

        
        setData({
            labels: allClockTimes.map(time => new Date(time).toLocaleString('en-US', { 
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false // 24-hour format
            })),
            datasets: [
                {
                    ...data.datasets[0],
                    data: allTemperatures,
                },
            ],
        });
        hasInitialized.current = true;

    }, [allTemperatures, allClockTimes]);

    // Regularly update chart with new data
    useEffect(() => {
        
        if (temperature.length > 0) {
            setData((prevData) => ({
                labels: [...prevData.labels, new Date(clockTime[0]).toLocaleString('en-US', { 
                    month: '2-digit',
                    day: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false // 24-hour format
                })],
                datasets: [
                    {
                        ...prevData.datasets[0],
                        data: [...prevData.datasets[0].data, temperature[0]], // Append new temperature value
                    },
                ],
            }));
        }

    }, [temperature, clockTime]);

    const options = useMemo(
        () => ({
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                y: {
                    min: 0,
                    max: 100,
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10, // Adjust based on how many labels you want visible
                    },
                },
            },
            plugins: {
                tooltip: { enabled: true },
                legend: { display: false },
            },
        }),
        []
    );

    return (
        <div>
            <h2>{title}</h2>
            
            <div style={{ width: '100%', height: '300px' }}>
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

export default TemperatureChart;
