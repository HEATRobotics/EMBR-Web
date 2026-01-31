"use client";

import { useState } from "react";
import { NumberInput, SelectInput, Toggle } from "./inputs";

export default function MapPrefsPanel() {
  const [defaultLayer, setDefaultLayer] = useState("terrain");
  const [coordSystem, setCoordSystem] = useState("latlng");

  const [showPath, setShowPath] = useState(true);
  const [showHistory, setShowHistory] = useState(true);

  const [smoothing, setSmoothing] = useState(35);
  const [opacityPct, setOpacityPct] = useState(65);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold mb-1">Map Preferences</h2>
        <p className="text-sm opacity-80 mb-5">
          Default visualization settings for missions, hotspots, and reports.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <div>
            <label className="block text-sm font-medium mb-2">Default map layer</label>
            <SelectInput value={defaultLayer} onChange={setDefaultLayer}>
              <option value="terrain">Terrain</option>
              <option value="satellite">Satellite</option>
              <option value="hybrid">Hybrid</option>
            </SelectInput>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Coordinate system</label>
            <SelectInput value={coordSystem} onChange={setCoordSystem}>
              <option value="latlng">Lat/Long</option>
              <option value="utm">UTM</option>
            </SelectInput>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold mb-1">Overlays</h3>
        <p className="text-sm opacity-80 mb-5">
          Toggle what overlays are enabled by default.
        </p>

        <div className="space-y-3">
          <Toggle
            checked={showPath}
            onChange={setShowPath}
            label="Show bot path"
            description="Draw the route the bot has traveled."
          />
          <Toggle
            checked={showHistory}
            onChange={setShowHistory}
            label="Show historical hotspots"
            description="Display previously detected hotspots on the map."
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold mb-1">Heatmap rendering</h3>
        <p className="text-sm opacity-80 mb-5">
          Controls how smooth and visible the heatmap overlay appears.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <div>
            <label className="block text-sm font-medium mb-2">Smoothing</label>
            <NumberInput value={smoothing} onChange={setSmoothing} placeholder="e.g., 35" />
            <p className="text-xs opacity-70 mt-2">0–100 (higher = smoother)</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Opacity</label>
            <NumberInput value={opacityPct} onChange={setOpacityPct} placeholder="e.g., 65" />
            <p className="text-xs opacity-70 mt-2">percent</p>
          </div>
        </div>
      </div>

      <p className="text-xs opacity-60">
        *Template only — later we can add color schemes, legend options, and retention windows.
      </p>
    </div>
  );
}
