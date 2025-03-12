'use client';
import React, {useState, useCallback, useEffect} from 'react';
import RealTimeChart from '@/components/RealTimeChart';
import FleetTitle from '@/components/FleetDetails/FleetTitle';
import { useFleetData } from "@/hooks/useFleetData";
import BatteryIndicatorComponent from '@/components/FleetDetails/BatteryIndicator';
import { generateRandomTemperature } from '@/utils/generateRandomTemperature';
import { generateRandomThermalTemperature } from '@/utils/generateRandomThermalTemperature';
import InfoDetails from '@/components/FleetDetails/InfoDetails';
import ModelDetails from '@/components/FleetDetails/ModelDetails';
import Link from 'next/link';

const EmbrDetails = () => {
    const { fleets, bots, loading, error } = useFleetData();
    const [temperatureState, setTemperatureState] = useState(null);
    const [batteryState, setBatteryState] = useState(null);

    const getTemp = useCallback(() => {
        return temperatureState;
    }, [temperatureState]);

    const getBattery = useCallback(() => {
        return batteryState;
    }, [batteryState]);

    useEffect(() => {
        if (!bots || !bots[0]) {
            console.warn("bot details not found!");
            return;
        }

        const intervalId = setInterval(() => {
            if (!loading && bots && bots[0]) {
                const currentTemperature = bots[0].temperature;
                const currentBattery = bots[0].battery;
                setTemperatureState(currentTemperature);
                setBatteryState(currentBattery);
            }
        }, 1000); //change this time as needed

        return () => clearInterval(intervalId);
    }, [bots, loading]);


    return (
        <div className="grid grid-cols-[1fr_4fr] pl-[40px] pr-[40px] h-[100vh] relative">
            <div>
                <FleetTitle title={"TEST"}/>
                <BatteryIndicatorComponent level={18}/>
                <InfoDetails/>
            </div>
            <div className="grid grid-cols-2 grid-rows-2 gap-4 ml-[40px] pt-[2.5vh] pb-[2.5vh]">
                <RealTimeChart
                    lineColor="#008080"
                    dataFeed={getBattery}
                    title={"Battery"}
                    tags={[{label: "active"}]}
                />
                <RealTimeChart
                    dataFeed={getTemp}
                    title={"Temperature Probe"}
                    tags={[{label: "active"}]}
                />
                <RealTimeChart
                    lineColor="#5c9c60"
                    title={"Smoke Sensor"}
                    tags={[{label: "attention required"}]}
                />
                <RealTimeChart
                    lineColor="#c96184"
                    title={"Thermal Camera"}
                    tags={[
                        {label: "view snapshots", url: "https://google.com"},
                        {label: "active"}
                    ]}
                />
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