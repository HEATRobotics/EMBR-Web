"use client";

import { useState } from "react";
import { NumberInput, SelectInput, Toggle } from "./inputs";

export default function BotConfigPanel() {
  const [terrainMode, setTerrainMode] = useState("forest");
  const [maxSpeed, setMaxSpeed] = useState(1.2);
  const [offlineTimeoutSec, setOfflineTimeoutSec] = useState(15);

  const [scanIntervalSec, setScanIntervalSec] = useState(2);
  const [gridSpacingM, setGridSpacingM] = useState(1.0);

  const [returnOnLowBattery, setReturnOnLowBattery] = useState(true);
  const [lowBatteryPct, setLowBatteryPct] = useState(20);

  const [stopOnSensorFault, setStopOnSensorFault] = useState(true);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold mb-1">Bot Configuration</h2>
        <p className="text-sm opacity-80 mb-5">
          Default behavior for missions (can be overridden per mission later).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Terrain mode</label>
            <SelectInput value={terrainMode} onChange={setTerrainMode}>
              <option value="forest">Forest floor</option>
              <option value="rocky">Rocky terrain</option>
              <option value="brush">Dense brush</option>
              <option value="snow">Snow/ice</option>
            </SelectInput>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max speed</label>
            <NumberInput value={maxSpeed} onChange={setMaxSpeed} placeholder="e.g., 1.2" />
            <p className="text-xs opacity-70 mt-2">m/s</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Offline timeout</label>
            <NumberInput
              value={offlineTimeoutSec}
              onChange={setOfflineTimeoutSec}
              placeholder="e.g., 15"
            />
            <p className="text-xs opacity-70 mt-2">seconds</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold mb-1">Scan behavior</h3>
        <p className="text-sm opacity-80 mb-5">
          How frequently the bot samples sensors and how tightly it scans an area.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          <div>
            <label className="block text-sm font-medium mb-2">Scan interval</label>
            <NumberInput value={scanIntervalSec} onChange={setScanIntervalSec} placeholder="e.g., 2" />
            <p className="text-xs opacity-70 mt-2">seconds</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Grid spacing</label>
            <NumberInput value={gridSpacingM} onChange={setGridSpacingM} placeholder="e.g., 1.0" />
            <p className="text-xs opacity-70 mt-2">meters</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold mb-1">Safety</h3>
        <p className="text-sm opacity-80 mb-5">
          What the bot should do when something goes wrong.
        </p>

        <div className="space-y-3">
          <Toggle
            checked={returnOnLowBattery}
            onChange={setReturnOnLowBattery}
            label="Return to base on low battery"
            description="Automatically stops mission and returns to the staging point."
          />

          {returnOnLowBattery && (
            <div className="ml-7 max-w-xs">
              <label className="block text-sm font-medium mb-2">
                Low battery threshold
              </label>
              <NumberInput
                value={lowBatteryPct}
                onChange={setLowBatteryPct}
                placeholder="e.g., 20"
              />
              <p className="text-xs opacity-70 mt-2">percent</p>
            </div>
          )}

          <Toggle
            checked={stopOnSensorFault}
            onChange={setStopOnSensorFault}
            label="Stop mission on sensor fault"
            description="If critical sensors fail, the bot stops and flags an alert."
          />
        </div>
      </div>

      <p className="text-xs opacity-60">
        *Template only — next iteration can include calibration, motor limits, and manual override rules.
      </p>
    </div>
  );
}
