'use client';
import React from 'react';
import BatteryChart from '@/components/BatteryChart';
import FleetTitle from '@/components/FleetDetails/FleetTitle';
import StatusOverviewComponent from '@/components/FleetDetails/StatusOverview';
import InfoDetails from '@/components/FleetDetails/InfoDetails';
import Link from 'next/link';
import TemperatureChart from '@/components/TemperatureChart';
import LidarVisualizer from "@/components/Lidar/LidarVisualizer";

const EmbrDetails = () => {

    return (
        <div className="grid grid-cols-[1fr_4fr] pl-[40px] pr-[40px] h-[100vh] relative">
            <div>
                <StatusOverviewComponent/>
            </div>
            <div className="grid grid-cols-2 grid-rows-2 gap-4 ml-[40px] pt-[2.5vh] pb-[2.5vh]">
                <BatteryChart
                    lineColor="#008080"
                    title={"Battery"}
                />
                <TemperatureChart
                    lineColor="#FF0000"
                    title={"Temperature Probe"}
                />
                <LidarVisualizer
                    data={[0]}
                    minAngle={0}
                    maxAngle={360}>
                </LidarVisualizer>
            </div>
            <div className="absolute top-5 right-5">
                <Link href="/" className="p-2 rounded-full bg-red-600 text-black border-black border-2 shadow-lg hover:bg-red-700 cursor-pointer flex items-center justify-center w-8 h-8 group">
                    x
                    <span className="absolute top-10 right-0 bg-black text-white text-xs rounded py-1 px-4 hidden w-[170px] group-hover:block">
                        Return to the homepage
                    </span>
                </Link>
            </div>
        </div>
    );
};

export default EmbrDetails;