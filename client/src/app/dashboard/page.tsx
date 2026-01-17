
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomGoogleMap from '@/components/features/map/GoogleMap';
import { DashboardSidebar } from '@/components/features/dashboard';
import { useBotData } from '@/hooks/useBotData';
import { useMissions } from '@/hooks/useMissions';
import { RobotType } from '@/types/robot.type';

export default function Dashboard() {
  const router = useRouter();
  const { bots, setBots } = useBotData();
  const { missionsData, setMissions } = useMissions();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMissionCreate, setShowMissionCreate] = useState(false);

  if(!bots || !missionsData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Map Container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Map on its own */}
        <CustomGoogleMap 
          bots={bots} 
          missionsData={missionsData}
        />
      </div>

      {/* Sidebar */}
      <DashboardSidebar
        bots={bots}
        missionsData={missionsData}
        onBotSelect={(bot) => {router.push(`/bots/${bot!.id}`)}}
        onMissionCreate={() => setShowMissionCreate(true)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
    </div>
  );
}
