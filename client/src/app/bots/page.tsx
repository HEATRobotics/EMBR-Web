'use client';

import { useRouter } from 'next/navigation';

import BotOverviewCard from '@/components/features/bot/BotOverviewCard';
import { useBotData } from '@/hooks/useBotData';
import { useMissions } from '@/hooks/useMissions';

export default function Bots() {
  const { bots, botsLoading, botError } = useBotData();
  const { missionsData, missionsLoading } = useMissions();
  const router = useRouter();

  const totalBots = bots.length;
  const onlineBots = bots.filter((b) => b.operationalStatus === 'operational').length;
  const onMission = bots.filter((b) => b.assignmentStatus === 'active').length;

  if (botsLoading || missionsLoading) {
    return (
      <div className="bg-gray-100 min-h-full">
        <main className="mb-16 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">Loading bots...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-full">
      <main className="mb-16 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Bot Management</h1>
          <button className="px-6 py-3 bg-brand-blue text-white rounded-md hover:bg-brand-blue/90">
            + Add New Bot
          </button>
        </div>

        {/* Bot Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Total Bots</h3>
            <p className="text-3xl font-bold mt-2">{totalBots}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Online</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">{onlineBots}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">On Mission</h3>
            <p className="text-3xl font-bold mt-2">{onMission}</p>
          </div>
        </div>

        {/* Bot List/Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Bots</h2>
            </div>

            {botError ? (
              <div className="text-red-600 text-center py-8">{botError}</div>
            ) : bots.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No bots available</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bots.map((bot) => {
                  return (
                    <BotOverviewCard
                      key={bot.id}
                      bot={bot}
                      onClick={() => {
                        router.push(`/bots/${bot.id}`);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
