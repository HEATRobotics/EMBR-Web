import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import Tag from '@/components/features/bot/FleetDetails/Tag';
import { useAllBatteryData } from '@/hooks/useAllBatteryData';
import { useLatestBatteryData } from '@/hooks/useLatestBatteryData';

interface BatteryChartProps {
    title?: string;
    lineColor?: string;
    tags?: { label: string; url?: string }[];
}

const BatteryChart: React.FC<BatteryChartProps> = ({
    title = 'Battery Chart',
    lineColor = 'rgb(75, 192, 192)',
    tags = [],
}) => {
    const {battery: allBatteries, clockTime: allClockTimes } = useAllBatteryData();
    const {battery, clockTime } = useLatestBatteryData();
    
    const [data, setData] = useState({
        labels: [] as string[],
        datasets: [
            {
                label: 'Battery Level',
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
        if (!allBatteries?.length || !allClockTimes?.length) { // Ensure data is available
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
                    data: allBatteries,
                },
            ],
        });
        hasInitialized.current = true;

    }, [allBatteries, allClockTimes]);

    // Regularly update chart with new data
    useEffect(() => {
        
        if (battery.length > 0) {
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
                        data: [...prevData.datasets[0].data, battery[0]], // Append new battery value
                    },
                ],
            }));
        }

    }, [battery, clockTime]);

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

export default BatteryChart;
