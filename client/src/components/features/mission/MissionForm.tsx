'use client';

import React, { useState } from 'react';
import CustomGoogleMap from '@/components/features/map/GoogleMap';
import { useBotData } from '@/hooks/useBotData';
import { useMissions } from '@/hooks/useMissions';
import { useRouter } from 'next/navigation';

import { CoordinatesType } from '@/types/coordinate.type';
import { MissionType } from '@/types/mission.type';

type MissionFormProps = {
  initialData?: Partial<MissionType>;
  onSubmit: (mission: MissionType) => Promise<void>;
  submitting?: boolean;
  mode?: 'create' | 'edit';
};

export default function MissionForm({
  initialData,
  onSubmit,
  submitting = false,
  mode = 'create',
}: MissionFormProps) {
  const router = useRouter();

  // ===============================
  // STATE
  // ===============================

  const [missionName, setMissionName] = useState(
    initialData?.missionName ?? ''
  );
  const [timeEstimated, setTimeEstimated] = useState(
    initialData?.timeEstimated ?? 60
  );
  const [selectedBotIds, setSelectedBotIds] = useState<number[]>(
    initialData?.assignedBots ?? []
  );

  const [northWest, setNorthWest] = useState<CoordinatesType | null>(
    initialData?.areaCoordinates?.[0] ?? null
  );

  const [southEast, setSouthEast] = useState<CoordinatesType | null>(
    initialData?.areaCoordinates?.[1] ?? null
  );

  const [drawingMode] = useState(true);
  const [rectangle, setRectangle] =
    useState<google.maps.Rectangle | null>(null);

  const { bots, botsLoading } = useBotData();
  const { missionsData: missions } = useMissions();
const missionsToDisplay =
  mode === 'edit' && initialData
    ? [
        {
          ...(initialData as MissionType),
          areaCoordinates:
            initialData.areaCoordinates ??
            (northWest && southEast
              ? [northWest, southEast]
              : []),
        },
      ]
    : missions ?? [];
  // ===============================
  // HANDLERS
  // ===============================

  const handleRevert = () => {
    if (!initialData) return;

    const confirmed = window.confirm(
      'Discard all unsaved changes?'
    );
    if (!confirmed) return;

    setMissionName(initialData.missionName ?? '');
    setTimeEstimated(initialData.timeEstimated ?? 60);
    setSelectedBotIds(initialData.assignedBots ?? []);
    setNorthWest(initialData.areaCoordinates?.[0] ?? null);
    setSouthEast(initialData.areaCoordinates?.[1] ?? null);
  };

  const handleToggleBot = (botId: number) => {
    setSelectedBotIds((prev) =>
      prev.includes(botId)
        ? prev.filter((id) => id !== botId)
        : [...prev, botId]
    );
  };

  const handleDeleteArea = () => {
    setNorthWest(null);
    setSouthEast(null);
    setRectangle(null);
  };

  const handleCoordinateChange = (
    corner: 'nw' | 'se',
    field: 'lat' | 'lng',
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    if (corner === 'nw') {
      setNorthWest((prev) => ({
        ...(prev || { lat: 0, lng: 0 }),
        [field]: numValue,
      }));
    } else {
      setSouthEast((prev) => ({
        ...(prev || { lat: 0, lng: 0 }),
        [field]: numValue,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!missionName.trim()) return;
    if (!northWest || !southEast) return;

    const mission: MissionType = {
      missionID: initialData?.missionID ?? 0,
      missionName: missionName.trim(),
      progress: initialData?.progress ?? 0,
      averageTemperature:
        initialData?.averageTemperature ?? 0,
      timePassed: initialData?.timePassed ?? 0,
      timeEstimated,
      areaCoordinates: [northWest, southEast],
      assignedBots:
        selectedBotIds.length > 0
          ? selectedBotIds
          : undefined,
    };

    await onSubmit(mission);
  };

  // ===============================
  // UI
  // ===============================

  return (
    <div className="h-screen flex flex-col p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">
          {mode === 'create'
            ? 'Create New Mission'
            : 'Edit Mission'}
        </h1>
        <p className="text-gray-600">
          {mode === 'create'
            ? 'Define mission parameters and area'
            : 'Modify mission parameters and area'}
        </p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden mb-12">
        {/* LEFT PANEL */}
        <div className="w-96 flex-shrink-0 bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Mission Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Mission Name *
              </label>
              <input
                value={missionName}
                onChange={(e) =>
                  setMissionName(e.target.value)
                }
                className="w-full px-3 py-2 border bg-gray-100 rounded-md"
                required
              />
            </div>

            {/* Estimated Time */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                value={timeEstimated}
                onChange={(e) =>
                  setTimeEstimated(Number(e.target.value))
                }
                className="w-full px-3 py-2 bg-gray-100 border rounded-md"
                min={1}
              />
            </div>

            {/* Bot Assignment */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Assign Bots{' '}
                {selectedBotIds.length > 0 &&
                  `(${selectedBotIds.length} selected)`}
              </label>

              <p className="text-xs text-gray-500 mb-2">
                Select one or more bots to assign
                to this mission.
              </p>

              {botsLoading ? (
                <div className="text-sm text-gray-500">
                  Loading bots...
                </div>
              ) : bots.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                  No bots available.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3 bg-gray-50">
                  {bots.map((bot) => (
                    <label
                      key={bot.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBotIds.includes(
                          bot.id
                        )}
                        onChange={() =>
                          handleToggleBot(bot.id)
                        }
                      />
                      <div className="flex-1 flex justify-between text-sm">
                        <span>{bot.name}</span>
                        <span>
                          {bot.battery
                            ? `${bot.battery}%`
                            : 'N/A'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Mission Area */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Mission Area
              </h3>

              <div className="space-y-2 mb-4">
  <p className="text-sm text-gray-600">
    Click anywhere on the map to define a mission area.
  </p>

  <button
    type="button"
    onClick={handleDeleteArea}
    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
  >
    Delete Area
  </button>
</div>

              <div className="mt-4 space-y-4">
                {/* North-West */}
                <div>
                  <h4 className="font-medium mb-2">
                    North-West Corner
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      value={northWest?.lat ?? ''}
                      onChange={(e) =>
                        handleCoordinateChange(
                          'nw',
                          'lat',
                          e.target.value
                        )
                      }
                      className="px-3 py-2 border rounded-md bg-gray-100"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      value={northWest?.lng ?? ''}
                      onChange={(e) =>
                        handleCoordinateChange(
                          'nw',
                          'lng',
                          e.target.value
                        )
                      }
                      className="px-3 py-2 border rounded-md bg-gray-100"
                    />
                  </div>
                </div>

                {/* South-East */}
                <div>
                  <h4 className="font-medium mb-2">
                    South-East Corner
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      value={southEast?.lat ?? ''}
                      onChange={(e) =>
                        handleCoordinateChange(
                          'se',
                          'lat',
                          e.target.value
                        )
                      }
                      className="px-3 py-2 border rounded-md bg-gray-100"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      value={southEast?.lng ?? ''}
                      onChange={(e) =>
                        handleCoordinateChange(
                          'se',
                          'lng',
                          e.target.value
                        )
                      }
                      className="px-3 py-2 border rounded-md bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t">
              <div className="flex gap-4">
                {mode === 'edit' && (
                  <button
                    type="button"
                    onClick={handleRevert}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-md"
                  >
                    Revert Changes
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    router.push('/missions')
                  }
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !missionName.trim() ||
                    !northWest ||
                    !southEast
                  }
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md"
                >
                  {submitting
                    ? mode === 'create'
                      ? 'Creating...'
                      : 'Saving...'
                    : mode === 'create'
                    ? 'Create Mission'
                    : 'Save Mission'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <CustomGoogleMap
            bots={[]}
            missionsData={missionsToDisplay}
            drawingMode={drawingMode}
            currentRectangle={
              northWest && southEast
                ? { northWest, southEast }
                : null
            }
            onRectangleChange={(nw, se) => {
              setNorthWest(nw);
              setSouthEast(se);
            }}
            onRectangleSet={(rect) =>
              setRectangle(rect)
            }
          />
        </div>
      </div>
    </div>
  );
}