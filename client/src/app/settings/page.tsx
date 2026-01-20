"use client";

import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";

type SettingsTab =
  | "general"
  | "detection"
  | "alerts"
  | "bot"
  | "map"
  | "system";

type DetectionThresholdSettings = {
  normalMinC: number;
  normalMaxC: number;

  moderateC: number;
  highC: number;
  criticalC: number;

  // V1 noise filtering (optional but useful)
  minDurationSec: number;
  minConsecutiveReadings: number;
  cooldownSec: number;

  updatedAtIso?: string;
};

const DETECTION_STORAGE_KEY = "embr.settings.detectionThresholds.v1";

const DEFAULT_DETECTION: DetectionThresholdSettings = {
  normalMinC: 0,
  normalMaxC: 40,

  moderateC: 60,
  highC: 100,
  criticalC: 200,

  minDurationSec: 5,
  minConsecutiveReadings: 3,
  cooldownSec: 30,

  updatedAtIso: undefined,
};

function loadDetection(): DetectionThresholdSettings {
  try {
    const raw = localStorage.getItem(DETECTION_STORAGE_KEY);
    if (!raw) return DEFAULT_DETECTION;
    const parsed = JSON.parse(raw) as Partial<DetectionThresholdSettings>;
    return { ...DEFAULT_DETECTION, ...parsed };
  } catch {
    return DEFAULT_DETECTION;
  }
}

function saveDetection(s: DetectionThresholdSettings) {
  localStorage.setItem(DETECTION_STORAGE_KEY, JSON.stringify(s));
}

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function NumberInput({
  value,
  onChange,
  placeholder,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      className="w-full px-4 py-2 border rounded-md !bg-white !text-black placeholder:!text-gray-400"
      value={Number.isFinite(value) ? value : ""}
      placeholder={placeholder}
      onChange={(e) => {
        if (e.target.value === "") return onChange(NaN);
        onChange(Number(e.target.value));
      }}
    />
  );
}

