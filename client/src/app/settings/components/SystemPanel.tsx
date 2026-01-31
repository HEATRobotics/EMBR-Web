"use client";

import { useState } from "react";
import { NumberInput, Toggle } from "./inputs";

export default function SystemPanel() {
  const [retentionDays, setRetentionDays] = useState(90);
  const [autoDelete, setAutoDelete] = useState(false);

  const [telemetryHz, setTelemetryHz] = useState(2);
  const [offlineCache, setOfflineCache] = useState(true);

  const [roleLock, setRoleLock] = useState(true);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold mb-1">System</h2>
        <p className="text-sm opacity-80 mb-5">
          Defaults for storage, diagnostics, and permissions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          <div>
            <label className="block text-sm font-medium mb-2">Data retention</label>
            <NumberInput value={retentionDays} onChange={setRetentionDays} placeholder="e.g., 90" />
            <p className="text-xs opacity-70 mt-2">days</p>
          </div>

          <div className="md:col-span-2 flex items-center">
            <Toggle
              checked={autoDelete}
              onChange={setAutoDelete}
              label="Auto-delete old data"
              description="Automatically delete missions/hotspots older than the retention window."
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold mb-1">Connectivity</h3>
        <p className="text-sm opacity-80 mb-5">
          Controls how the system behaves when connections are unstable.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          <div>
            <label className="block text-sm font-medium mb-2">Telemetry rate</label>
            <NumberInput value={telemetryHz} onChange={setTelemetryHz} placeholder="e.g., 2" />
            <p className="text-xs opacity-70 mt-2">updates/sec</p>
          </div>

          <div className="md:col-span-2 flex items-center">
            <Toggle
              checked={offlineCache}
              onChange={setOfflineCache}
              label="Enable offline caching"
              description="Keep mission data locally when internet is unavailable."
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold mb-1">Permissions</h3>
        <p className="text-sm opacity-80 mb-5">
          Admin controls to prevent accidental changes during incidents.
        </p>

        <Toggle
          checked={roleLock}
          onChange={setRoleLock}
          label="Lock critical settings"
          description="Only Admins can change detection thresholds and bot safety rules."
        />
      </div>

      <p className="text-xs opacity-60">
        *Template only — we can add export settings, firmware settings, and audit logs later.
      </p>
    </div>
  );
}
