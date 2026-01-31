"use client";

import { useEffect, useState } from "react";

export default function GeneralPanel() {
  // If you're still using static fields, keep it simple:
  const [organizationName, setOrganizationName] = useState("");
  const [timeZone, setTimeZone] = useState("America/Vancouver");
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

  // Later: wire this to DB API routes
  useEffect(() => {
    // placeholder
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold mb-1">General</h2>
        <p className="text-sm opacity-80 mb-6">
          Organization-wide defaults used across missions.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Organization Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md !bg-white !text-black placeholder:!text-gray-400"
              placeholder="Fire Department Name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Time Zone</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md !bg-white !text-black placeholder:!text-gray-400"
              placeholder="America/Vancouver"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Unit System</label>
            <select
              className="w-full px-4 py-2 border rounded-md !bg-white !text-black"
              value={unitSystem}
              onChange={(e) =>
                setUnitSystem(e.target.value === "imperial" ? "imperial" : "metric")
              }
            >
              <option value="metric">Metric (°C, meters)</option>
              <option value="imperial">Imperial (°F, feet)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Later you can add a save bar here */}
    </div>
  );
}