function DetectionThresholdsPanel() {
  const [saved, setSaved] = useState<DetectionThresholdSettings>(DEFAULT_DETECTION);
  const [draft, setDraft] = useState<DetectionThresholdSettings>(DEFAULT_DETECTION);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadDetection();
    setSaved(loaded);
    setDraft(loaded);
  }, []);

  const dirty = useMemo(
    () => JSON.stringify(saved) !== JSON.stringify(draft),
    [saved, draft]
  );

  const validation = useMemo(() => {
    const issues: string[] = [];

    if (!(draft.normalMinC < draft.normalMaxC)) {
      issues.push("Normal range: Min must be less than Max.");
    }
    if (!(draft.normalMaxC < draft.moderateC)) {
      issues.push("Moderate must be greater than Normal Max.");
    }
    if (!(draft.moderateC < draft.highC)) {
      issues.push("High must be greater than Moderate.");
    }
    if (!(draft.highC < draft.criticalC)) {
      issues.push("Critical must be greater than High.");
    }

    if (draft.minDurationSec < 0) issues.push("Minimum duration cannot be negative.");
    if (draft.minConsecutiveReadings < 1)
      issues.push("Consecutive readings must be at least 1.");
    if (draft.cooldownSec < 0) issues.push("Cooldown cannot be negative.");

    return issues;
  }, [draft]);

  const lastUpdated = saved.updatedAtIso
    ? new Date(saved.updatedAtIso).toLocaleString()
    : "Not saved yet";

  function doSave() {
    const next: DetectionThresholdSettings = {
      ...draft,
      updatedAtIso: new Date().toISOString(),
    };
    saveDetection(next);
    setSaved(next);
    setDraft(next);
    setToast("Saved detection thresholds.");
    window.setTimeout(() => setToast(null), 1500);
  }

  function doReset() {
    setDraft(saved);
    setToast("Reverted changes.");
    window.setTimeout(() => setToast(null), 1200);
  }

  return (
    <div className="space-y-6">
      {/* Temperature Thresholds */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Detection Thresholds</h2>
            <p className="text-sm text-gray-600">
              Configure when the system flags hotspots and how it filters noisy spikes.
            </p>
            <p className="text-xs text-gray-500 mt-1">Last updated: {lastUpdated}</p>
          </div>
        </div>

        {validation.length > 0 && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-800">
              Fix these before saving:
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-red-700 space-y-1">
              {validation.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 space-y-5">
          {/* Normal range */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Normal Temperature Range
            </label>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <NumberInput
                  value={draft.normalMinC}
                  onChange={(v) => setDraft((s) => ({ ...s, normalMinC: v }))}
                  placeholder="Min"
                />
              </div>
              <span>to</span>
              <div className="flex-1">
                <NumberInput
                  value={draft.normalMaxC}
                  onChange={(v) => setDraft((s) => ({ ...s, normalMaxC: v }))}
                  placeholder="Max"
                />
              </div>
              <span>°C</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Used as the baseline for “normal” ground temperatures in your operating area.
            </p>
          </div>

          {/* Severity thresholds */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Moderate Concern Threshold
            </label>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <NumberInput
                  value={draft.moderateC}
                  onChange={(v) => setDraft((s) => ({ ...s, moderateC: v }))}
                  placeholder="e.g., 60"
                />
              </div>
              <span>°C</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              High Priority Threshold
            </label>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <NumberInput
                  value={draft.highC}
                  onChange={(v) => setDraft((s) => ({ ...s, highC: v }))}
                  placeholder="e.g., 100"
                />
              </div>
              <span>°C</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Critical Alert Threshold
            </label>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <NumberInput
                  value={draft.criticalC}
                  onChange={(v) => setDraft((s) => ({ ...s, criticalC: v }))}
                  placeholder="e.g., 200"
                />
              </div>
              <span>°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Noise filtering */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-1">Signal Filtering</h3>
        <p className="text-sm text-gray-600 mb-4">
          Helps reduce false positives from brief spikes and noisy readings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Minimum duration above threshold
            </label>
            <NumberInput
              value={draft.minDurationSec}
              onChange={(v) => setDraft((s) => ({ ...s, minDurationSec: v }))}
              placeholder="e.g., 5"
            />
            <p className="text-xs text-gray-500 mt-1">Seconds</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Consecutive readings required
            </label>
            <NumberInput
              value={draft.minConsecutiveReadings}
              onChange={(v) =>
                setDraft((s) => ({ ...s, minConsecutiveReadings: v }))
              }
              placeholder="e.g., 3"
            />
            <p className="text-xs text-gray-500 mt-1">Samples</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Cooldown after alert
            </label>
            <NumberInput
              value={draft.cooldownSec}
              onChange={(v) => setDraft((s) => ({ ...s, cooldownSec: v }))}
              placeholder="e.g., 30"
            />
            <p className="text-xs text-gray-500 mt-1">Seconds</p>
          </div>
        </div>
      </div>

      {/* Save/Reset */}
      <div className="flex justify-end gap-2">
        <button
          onClick={doReset}
          disabled={!dirty}
          className={classNames(
            "px-6 py-2 border rounded-md hover:bg-gray-100",
            !dirty && "opacity-50 cursor-not-allowed hover:bg-transparent"
          )}
        >
          Reset
        </button>
        <button
          onClick={doSave}
          disabled={!dirty || validation.length > 0}
          className={classNames(
            "px-6 py-2 bg-brand-orange text-white rounded-md hover:bg-brand-orange/90",
            (!dirty || validation.length > 0) &&
              "opacity-50 cursor-not-allowed hover:bg-brand-orange"
          )}
        >
          Save
        </button>
      </div>

      {/* Tiny toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-black text-white text-sm px-4 py-2 rounded-md shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-600">
        Template coming next — this tab is here so navigation works.
      </p>
    </div>
  );
}

function GeneralPanel() {
  // keep your existing General UI as-is
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">General Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Organization Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-md text-black placeholder:text-gray-400" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Time Zone</label>
          <select className="w-full px-4 py-2 border rounded-md !bg-white !text-black">
            <option>UTC-8 (Pacific Time)</option>
            <option>UTC-7 (Mountain Time)</option>
            <option>UTC-6 (Central Time)</option>
            <option>UTC-5 (Eastern Time)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Unit System</label>
          <select className="w-full px-4 py-2 border rounded-md !bg-white !text-black">
            <option>Metric (°C, meters)</option>
            <option>Imperial (°F, feet)</option>
          </select>
        </div>
      </div>
    </div>
  );
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
            active
              ? "bg-orange-100 text-orange-900"
              : "hover:bg-gray-100"
          )}
        >
          {label}
        </button>
      </li>
    );
  };

  return (
    <div className="bg-gray-100 min-h-full">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
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

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "general" ? (
              <GeneralPanel />
            ) : activeTab === "detection" ? (
              <DetectionThresholdsPanel />
            ) : activeTab === "alerts" ? (
              <PlaceholderPanel title="Alerts & Notifications" />
            ) : activeTab === "bot" ? (
              <PlaceholderPanel title="Bot Configuration" />
            ) : activeTab === "map" ? (
              <PlaceholderPanel title="Map Preferences" />
            ) : (
              <PlaceholderPanel title="System" />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
