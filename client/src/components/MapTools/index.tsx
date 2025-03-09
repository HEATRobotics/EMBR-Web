import ToggleSwitch from "@/components/ToggleSwitch";
import ZoomControl from "@/components/ZoomControl";
import React, {useState} from "react";




const MapTools: React.FC<{ satelliteValue: boolean; onSatelliteViewChange: (val: boolean) => void  }> = ({ satelliteValue, onSatelliteViewChange }) => {

    return (
        <div
            className="absolute py-[30px] px-[30px] bottom-5 left-5 flex flex-col flex-end justify-end float-right items-end gap-[5px] z-[10]">
            <div className="flex items-center">
          <span
              className={`${satelliteValue &&
              "text-white bg-black bg-opacity-50 px-2 py-1 rounded shadow"
              } text-sm font-medium text-gray-700 mr-2`}
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