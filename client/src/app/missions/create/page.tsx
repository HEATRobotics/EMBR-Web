'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { createMission } from '@/api/missions.api';
import { useBotData } from '@/hooks/useBotData';
import { useMissions } from '@/hooks/useMissions';
import CustomGoogleMap from '@/components/features/map/GoogleMap';
import { MissionType } from '@/types/mission.type';
import { CoordinatesType } from '@/types/coordinate.type';

export default function CreateMissionPage() {
  const router = useRouter();
  
  // Mission form state
  const [missionName, setMissionName] = useState('');
  const [timeEstimated, setTimeEstimated] = useState(60); // in minutes
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { bots, botsLoading } = useBotData();
  const { missionsData: missions, missionsLoading } = useMissions();
  const [selectedBotIds, setSelectedBotIds] = useState<number[]>([]);
  
  // Area coordinates state (north-west corner and south-east corner)
  const [northWest, setNorthWest] = useState<CoordinatesType | null>(null);
  const [southEast, setSouthEast] = useState<CoordinatesType | null>(null);
  
  // Drawing state
  const [drawingMode, setDrawingMode] = useState(false);
  const [rectangle, setRectangle] = useState<google.maps.Rectangle | null>(null);

  const handleDeleteArea = () => {
    // Clear the area completely
    setNorthWest(null);
    setSouthEast(null);
    setRectangle(null);
  };

  const handleToggleBot = (botId: number) => {
    setSelectedBotIds(prev => 
      prev.includes(botId) 
        ? prev.filter(id => id !== botId)
        : [...prev, botId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!missionName.trim()) {
      alert('Please enter a mission name');
      return;
    }
    
    if (!northWest || !southEast) {
      alert('Please define a mission area');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newMission: MissionType = {
        missionID: 0,
        missionName: missionName.trim(),
        progress: 0,
        averageTemperature: 0,
        timePassed: 0,
        timeEstimated,
        areaCoordinates: [northWest, southEast],
        assignedBots: selectedBotIds.length > 0 ? selectedBotIds : undefined,
      };

      const result = await createMission(newMission);
      router.push(`/missions/${result.missionID}`);
    } catch (error) {
      console.error('Error creating mission:', error);
      alert('Failed to create mission');
      setIsSubmitting(false);
    }
  };

  const handleCoordinateChange = (corner: 'nw' | 'se', field: 'lat' | 'lng', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    if (corner === 'nw') {
      setNorthWest(prev => ({ ...(prev || { lat: 0, lng: 0 }), [field]: numValue }));
    } else {
      setSouthEast(prev => ({ ...(prev || { lat: 0, lng: 0 }), [field]: numValue }));
    }
  };

  return (
    <div className="h-screen flex flex-col p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Create New Mission</h1>
        <p className="text-gray-600">Define mission parameters and area</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden mb-12">
        {/* Left Panel - Form */}
        <div className="w-96 flex-shrink-0 bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mission Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Mission Name *
              </label>
              <input
                type="text"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter mission name"
                required
              />
            </div>

            {/* Time Estimated */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                value={timeEstimated}
                onChange={(e) => setTimeEstimated(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            {/* Bot Assignment */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Assign Bots {selectedBotIds.length > 0 && `(${selectedBotIds.length} selected)`}
              </label>
              
              {botsLoading ? (
                <div className="text-sm text-gray-500 py-2">Loading available bots...</div>
              ) : bots.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                  No bots available. All bots are currently assigned or inactive.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50">
                  {bots.map((bot) => (
                    <label
                      key={bot.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBotIds.includes(bot.id)}
                        onChange={() => handleToggleBot(bot.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-medium">{bot.name}</span>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className={`px-2 py-1 rounded ${
                            bot.operationalStatus === 'operational' 
                              ? 'bg-green-100 text-green-800'
                              : bot.operationalStatus === 'chargingRequired'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {bot.battery ? `${bot.battery}%` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              
              {selectedBotIds.length === 0 && bots.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  💡 Select one or more bots to assign to this mission
                </p>
              )}
            </div>

            {/* Area Coordinates */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Mission Area</h3>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm text-blue-800">
                <p>💡 Draw a rectangle on the map or enter coordinates manually</p>
              </div>

              {/* Drawing Toggle */}
              <div className="mb-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setDrawingMode(!drawingMode)}
                  className={`w-full px-4 py-2 rounded-md font-medium transition-colors 
                    bg-blue-600 text-white hover:bg-blue-700`}
                >
                  {drawingMode ? '✓ Drawing Mode Active' : 'Enable Drawing Mode'}
                </button>
                {drawingMode && (
                  <button
                    type="button"
                    onClick={handleDeleteArea}
                    className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-red"
                  >
                    🗑️ Delete Area & Start Over
                  </button>
                )}
              </div>

              {/* North-West Corner */}
              <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium">North-West Corner</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={northWest?.lat ?? ''}
                      onChange={(e) => handleCoordinateChange('nw', 'lat', e.target.value)}
                      placeholder="Click map to set"
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={northWest?.lng ?? ''}
                      onChange={(e) => handleCoordinateChange('nw', 'lng', e.target.value)}
                      placeholder="Click map to set"
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* South-East Corner */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">South-East Corner</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={southEast?.lat ?? ''}
                      onChange={(e) => handleCoordinateChange('se', 'lat', e.target.value)}
                      placeholder="Click map to set"
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={southEast?.lng ?? ''}
                      onChange={(e) => handleCoordinateChange('se', 'lng', e.target.value)}
                      placeholder="Click map to set"
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.push('/missions')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !missionName.trim() || !northWest || !southEast}
                title={
                  !missionName.trim() 
                    ? 'Please enter a mission name'
                    : !northWest || !southEast
                    ? 'Please define a mission area'
                    : ''
                }
              >
                {isSubmitting ? 'Creating...' : 'Create Mission'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel - Map */}
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <CustomGoogleMap
            bots={[]} 
            missionsData={missions ?? []}
            drawingMode={drawingMode}
            currentRectangle={northWest && southEast ? { northWest, southEast } : null}
            onRectangleChange={(nw, se) => {
              setNorthWest(nw);
              setSouthEast(se);
            }}
            onRectangleSet={(rect) => setRectangle(rect)}
          />
        </div>
      </div>
    </div>
  );
}
