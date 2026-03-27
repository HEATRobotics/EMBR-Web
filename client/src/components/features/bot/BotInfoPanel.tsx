'use client';

import { useEffect, useState } from 'react';

import InfoGrid from '@/components/ui/InfoGrid';
import { RobotType } from '@/types/robot.type';

function BotInfoPanel({ selectedBot }: { selectedBot: RobotType }) {
  const [currentTab, setCurrentTab] = useState<'Overview' | 'Orientation' | 'Position'>(
    'Orientation',
  );

  const [overviewData, setOverviewData] = useState([
    { title: 'Battery', value: '' },
    { title: 'Temperature', value: '' },
    { title: 'Speed', value: '' },
    { title: 'Altitude', value: '' },
  ]);

  const [orientationData, setOrientationData] = useState([
    { title: 'Yaw', value: '' },
    { title: 'Roll', value: '' },
    { title: 'Pitch', value: '' },
    { title: 'Ground Speed', value: '' },
  ]);

  const [positionData, setPositionData] = useState([
    { title: 'Latitude', value: '' },
    { title: 'Longitude', value: '' },
    { title: 'Altitude', value: '' },
    { title: 'Speed', value: '' },
  ]);

  useEffect(() => {
    if (!selectedBot) return; // Safeguard against undefined

    setOverviewData([
      {
        title: 'Battery',
        value: selectedBot.battery ? `${selectedBot.battery.toFixed(0)}%` : 'N/A',
      },
      {
        title: 'Speed',
        value: `${Math.sqrt(selectedBot.gz ** 2 + selectedBot.gy ** 2 + selectedBot.gx ** 2) ?? 'N/A'} m/s`,
      },
      { title: 'Altitude', value: `0 m` },
    ]);

    setOrientationData([
      { title: 'Yaw', value: `N/A°` },
      { title: 'Roll', value: `N/A°` },
      { title: 'Pitch', value: `N/A°` },
      {
        title: 'Ground Speed',
        value: `${Math.sqrt(selectedBot.gz ** 2 + selectedBot.gy ** 2 + selectedBot.gx ** 2) ?? 'N/A'} m/s`,
      },
    ]);

    setPositionData([
      { title: 'Latitude', value: `${selectedBot.lat ?? 'N/A'}` },
      { title: 'Longitude', value: `${selectedBot.lng ?? 'N/A'}` },
      { title: 'Altitude', value: `0 m` },
      {
        title: 'Speed',
        value: `${Math.sqrt(selectedBot.gz ** 2 + selectedBot.gy ** 2 + selectedBot.gx ** 2) ?? 'N/A'} m/s`,
      },
    ]);
  }, [selectedBot]);

  return (
    <>
      {/* Tab Menu */}
        <div className="flex w-full overflow-hidden shadow border-b border-t border-black gap-2 justify-center bg-[#2c2c2c] ">
            <button
                onClick={() => setCurrentTab("Overview")}
                style={{
                  backgroundColor: currentTab === "Overview" ? "#ee2c24"  : "#2c2c2c",
                  color: currentTab === "Overview" ? "#e1e0e0ff" : "#333333", 
                  transition: "background-color 0.2s, color 0.2s",
                }}
                className={` py-3 px-7 mt-1 mb-1 text-center text-base font-semibold transition-colors duration-200 rounded-md ${
                    currentTab === "Overview"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-[#2c2c2c] text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                }`}
            >
                Overview
            </button>
            <button
                onClick={() => setCurrentTab("Orientation")}
                style={{
                  backgroundColor: currentTab === "Orientation" ? "#ee2c24"  : "#2c2c2c",
                  color: currentTab === "Orientation" ? "#e1e0e0ff" : "#333333", 
                  transition: "background-color 0.2s, color 0.2s",
                }}
                className={` py-3 px-5 mt-1 mb-1 text-center text-base font-semibold transition-colors duration-200 rounded-md ${
                    currentTab === "Orientation"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-[#2c2c2c] text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                }`}
            >
                Orientation
            </button>
            <button
                onClick={() => setCurrentTab("Position")}
                style={{
                  backgroundColor: currentTab === "Position" ? "#ee2c24"  : "#2c2c2c",
                  color: currentTab === "Position" ? "#e1e0e0ff" : "#333333", 
                  transition: "background-color 0.2s, color 0.2s",
                }}
                className={` py-3 px-9 mt-1 mb-1 text-center text-base font-semibold transition-colors duration-200 rounded-md ${
                    currentTab === "Position"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-[#2c2c2c] text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                }`}
            >
                Position
            </button>
            

        </div>

      {currentTab === 'Overview' && <InfoGrid data={overviewData} />}

      {currentTab === 'Orientation' && <InfoGrid data={orientationData} />}

      {currentTab === 'Position' && <InfoGrid data={positionData} />}
    </>
  );
}

export default BotInfoPanel;