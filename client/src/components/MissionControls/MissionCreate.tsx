// MissionCreate.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { MissionType } from '@/types/mission.type';
import { RobotType } from '@/types/robot.type';
import { Input, Select } from 'antd';
import MissionCreateRectangle from '@/components/MapTools/MissionCreateRectangle'; 
import { CoordinatesType } from '@/types/coordinate.type';

function MissionCreate({
    cancelCreate,
    saveCreate,
    newMission,
    setNewMission,
    bots,
    map,
}: {
    cancelCreate: () => void;
    saveCreate: (mission: MissionType) => void;
    newMission: MissionType;
    setNewMission: React.Dispatch<React.SetStateAction<MissionType>>;
    bots: RobotType[];
    map: google.maps.Map | null;
}) {
    const [activeStep, setActiveStep] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [isDrawing, setIsDrawing] = useState(false); 

    const botOptions = bots.map((bot) => ({ value: bot.id, label: bot.name }));


    useEffect(() => {
        if (newMission) {
            if (newMission.areaCoordinates) {
                setActiveStep(1);
            }
            if (newMission.botID) {
                setActiveStep(2);
            }
        }
    }, [newMission]);

    const handleSelect = (value: number, label: string) => {
        setActiveStep(2);
        console.log("Set active state to 2");
        setNewMission((prev) => ({ ...prev, botID: value }));
    };

    const handleNameInput = (value: string) => {
        setInputValue(value);
    };

    const handleSave = () => {
      const updatedMission: MissionType = {
          ...newMission,  // Retain the existing data
          missionName: inputValue,  
          botID: newMission.botID,  
          areaCoordinates: newMission.areaCoordinates,  
          progress: newMission.progress || 0,  
          averageTemperature: newMission.averageTemperature || 0,  
          timePassed: newMission.timePassed || 0,  
          timeEstimated: newMission.timeEstimated || 0,  
          hotspots: newMission.hotspots || []  
      };
  
      saveCreate(updatedMission);  // Pass the updated mission object to save
  };

    const handleAreaSelectClick = () => {
        setIsDrawing(true); 
        setActiveStep(0); 
        setNewMission((prev) => ({ ...prev, areaCoordinates: undefined })); // Clear previous area
    };

    const handleBoundsChanged = useCallback((bounds: google.maps.LatLngBoundsLiteral | undefined) => {
        if (bounds) {
            const coordinates: CoordinatesType[] = [
                { lat: bounds.north, lng: bounds.west },
                { lat: bounds.south, lng: bounds.east }
            ];

            setNewMission((prev) => ({ ...prev, areaCoordinates: coordinates }));
            setActiveStep(1); // Move to the next step after area is selected
            setIsDrawing(false); // Turn off drawing mode after rectangle is drawn
        }
    }, [setNewMission]);

    return (
        <div className="max-w-[310px] justify-self-end self-end flex flex-col items-end gap-y-3">
            <button className="left-[35px] px-3.5 py-1 w-fit rounded-[22px] text-[15px] leading-[18px] bg-orange" onClick={cancelCreate}>
                cancel
            </button>
            <div className="flex flex-col py-5 px-[27px] gap-y-5 rounded-[22px] bg-white">
                <p className="text-[20px] leading-6">Create a new mission</p>
                <div className="flex flex-col gap-y-2.5">
                    <div className="text-[15px] leading-[18px]" style={{ color: activeStep === 0 ? 'black' : '#B1B1B1' }}>
                        <p>Select an area</p>
                        {activeStep <= 0 && (
                            <button
                                onClick={handleAreaSelectClick}
                                className="left-[35px] px-3.5 py-1 rounded-[22px] text-[15px] leading-[18px] border border-black hover:!bg-lightgray disabled:!bg-transparent"
                            >
                                Draw Area
                            </button>
                        )}
                         {newMission.areaCoordinates && activeStep >= 1 && (
                            <p className="text-green-500">Area Selected</p>
                        )}
                    </div>

                    <div className="text-[15px] leading-[18px] flex flex-col gap-y-2.5" style={{ color: activeStep === 1 ? 'black' : '#B1B1B1' }}>
                        <p>Select a bot</p>
                        {activeStep >= 1 && (
                            <Select
                                disabled={activeStep !== 1}
                                onSelect={(value, { label }) => handleSelect(value, label)}
                                showSearch
                                value={newMission.botID || undefined}
                                placeholder="Select a bot"
                                optionFilterProp="children"
                                className="[&_div.ant-select-selector]:!bg-transparent [&.ant-select-disabled_*]:!cursor-default"
                                filterOption={(input, option) => (option?.label ?? '').includes(input)}
                                filterSort={(optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())}
                                options={botOptions}
                            />
                        )}
                    </div>
                    <div className="text-[15px] leading-[18px] flex flex-col gap-y-2.5" style={{ color: activeStep === 2 ? 'black' : '#B1B1B1' }}>
                        <p>Name the mission</p>
                        {activeStep >= 2 && <Input placeholder="Enter the name of the mission..." value={inputValue} onChange={(e) => handleNameInput(e.target.value)} />}
                    </div>
                </div>
            </div>
            {inputValue && activeStep >= 2 && ( // Only show save button when name is inputted and at step 2 or later
                <button className="left-[35px] px-3.5 py-1 w-fit rounded-[22px] text-[15px] leading-[18px] bg-orange" onClick={handleSave}>
                    save
                </button>
            )}
             {/* Render MissionCreateRectangle only when creating mission and after map is loaded */}
            <MissionCreateRectangle onBoundsChanged={handleBoundsChanged} map={map} />
        </div>
    );
}

export default MissionCreate;