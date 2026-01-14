import ToggleSwitch from "@/components/ui/ToggleSwitch";
import ZoomControl from "@/components/features/map/ZoomControl";
import React, {useState} from "react";




const MapTools: React.FC<{ satelliteValue: boolean; onSatelliteViewChange: (val: boolean) => void  }> = ({ satelliteValue, onSatelliteViewChange }) => {

    return (
        <div
            className="absolute bottom-0 left-0 m-1 z-10 p-2 flex flex-col items-end gap-2 rounded-md shadow-lg border border-gray-300 bg-white/70 backdrop-blur-md">
            <div className="flex items-center gap-2">
        <span
            className={`text-sm font-medium px-2 py-1 rounded-md ${
                satelliteValue
                    ? "text-white bg-black/60 shadow"
                    : "text-gray-700 bg-transparent"
            }`}
        >
            Satellite View:
        </span>
                <ToggleSwitch
                    enabled={satelliteValue}
                    setEnabled={onSatelliteViewChange}
                />
            </div>
        </div>


    )
}

export default MapTools;