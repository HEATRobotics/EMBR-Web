'use client';

import { Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';

import { deleteMission, endMission, startMission } from '@/api/missions.api';
import MissionPanel from '@/components/features/mission/MissionPanel';
import CustomGoogleMap from '@/components/features/map/GoogleMap';
import { startAndEndMissionButton} from '@/components/features/mission/MissionStartEnd';
import { useBotData, useMission } from '@/hooks';
import type { RobotType } from '@/types';

export default function MissionDetail() {
  const params = useParams();
  const router = useRouter();
  const missionId = Number(params.id);

  const { missionData, setMission } = useMission(missionId);
  const { bots, setBots } = useBotData();

  const mission = missionData;
  const assignedBot = bots.find((b) => mission?.assignedBots?.includes(b.id));

  const handleStartEndMission = async (id: number, start: boolean, time: string) => {
    console.log('Updating mission:', id);

    if(start) {
      mission!.timeStart = time;
    }else if(!start) {
      mission!.timeEnd = time;
    }
    
    let newBotStatus: RobotType['assignmentStatus'] | null = null;

    if (!start) {
      newBotStatus = 'assigned';
    } else if (start) {
      newBotStatus = 'active';
    }

    if (newBotStatus) {
      const assignedSet = new Set(mission!.assignedBots);
      setBots((prevBots) =>
        prevBots.map((bot) =>
          assignedSet.has(bot.id) ? { ...bot, assignmentStatus: newBotStatus } : bot,
        ),
      );
    }
    setMission(mission!);

    // Push update to the database
    const response = await (start ? startMission(missionId, time) : endMission(missionId, time));
    console.log(`Mission ${start ? 'started' : 'ended'}:`, response);
  };

  const handleDelete = async (missionId: number, missionName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete mission "${missionName}"?`);
    if (!confirmed) return;

    try {
      const response = await deleteMission(missionId);
      alert(response.message);
      router.push('/missions');
    } catch (error: any) {
      alert(error.message || 'Failed to delete mission.');
    }
  };

  return (
    <div className="bg-gray-100 min-h-full">
      <main className="mb-16 h-[calc(100vh-64px)]">
        <div className="flex h-full">
          {/* Map View - Main Content */}
          <div className="flex-1 relative">
            <CustomGoogleMap
              bots={assignedBot ? [assignedBot] : []}
              missionsData={mission ? [mission] : []}
              showSearch={false}
            />

            {/* Mission Controls Overlay */}
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow p-4 z-10">
              <div className="mb-2">
                <h2 className="text-xl font-bold">Mission #{missionId}</h2>
                <p className="text-gray-600">{mission?.missionName || 'Loading...'}</p>
              </div>
            </div>
          </div>

          {/* Side Panel - Mission Details */}
          <div className="w-96 bg-white border-l overflow-y-auto">
            {/* The MissionPanel check handles the main display */}
            {mission && assignedBot ? (
              <MissionPanel activeMission={mission} />
            ) : (
              <div className="p-6">
                <p className="text-gray-500">Loading mission details...</p>
              </div>
            )}

            {/* Export Button, Export Mission Data */}
            <div className="p-4 border-t space-y-4">
              <button className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Export Mission Data
              </button>
              {mission &&
                startAndEndMissionButton(
                  mission,
                  handleStartEndMission,
                  bots,
                  undefined,
                  'w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700',
                  'absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded shadow-lg z-50',
                )}

              {mission && (
                <button
                  // Remove the non-null assertion operator (!) now that you have checked above
                  onClick={() => handleDelete(mission.missionID, mission.missionName)}
                  className="w-full mt-3 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2 shadow"
                >
                  <Trash2 size={20} color="red" />
                  <span>Delete Mission</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
