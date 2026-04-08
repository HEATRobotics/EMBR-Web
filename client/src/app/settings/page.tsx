'use client';

// Navigation is rendered in RootLayout; remove local render
import { useState } from 'react';
import GeneralPanel from "./components/GeneralPanel";
import DetectionThresholdsPanel from "./components/DetectionThresholdsPanel";
import AlertsPanel from "./components/AlertsPanel";
import BotConfigPanel from "./components/BotConfigPanel";
import MapPrefsPanel from "./components/MapPrefsPanel";
import SystemPanel from "./components/SystemPanel";
console.log("Panels:", {
  GeneralPanel,
  DetectionThresholdsPanel,
  AlertsPanel,
  BotConfigPanel,
  MapPrefsPanel,
  SystemPanel,
});

type SettingsTab = "general" | "detection" | "alerts" | "bot" | "map" | "system";

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const navItem = (key: SettingsTab, label: string) => {
    const active = activeTab === key;
    return (
      <li>
        <button
          onClick={() => setActiveTab(key)}
          className={classNames(
            "w-full text-left px-4 py-2 rounded-md",
            active ? "bg-orange-100 text-orange-900" : "hover:bg-gray-100"
          )}
        >
          {label}
        </button>
      </li>
    );
  };

  return (
    <div className="bg-gray-100 min-h-full">
      <main className="mb-16 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <ul className="space-y-2">
              {navItem("general", "General")}
              {navItem("detection", "Detection Thresholds")}
              {navItem("alerts", "Alerts & Notifications")}
              {navItem("bot", "Bot Configuration")}
              {navItem("map", "Map Preferences")}
              {navItem("system", "System")}
            </ul>
          </div>

          <div className="lg:col-span-2">
            {activeTab === "general" ? (
              <GeneralPanel />
            ) : activeTab === "detection" ? (
              <DetectionThresholdsPanel />
            ) : activeTab === "alerts" ? (
              <AlertsPanel />
            ) : activeTab === "bot" ? (
              <BotConfigPanel />
            ) : activeTab === "map" ? (
              <MapPrefsPanel />
            ) : (
              <SystemPanel />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
