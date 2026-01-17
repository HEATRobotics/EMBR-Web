'use client';

import React, { useMemo } from 'react';

import { useLatestBatteryData } from '@/hooks/useLatestBatteryData';
import { useLatestTemperatureData } from '@/hooks/useLatestTemperatureData';

import Box from '../Box';

interface StatusOverview {
  battery: number;
  temperature: number;
}

const StatusOverviewComponent = () => {
  const { battery } = useLatestBatteryData();
  const { temperature } = useLatestTemperatureData();
  const indicator = useMemo(() => {
    return (
      <Box title="Overview">
        <div className="mt-2 text-ms">Battery: {Number(battery[0]).toFixed(0)}</div>
        <div className="mt-2 text-ms">Temperature: {Number(temperature[0]).toFixed(2)}</div>
      </Box>
    );
  }, [battery, temperature]);

  return indicator;
};

export default StatusOverviewComponent;
