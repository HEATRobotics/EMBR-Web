"use client";

import { useEffect, useMemo, useState } from "react";
import * as Inputs from "./inputs";
console.log("Inputs module:", Inputs);

type DetectionThresholdSettings = {
  normalMinC: number;
  normalMaxC: number;

  moderateC: number;
  highC: number;
  criticalC: number;

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

export default function DetectionThresholdsPanel() {
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
      {/* Detection Thresholds */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold mb-1">Detection Thresholds</h2>
        <p className="text-sm opacity-80">
          Configure when the system flags hotspots and how it filters noisy spikes.
        </p>
        <p className="text-xs opacity-70 mt-1">Last updated: {lastUpdated}</p>

        {validation.length > 0 && (
          <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3">
            <p className="text-sm font-medium text-red-200">
              Fix these before saving:
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-red-200/90 space-y-1">
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
                <Inputs.NumberInput
                  value={draft.normalMinC}
                  onChange={(v) => setDraft((s) => ({ ...s, normalMinC: v }))}
                  placeholder="Min"
                />
              </div>
              <span className="opacity-80">to</span>
              <div className="flex-1">
                <Inputs.NumberInput
                  value={draft.normalMaxC}
                  onChange={(v) => setDraft((s) => ({ ...s, normalMaxC: v }))}
                  placeholder="Max"
                />
              </div>
              <span className="opacity-80">°C</span>
            </div>
            <p className="text-xs opacity-70 mt-2">
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
                <Inputs.NumberInput
                  value={draft.moderateC}
                  onChange={(v) => setDraft((s) => ({ ...s, moderateC: v }))}
                  placeholder="e.g., 60"
                />
              </div>
              <span className="opacity-80">°C</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              High Priority Threshold
            </label>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <Inputs.NumberInput
                  value={draft.highC}
                  onChange={(v) => setDraft((s) => ({ ...s, highC: v }))}
                  placeholder="e.g., 100"
                />
              </div>
              <span className="opacity-80">°C</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Critical Alert Threshold
            </label>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <Inputs.NumberInput
                  value={draft.criticalC}
                  onChange={(v) => setDraft((s) => ({ ...s, criticalC: v }))}
                  placeholder="e.g., 200"
                />
              </div>
              <span className="opacity-80">°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Signal Filtering */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold mb-1">Signal Filtering</h3>
        <p className="text-sm opacity-80 mb-4">
          Helps reduce false positives from brief spikes and noisy readings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Minimum duration above threshold
            </label>
            <Inputs.NumberInput
              value={draft.minDurationSec}
              onChange={(v) => setDraft((s) => ({ ...s, minDurationSec: v }))}
              placeholder="e.g., 5"
            />
            <p className="text-xs opacity-70 mt-2">Seconds</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Consecutive readings required
            </label>
            <Inputs.NumberInput
              value={draft.minConsecutiveReadings}
              onChange={(v) =>
                setDraft((s) => ({ ...s, minConsecutiveReadings: v }))
              }
              placeholder="e.g., 3"
            />
            <p className="text-xs opacity-70 mt-2">Samples</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Cooldown after alert
            </label>
            <Inputs.NumberInput
              value={draft.cooldownSec}
              onChange={(v) => setDraft((s) => ({ ...s, cooldownSec: v }))}
              placeholder="e.g., 30"
            />
            <p className="text-xs opacity-70 mt-2">Seconds</p>
          </div>
        </div>
      </div>

      {/* Save/Reset */}
      <div className="flex justify-end gap-3">
        <button
          onClick={doReset}
          disabled={!dirty}
          className={`px-6 py-2 rounded-md border border-white/20 ${
            !dirty ? "opacity-40 cursor-not-allowed" : "hover:bg-white/5"
          }`}
        >
          Reset
        </button>
        <button
          onClick={doSave}
          disabled={!dirty || validation.length > 0}
          className={`px-6 py-2 rounded-md bg-red-700 text-white ${
            !dirty || validation.length > 0
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-red-700/90"
          }`}
        >
          Save
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-black/70 text-white text-sm px-4 py-2 rounded-md border border-white/10">
          {toast}
        </div>
      )}
    </div>
  );
}
