import React from 'react';
import { MissionType } from '@/types/mission.type';

interface MissionStatusCardProps {
  mission: MissionType;
  onClick?: () => void;
  isSelected?: boolean;
}

const getProgressColor = (progress: number) => {
  if (progress === 100) return 'bg-green-500';
  if (progress >= 75) return 'bg-blue-500';
  if (progress >= 50) return 'bg-yellow-500';
  if (progress >= 25) return 'bg-orange-500';
  return 'bg-red-500';
};

const getProgressBg = (progress: number) => {
  if (progress === 100) return 'bg-green-100';
  if (progress >= 75) return 'bg-blue-100';
  if (progress >= 50) return 'bg-yellow-100';
  if (progress >= 25) return 'bg-orange-100';
  return 'bg-red-100';
};

export default function MissionStatusCard({
  mission,
  onClick,
  isSelected,
}: MissionStatusCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-orange-600 bg-orange-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 truncate">{mission.missionName}</h3>
        <p className="text-xs text-gray-500">ID: {mission.missionID}</p>
      </div>

      <div className="space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Progress</span>
            <span className="text-sm font-bold text-gray-900">{mission.progress}%</span>
          </div>
          <div className={`w-full h-3 ${getProgressBg(mission.progress)} rounded-full overflow-hidden`}>
            <div
              className={`h-full transition-all ${getProgressColor(mission.progress)}`}
              style={{ width: `${Math.min(mission.progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Hotspots & Bots Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-600">Hotspots</p>
            <p className="font-bold text-gray-900">{mission.hotspots?.length || 0}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-600">Bots Assigned</p>
            <p className="font-bold text-gray-900">{mission.assignedBots?.length || 0}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="pt-2 border-t border-gray-200">
          <span
            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
              mission.progress === 100
                ? 'bg-green-100 text-green-800'
                : mission.progress > 0
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
            }`}
          >
            {mission.progress === 100 ? 'Completed' : mission.progress > 0 ? 'In Progress' : 'Not Started'}
          </span>
        </div>
      </div>
    </div>
  );
}
