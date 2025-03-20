import React, { useEffect, useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { getTagStyle } from '@/utils/getTagStyle';
import Tag from '@/components/FleetDetails/Tag';
import { useAllBatteryData } from '@/hooks/useAllBatteryData';
import { useLatestBatteryData } from '@/hooks/useLatestBatteryData';

interface BatteryChart {
    title?: string;
    lineColor?: string;
    tags?: { label: string; url?: string }[];
    size: number;
}

const BatteryChart: React.FC<BatteryChart> = ({ title = 'Add a title to the chart', lineColor = 'rgb(75, 192, 192)', tags = [] }) => {
    const [lastTemperature, setLastTemperature] = useState<number>(-1);
    const {id, battery, loading, error} = useLatestBatteryData();
    const { id: allIds, battery: allBatteries, loading: allLoading, error: allError } = useAllBatteryData();
    const [data, setData] = useState({
        labels: Array.from({ length: 10 }, (_, i) => i),
        datasets: [
            {
                label: 'Real-time Data',
                data: Array.from({ length: 10 }, () => (null)), // null data init
                borderColor: lineColor,
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
            },
        ],
    });

    //this should only be called once to initialize the past data
    useEffect(() => {
        console.log('INITBATTERY:', allBatteries);
        if (allBatteries && allBatteries.length > 0) {
          setData((prevData) => {
            const newData = { ...prevData };
            newData.datasets[0].data.shift();
            newData.datasets[0].data.push(allBatteries[0]);
            newData.labels = newData.labels.map((label) => label + 1);
            return newData;
          });
        }
      }, []);

    //this is called regularly
    useEffect(() => {
        console.log('BOTDATA:', data);
        const interval = setInterval(() => {
          setData((prevData) => {
            if (battery && battery.length > 0) {
              const newData = { ...prevData };
              console.log('LATESTBATTERY:', battery);
              newData.datasets[0].data.shift();
              newData.datasets[0].data.push(battery[0]);
              newData.labels = newData.labels.map((label) => label + 1);
              return newData;
            }
            return prevData;
          });
        }, 5000); //change interval here

        return () => clearInterval(interval);
    }, [battery]);

    const options = useMemo(
        () => ({
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                y: {
                    min: 0,
                    max: 100,
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

export default BatteryChart;
