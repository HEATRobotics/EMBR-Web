// MissionCreate.tsx
import { Input, Select } from 'antd';
import React, { useEffect, useState, useCallback, useMemo } from 'react';

import MissionCreateRectangle from '@/components/features/map/MapTools/MissionCreateRectangle';
import { CoordinatesType } from '@/types/coordinate.type';
import { MissionType } from '@/types/mission.type';
import { RobotType } from '@/types/robot.type';
import { calculateRectangleArea, formatArea } from '@/utils/calculateArea';

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
  const [inputValue, setInputValue] = useState('');

  // Filter to show only bots that are ready or assigned (bots that are "inactive" should not be available)
  const availableBots = bots.filter(
    (bot) =>
      bot.assignmentStatus === 'ready' ||
      bot.assignmentStatus === 'assigned' ||
      bot.assignmentStatus === 'active',
  );

  const botOptions = availableBots.map((bot) => ({
    value: Number(bot.id),
    label: `${bot.name} (${bot.operationalStatus})`,
  }));

  // Calculate area and format coordinates for display
  const areaInfo = useMemo(() => {
    if (!newMission.areaCoordinates || newMission.areaCoordinates.length !== 2) {
      return null;
    }

    const bounds = {
      north: newMission.areaCoordinates[0].lat,
      west: newMission.areaCoordinates[0].lng,
      south: newMission.areaCoordinates[1].lat,
      east: newMission.areaCoordinates[1].lng,
    };

    const areaKm2 = calculateRectangleArea(bounds);

    return {
      north: bounds.north.toFixed(6),
      south: bounds.south.toFixed(6),
      east: bounds.east.toFixed(6),
      west: bounds.west.toFixed(6),
      area: formatArea(areaKm2),
    };
  }, [newMission.areaCoordinates]);

  // Determine if all fields are completed for enabling Save
  const isFormComplete = Boolean(
    inputValue.trim() &&
    newMission?.assignedBots &&
    newMission.assignedBots.length > 0 &&
    newMission?.areaCoordinates &&
    newMission.areaCoordinates.length === 2,
  );

  const handleBotChange = (values: number[]) => {
    setNewMission((prev) => ({ ...prev, assignedBots: values.map(Number) }));
  };

  const handleNameInput = (value: string) => {
    setInputValue(value);
  };

  const handleSave = () => {
    const updatedMission: MissionType = {
      ...newMission, // Retain the existing data
      missionName: inputValue,
      areaCoordinates: newMission.areaCoordinates,
      progress: newMission.progress || 0,
      averageTemperature: newMission.averageTemperature || 0,
      timePassed: newMission.timePassed || 0,
      timeEstimated: newMission.timeEstimated || 0,
      hotspots: newMission.hotspots || [],
      assignedBots: newMission.assignedBots ?? [],
    };

    saveCreate(updatedMission); // Pass the updated mission object to save
  };

  const handleBoundsChanged = useCallback(
    (bounds: google.maps.LatLngBoundsLiteral | undefined) => {
      if (bounds) {
        const coordinates: CoordinatesType[] = [
          { lat: bounds.north, lng: bounds.west },
          { lat: bounds.south, lng: bounds.east },
        ];

        setNewMission((prev) => ({ ...prev, areaCoordinates: coordinates }));
      }
    },
    [setNewMission],
  );

  // Convert newMission coordinates to bounds format for the rectangle
  const initialBounds = useMemo(() => {
    if (newMission.areaCoordinates && newMission.areaCoordinates.length === 2) {
      return {
        north: newMission.areaCoordinates[0].lat,
        west: newMission.areaCoordinates[0].lng,
        south: newMission.areaCoordinates[1].lat,
        east: newMission.areaCoordinates[1].lng,
      };
    }
    return undefined;
  }, [newMission.areaCoordinates]);

  return (
    <div className="max-w-[310px] justify-self-end self-end flex flex-col items-end gap-y-3">
      <div className="flex flex-col py-5 px-[27px] gap-y-5 rounded-[22px] bg-white">
        <p className="text-[20px] leading-6">Create a new mission</p>
        <div className="flex flex-col gap-y-4">
          {/* Area selection */}
          <div className="text-[15px] leading-[18px] flex flex-col gap-y-2">
            <p className="font-medium">Mission Area</p>
            {areaInfo ? (
              <div className="text-[13px] text-gray-700 space-y-1">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div>
                    <span className="font-medium">North:</span> {areaInfo.north}°
                  </div>
                  <div>
                    <span className="font-medium">South:</span> {areaInfo.south}°
                  </div>
                  <div>
                    <span className="font-medium">East:</span> {areaInfo.east}°
                  </div>
                  <div>
                    <span className="font-medium">West:</span> {areaInfo.west}°
                  </div>
                </div>
                <div className="pt-1 font-medium text-green-600">Total Area: {areaInfo.area}</div>
              </div>
            ) : (
              <p className="text-gray-500 text-[13px]">Adjust the rectangle on the map</p>
            )}
          </div>

          {/* Bot selection */}
          <div className="text-[15px] leading-[18px] flex flex-col gap-y-2.5">
            <p>Select a bot</p>
            <Select
              mode="multiple"
              onChange={(values) => handleBotChange(values as number[])}
              showSearch
              value={newMission.assignedBots || []}
              placeholder="Select bot(s)"
              optionFilterProp="children"
              className="[&_div.ant-select-selector]:!bg-transparent"
              filterOption={(input, option) =>
                ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
              }
              filterSort={(optionA, optionB) =>
                String(optionA?.label ?? '')
                  .toLowerCase()
                  .localeCompare(String(optionB?.label ?? '').toLowerCase())
              }
              options={botOptions}
            />
          </div>

          {/* Mission name */}
          <div className="text-[15px] leading-[18px] flex flex-col gap-y-2.5">
            <p>Name the mission</p>
            <Input
              placeholder="Enter the name of the mission..."
              value={inputValue}
              onChange={(e) => handleNameInput(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            className={`px-4 py-2 rounded-[22px] text-[15px] leading-[18px] font-medium transition-colors ${isFormComplete ? 'bg-brand-orange text-brand-white hover:opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            onClick={handleSave}
            disabled={!isFormComplete}
          >
            Save Mission
          </button>
          <button
            className="px-4 py-2 rounded-[22px] text-[15px] leading-[18px] font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            onClick={cancelCreate}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Render MissionCreateRectangle only when creating mission and after map is loaded */}
      <MissionCreateRectangle
        onBoundsChanged={handleBoundsChanged}
        map={map}
        initialBounds={initialBounds}
      />
    </div>
  );
}

export default MissionCreate;
