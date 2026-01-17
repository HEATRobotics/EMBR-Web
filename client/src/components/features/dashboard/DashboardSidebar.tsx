import React, { useState } from 'react';
import { RobotType } from '@/types/robot.type';
import { MissionType } from '@/types/mission.type';
import StatusCard from './StatusCard';
import BotStatusCard from './BotStatusCard';
import MissionStatusCard from './MissionStatusCard';

interface DashboardSidebarProps {
  bots: RobotType[];
  missionsData: MissionType[] | null;
  selectedBot: RobotType | null;
  onBotSelect: (bot: RobotType | null) => void;
  onMissionCreate: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function DashboardSidebar({
  bots,
  missionsData,
  selectedBot,
  onBotSelect,
  onMissionCreate,
  isCollapsed,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'bots' | 'missions'>('overview');

  // Calculate stats
  const activeMissions = missionsData?.length || 0;
  const onlineBots = bots.filter((b) => b.operationalStatus === 'operational').length;
  const activeBots = bots.filter((b) => b.assignmentStatus === 'active').length;
  const totalHotspots =
    missionsData?.reduce((acc, mission) => {
      return acc + (mission.hotspots?.length || 0);
    }, 0) || 0;

  return (
    <div
      className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 overflow-hidden ${
        isCollapsed ? 'w-16' : 'w-96'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        {!isCollapsed && <h2 className="text-lg font-bold text-gray-900">System Status</h2>}
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '◀' : '▶'}
        </button>
      </div>

      {isCollapsed ? (
        // Collapsed state - show only icons
        <div className="flex flex-col items-center gap-2 p-3 flex-shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`p-3 rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-orange-100 text-orange-600'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Overview"
          >
            📊
          </button>
          <button
            onClick={() => setActiveTab('bots')}
            className={`p-3 rounded-lg transition-colors ${
              activeTab === 'bots'
                ? 'bg-orange-100 text-orange-600'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Bots"
          >
            🤖
          </button>
          <button
            onClick={() => setActiveTab('missions')}
            className={`p-3 rounded-lg transition-colors ${
              activeTab === 'missions'
                ? 'bg-orange-100 text-orange-600'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Missions"
          >
            🎯
          </button>
        </div>
      ) : (
        // Expanded state - show tabs
        <div className="flex gap-2 p-4 border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
              activeTab === 'overview'
                ? 'bg-orange-100 text-orange-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('bots')}
            className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
              activeTab === 'bots'
                ? 'bg-orange-100 text-orange-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Bots
          </button>
          <button
            onClick={() => setActiveTab('missions')}
            className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
              activeTab === 'missions'
                ? 'bg-orange-100 text-orange-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Missions
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="p-4 space-y-4">
                <StatusCard
                  label="Active Missions"
                  value={activeMissions}
                  color="orange"
                  icon="🎯"
                />
                <StatusCard
                  label="Online Bots"
                  value={onlineBots}
                  color="green"
                  icon="🤖"
                />
                <StatusCard
                  label="Active Bots"
                  value={activeBots}
                  color="blue"
                  icon="⚡"
                />
                <StatusCard
                  label="Total Hotspots"
                  value={totalHotspots}
                  color="gray"
                  icon="🔥"
                />

                {/* Quick Actions */}
                <div className="pt-4 space-y-2 border-t border-gray-200">
                  <button
                    onClick={onMissionCreate}
                    className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    + New Mission
                  </button>
                </div>
              </div>
            )}

            {/* Bots Tab */}
            {activeTab === 'bots' && (
              <div className="p-4 space-y-3">
                {bots.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No bots available</p>
                  </div>
                ) : (
                  bots.map((bot) => (
                    <BotStatusCard
                      key={bot.id}
                      bot={bot}
                      isSelected={selectedBot?.id === bot.id}
                      onClick={() => onBotSelect(selectedBot?.id === bot.id ? null : bot)}
                    />
                  ))
                )}
              </div>
            )}

            {/* Missions Tab */}
            {activeTab === 'missions' && (
              <div className="p-4 space-y-3">
                {!missionsData || missionsData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No missions</p>
                  </div>
                ) : (
                  missionsData.map((mission) => (
                    <MissionStatusCard key={mission.missionID} mission={mission} />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
