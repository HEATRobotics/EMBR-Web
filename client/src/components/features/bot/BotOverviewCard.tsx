import React from 'react';

import { RobotOperationalStatusType } from '@/constants/robotConstants';
import { RobotType } from '@/types/robot.type';

interface BotOverviewCardProps {
  bot: RobotType;
  onClick?: () => void;
  isSelected?: boolean;
}

export default function BotOverviewCard({ bot, onClick }: BotOverviewCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer border-2 transition-all border-gray-200 bg-white
                transition-transform transition-shadow duration-200 ease-out
                hover:scale-[1.03] hover:shadow-lg active:scale-[1.01]`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{bot.name}</h3>
          <p className="text-xs text-gray-500">ID: {bot.id}</p>
        </div>
        <span
          className="px-2 py-1 text-xs font-medium rounded-full border"
          style={{ backgroundColor: RobotOperationalStatusType[bot.operationalStatus].color }}
        >
          {RobotOperationalStatusType[bot.operationalStatus].text}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Assignment:</span>
          <span className={`text-xs font-medium px-2 py-1 rounded`}>{bot.assignmentStatus}</span>
        </div>

        {bot.battery !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Battery:</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    bot.battery > 60
                      ? 'bg-green-600'
                      : bot.battery > 30
                        ? 'bg-yellow-500'
                        : 'bg-red-600'
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
    </div>
  );
}
