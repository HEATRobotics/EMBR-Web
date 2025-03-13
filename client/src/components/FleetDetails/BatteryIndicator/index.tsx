import React, { useMemo } from 'react';
import Box from '../Box';

interface BatteryIndicatorProps {
  level: number;
}

const BatteryIndicatorComponent: React.FC<BatteryIndicatorProps> = ({ level }) => {
  const batteryLevelIndicator = useMemo(() => {
    const levelColor = level < 20 ? 'bg-red' : 'bg-green-500';
    return (
      <Box title="Battery">
        <div className="w-full bg-gray-200 h-[28px] mt-[26px] rounded-full overflow-hidden w-[100%] border-2 border-black">
          <div className={`${levelColor} h-[28px] rounded-full m-0 mt-[-2px] flex items-center justify-center text-white`} style={{ width: `${level}%` }}>
            <p className="m-0 h-[28px] leading-[28px] text-[14px]">{level}%</p>
          </div>
        </div>
        {level < 20 && (
          <div className="mt-2 text-sm text-red-600">
            Battery level is below 20%. It is strongly advised to recharge soon.
          </div>
        )}
      </Box>
    );
  }, [level]);

  return batteryLevelIndicator;
};

export default BatteryIndicatorComponent;
