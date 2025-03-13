import React, { useEffect, useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { getTagStyle } from '@/utils/getTagStyle';
import Tag from '@/components/FleetDetails/Tag';

interface RealTimeChartProps {
    title?: string;
    lineColor?: string;
    randomGenerator?: (previous: number) => number;
    tags?: { label: string; url?: string }[];
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({ title = 'Add a title to the chart', lineColor = 'rgb(75, 192, 192)', randomGenerator, tags = [] }) => {
    const [lastTemperature, setLastTemperature] = useState<number>(50);

    const [data, setData] = useState({
        labels: Array.from({ length: 30 }, (_, i) => i),
        datasets: [
            {
                label: 'Real-time Data',
                data: Array.from({ length: 30 }, () => (randomGenerator ? randomGenerator(lastTemperature) : Math.random() * 150)),
                borderColor: lineColor,
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
            },
        ],
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setData((prevData) => {
                const newData = { ...prevData };
                const newTemp = randomGenerator ? randomGenerator(lastTemperature) : Math.random() * 150;
                newData.datasets[0].data.shift();
                newData.datasets[0].data.push(newTemp);
                setLastTemperature(newTemp);
                newData.labels = newData.labels.map((label) => label + 1);
                return newData;
            });
        }, 800);

        return () => clearInterval(interval);
    }, [randomGenerator, lastTemperature]);

    const options = useMemo(
        () => ({
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                y: {
                    min: 0,
                    max: 220,
                },
            },
            plugins: {
                tooltip: {
                    enabled: false,
                },
                legend: {
                    display: false,
                },
            },
            elements: {
                line: {
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                },
            },
        }),
        [],
    );

    return (
        <div>
            <div className="flex gap-[20px]">
                <h2>{title}</h2>
                <div className="flex gap-[5px]">
                    {tags.map((tag) => (
                        <Tag key={tag.label} label={tag?.label} url={tag?.url} />
                    ))}
                </div>
            </div>
            <div className="w-[100%] h-[90%]">
                <div style={{ width: '100%', height: '100%' }}>
                    <Line data={data} options={options} />
                </div>
            </div>
        </div>
    );
};

export default RealTimeChart;
