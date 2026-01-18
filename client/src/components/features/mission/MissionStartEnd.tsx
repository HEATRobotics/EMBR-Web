import React from 'react';

import { useBotData } from '@/hooks/useBotData';
import { useMissions } from '@/hooks/useMissions';
import { MissionType } from '@/types/mission.type';
import { RobotType } from '@/types/robot.type';

// Mission logic update
function handleStartEndMission(
  mission: MissionType,
  saveUpdate: (missionId: number, start: boolean, time: string) => Promise<void>,
  missionStatus?: 'not started' | 'in progress' | 'completed',
) {
  // In case missionStatus is not provided
  if (!missionStatus) {
    missionStatus = getMissionStatus(mission.timeStart, mission.timeEnd);
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  if (missionStatus === 'not started') {
    return saveUpdate(mission.missionID, true, now);
  }

  if (missionStatus === 'in progress') {
    return saveUpdate(mission.missionID, false, now);
  }
}

// Determine mission status. These status are not presented in the database but are useful for frontend logic.
export function getMissionStatus(
  start_time: string | null | undefined,
  end_time: string | null | undefined,
): 'not started' | 'in progress' | 'completed' {
  if (!start_time) return 'not started';
  if (start_time && !end_time) return 'in progress';
  return 'completed';
}

// Render action button based on mission status
export function startAndEndMissionButton(
  mission: MissionType,
  saveUpdate: (id: number, start: boolean, time: string) => Promise<void>,
  bots: RobotType[] | RobotType, //You can pass either a single bot or all bots
  missionStatus?: 'not started' | 'in progress' | 'completed',
  className: string = 'px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors',
  warningPanelclassName: string = 'absolute top-0 left-0 -translate-x-full -translate-y-full hidden group-hover:block bg-black text-white text-xs p-2 rounded shadow-lg z-50',
) {
  //* In case missionStatus is not provided *
  if (!missionStatus) {
    missionStatus = getMissionStatus(mission.timeStart, mission.timeEnd);
  }

  let bot: RobotType | undefined;
  if (!Array.isArray(bots)) {
    bot = bots;
  } else {
    bot = bots.find((b) => mission.assignedBots?.includes(b.id));
  }

  let isDisabled = true;

  if (bot) {
    if (missionStatus === 'not started' && bot.assignmentStatus === 'assigned') {
      isDisabled = false;
    }
    if (missionStatus === 'in progress' && bot.assignmentStatus === 'active') {
      isDisabled = false;
    }
  }
  const buttonLabel = isDisabled
    ? 'No Action'
    : missionStatus === 'not started'
      ? 'Start Mission'
      : missionStatus === 'in progress'
        ? 'End Mission'
        : 'No Action';

  return (
    <div className="relative group">
      <button
        className={`
          ${className}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          relative
        `}
        onClick={() => !isDisabled && handleStartEndMission(mission, saveUpdate, missionStatus)}
        disabled={isDisabled}
      >
        {buttonLabel}
      </button>
      {isDisabled && (
        <div className={warningPanelclassName}>
          Cannot start mission: Bot is busy or misison already ended
        </div>
      )}
    </div>
  );
}
