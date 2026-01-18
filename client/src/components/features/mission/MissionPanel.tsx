import { useMemo } from 'react';

import InfoGrid from '@/components/ui/InfoGrid';
import { MissionType } from '@/types/mission.type';
import { calc } from 'antd/es/theme/internal';
import { calculateRectangleArea, formatArea } from '@/utils/calculateArea';
import { format } from 'path';

function MissionPanel({
  activeMission,
}: {
  activeMission: MissionType | undefined;
}) {
  const { centerData, upCornerData, downCornerData, areaData } = useMemo(() => {
    console.log('MissionPanel', activeMission);

    if (
      !activeMission ||
      !activeMission.areaCoordinates ||
      activeMission.areaCoordinates.length !== 2
    ) {
      // Provide defaults if activeMission is missing

      return {
        centerData: [],
        upCornerData: [],
        downCornerData: [],
        areaData: [],
      };
    }

    const topLeft = activeMission.areaCoordinates[0];
    const bottomRight = activeMission.areaCoordinates[1];

    // Calculate center
    const centerLatitude = (topLeft.lat + bottomRight.lat) / 2;
    const centerLongitude = (topLeft.lng + bottomRight.lng) / 2;

    const centerData = [
      { title: 'Latitude', value: centerLatitude.toFixed(6) },
      { title: 'Longitude', value: centerLongitude.toFixed(6) },
    ];

    const upCornerData = [
      { title: 'Latitude', value: topLeft.lat.toFixed(6) },
      { title: 'Longitude', value: topLeft.lng.toFixed(6) },
    ];

    const downCornerData = [
      { title: 'Latitude', value: bottomRight.lat.toFixed(6) },
      { title: 'Longitude', value: bottomRight.lng.toFixed(6) },
    ];

    const areaKm2 = calculateRectangleArea({
      north: topLeft.lat,
      south: bottomRight.lat,
      east: bottomRight.lng,
      west: topLeft.lng,
    });
    const areaHa = areaKm2 * 100;

    const areaData = [
      { title: 'Area', value: formatArea(areaKm2) },
      { title: 'Area', value: `${areaHa.toFixed(1)} ha` },
      { title: 'Time passed', value: activeMission.timePassed + ' min' || 'N/A' },
      { title: 'Est Duration', value: activeMission.timeEstimated + ' min' || 'N/A' },
    ];

    return {
      centerData,
      upCornerData,
      downCornerData,
      areaData,
    };
  }, [activeMission]);

  if (!activeMission) {
    return <>No Active Mission Found</>;
  }

  return (
    <>
      <div className="flex w-full overflow-hidden shadow border-b border-t border-black">
        <span
          className={`w-full py-3 text-center text-sm font-semibold transition-colors duration-200 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"}`}
        >
          General Information for {activeMission.missionName}
        </span>
      </div>
      <InfoGrid data={areaData} />

      <div className="flex w-full overflow-hidden shadow border-b border-t border-black">
        <span
          className={`w-full py-3 text-center text-sm font-semibold transition-colors duration-200 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"}`}
        >
          Area Center
        </span>
      </div>
      <InfoGrid data={centerData} />

      <div className="flex w-full overflow-hidden shadow border-b border-t border-black">
        <span
          className={`w-full py-3 text-center text-sm font-semibold transition-colors duration-200 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"}`}
        >
          Top Left Corner
        </span>
      </div>
      <InfoGrid data={upCornerData} />

      <div className="flex w-full overflow-hidden shadow border-b border-t border-black">
        <span
          className={`w-full py-3 text-center text-sm font-semibold transition-colors duration-200 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"}`}
        >
          Bottom Right Corner
        </span>
      </div>
      <InfoGrid data={downCornerData} />
    </>
  );
}

export default MissionPanel;
