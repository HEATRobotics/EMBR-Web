import React, { useEffect, useState } from 'react';
import { MissionType } from '@/types/mission.type';
import { Input, Select } from 'antd';

function MissionCreate({
    cancelCreate,
    saveCreate,
    newMission,
    setNewMission,
    fleets,
}: {
    cancelCreate: () => void;
    saveCreate: (mission: MissionType) => void;
    newMission: MissionType;
    setNewMission: React.Dispatch<React.SetStateAction<MissionType>>;
    fleets: { value: string | number; label: string }[];
}) {
    const [activeStep, setActiveStep] = useState(0);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (newMission) {
            if (newMission.blueCoordinates) {
                setActiveStep(1);
            }

            if (newMission.fleetName) {
                setActiveStep(2);
            }
        }
    }, [newMission]);

    const handleSelect = (value: string | number, label: string) => {
        setActiveStep(2);
        setNewMission((prev) => ({ ...prev, fleetId: value, fleetName: label }));
    };

    const handleNameInput = (value: string) => {
        setInputValue(value);
    };

    const handleSave = () => {
        setNewMission((prev) => ({ ...prev, name: inputValue }));
        saveCreate({ ...newMission, name: inputValue });
    };

    return (
        <div className="max-w-[310px] justify-self-end self-end flex flex-col items-end gap-y-3">
            <button className="left-[35px] px-3.5 py-1 w-fit rounded-[22px] text-[15px] leading-[18px] bg-orange" onClick={cancelCreate}>
                cancel
            </button>
            <div className="flex flex-col py-5 px-[27px] gap-y-5 rounded-[22px] bg-white">
                <p className="text-[20px] leading-6">Create a new mission</p>
                <div className="flex flex-col gap-y-2.5">
                    <p className="text-[15px] leading-[18px]" style={{ color: activeStep === 0 ? 'black' : '#B1B1B1' }}>
                        Select an area
                    </p>
                    <div className="text-[15px] leading-[18px] flex flex-col gap-y-2.5" style={{ color: activeStep === 1 ? 'black' : '#B1B1B1' }}>
                        <p>Select a fleet</p>
                        {activeStep >= 1 && (
                            <Select
                                disabled={activeStep !== 1}
                                onSelect={(value, { label }) => handleSelect(value, label)}
                                showSearch
                                value={newMission.fleetId || undefined}
                                placeholder="Select a fleet"
                                optionFilterProp="children"
                                className="[&_div.ant-select-selector]:!bg-transparent [&.ant-select-disabled_*]:!cursor-default"
                                filterOption={(input, option) => (option?.label ?? '').includes(input)}
                                filterSort={(optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())}
                                options={fleets}
                            />
                        )}
                    </div>
                    <div className="text-[15px] leading-[18px] flex flex-col gap-y-2.5" style={{ color: activeStep === 2 ? 'black' : '#B1B1B1' }}>
                        <p>Name the mission</p>
                        {activeStep >= 2 && <Input placeholder="Enter the name of the mission..." onChange={(e) => handleNameInput(e.target.value)} />}
                    </div>
                </div>
            </div>
            {inputValue && (
                <button className="left-[35px] px-3.5 py-1 w-fit rounded-[22px] text-[15px] leading-[18px] bg-orange" onClick={handleSave}>
                    save
                </button>
            )}
        </div>
    );
}

export default MissionCreate;
