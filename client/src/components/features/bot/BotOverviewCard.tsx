import React from 'react';
import { RobotType } from '@/types/robot.type';
import { RobotOperationalStatusType } from '@/constants/robotConstants';

interface BotOverviewCardProps {
  bot: RobotType;
  onClick?: () => void;
  isSelected?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'idle':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'offline':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getAssignmentColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-orange-100 text-orange-800';
    case 'assigned':
      return 'bg-yellow-100 text-yellow-800';
    case 'idle':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function BotOverviewCard({ bot, onClick }: BotOverviewCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all border-gray-200 bg-white`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{bot.name}</h3>
          <p className="text-xs text-gray-500">ID: {bot.id}</p>
        </div>
        <span className="px-2 py-1 text-xs font-medium rounded-full border"
        style={{ backgroundColor: RobotOperationalStatusType[bot.operationalStatus].color}}>
          {RobotOperationalStatusType[bot.operationalStatus].text}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Assignment:</span>
          <span className={`text-xs font-medium px-2 py-1 rounded`}>
            {bot.assignmentStatus}
          </span>
        </div>

        {bot.battery !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Battery:</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    bot.battery > 60
                      ? 'bg-green'
                      : bot.battery > 30
                        ? 'bg-yellow-500'
                        : 'bg-red'
                  }`}
                  style={{ width: `${Math.max(2, Math.min(bot.battery, 100))}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold text-gray-700 w-8 text-right">
                {Math.round(bot.battery)}%
              </span>
            </div>
          </div>
        )}
      </div>

    <button className="mt-3 w-full px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue/90 text-sm"
    onClick={onClick}>
        View Details
    </button>
    </div>
  );
}
