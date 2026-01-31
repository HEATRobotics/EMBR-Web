"use client";

import { useState } from "react";
import { NumberInput, TextInput, SelectInput, Toggle } from "./inputs";

export default function AlertsPanel() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [desktopEnabled, setDesktopEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const [emailRecipients, setEmailRecipients] = useState("");
  const [smsRecipients, setSmsRecipients] = useState("");

  const [repeatCritical, setRepeatCritical] = useState(true);
  const [repeatIntervalSec, setRepeatIntervalSec] = useState(30);

  const [ackPolicy, setAckPolicy] = useState<"required" | "optional">("required");
  const [autoEscalateSec, setAutoEscalateSec] = useState(120);

  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("06:00");

  return (
    <div className="space-y-6">
      {/* Channels */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold mb-1">Alerts & Notifications</h2>
        <p className="text-sm opacity-80 mb-5">
          Configure how operators are notified when hotspots are detected.
        </p>

        <div className="space-y-3">
          <Toggle
            checked={soundEnabled}
            onChange={setSoundEnabled}
            label="Enable sound alerts"
            description="Play a sound when a new hotspot appears."
          />
          <Toggle
            checked={desktopEnabled}
            onChange={setDesktopEnabled}
            label="Enable desktop notifications"
            description="Shows OS notifications when the dashboard is open."
          />
          <Toggle
            checked={emailEnabled}
            onChange={setEmailEnabled}
            label="Enable email notifications"
            description="Send email for High/Critical alerts."
          />
          {emailEnabled && (
            <div className="ml-7">
              <label className="block text-sm font-medium mb-2">
                Email recipients
              </label>
              <TextInput
                value={emailRecipients}
                onChange={setEmailRecipients}
                placeholder="ops@dept.ca, chief@dept.ca"
              />
              <p className="text-xs opacity-70 mt-2">
                Comma-separated list (validation later).
              </p>
            </div>
          )}

          <Toggle
            checked={smsEnabled}
            onChange={setSmsEnabled}
            label="Enable SMS notifications"
            description="Send SMS for Critical alerts."
          />
          {smsEnabled && (
            <div className="ml-7">
              <label className="block text-sm font-medium mb-2">
                SMS recipients
              </label>
              <TextInput
                value={smsRecipients}
                onChange={setSmsRecipients}
                placeholder="+1..., +1..."
              />
              <p className="text-xs opacity-70 mt-2">
                Comma-separated list (provider integration later).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Escalation */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold mb-1">Escalation</h3>
        <p className="text-sm opacity-80 mb-5">
          Reduce missed alerts during active incidents.
        </p>

        <div className="space-y-4">
          <Toggle
            checked={repeatCritical}
            onChange={setRepeatCritical}
            label="Repeat Critical alerts until acknowledged"
            description="Keeps notifying operators until someone acknowledges the alert."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Repeat interval
              </label>
              <NumberInput
                value={repeatIntervalSec}
                onChange={setRepeatIntervalSec}
                placeholder="e.g., 30"
              />
              <p className="text-xs opacity-70 mt-2">Seconds</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Acknowledgement policy
              </label>
              <SelectInput
                value={ackPolicy}
                onChange={(v) => setAckPolicy(v === "optional" ? "optional" : "required")}
              >
                <option value="required">Required for High/Critical</option>
                <option value="optional">Optional</option>
              </SelectInput>
              <p className="text-xs opacity-70 mt-2">
                Later we can tie this to roles (Operator/Admin).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Auto-escalate if not acknowledged
              </label>
              <NumberInput
                value={autoEscalateSec}
                onChange={setAutoEscalateSec}
                placeholder="e.g., 120"
              />
              <p className="text-xs opacity-70 mt-2">
                Seconds before escalating (future).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiet hours */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold mb-1">Quiet Hours</h3>
        <p className="text-sm opacity-80 mb-5">
          Optional: reduce non-critical notifications outside operational hours.
        </p>

        <div className="space-y-4">
          <Toggle
            checked={quietHoursEnabled}
            onChange={setQuietHoursEnabled}
            label="Enable quiet hours"
            description="Only Critical alerts will notify during quiet hours."
          />

          {quietHoursEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
              <div>
                <label className="block text-sm font-medium mb-2">Start</label>
                <TextInput value={quietStart} onChange={setQuietStart} placeholder="22:00" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End</label>
                <TextInput value={quietEnd} onChange={setQuietEnd} placeholder="06:00" />
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs opacity-60">
        *Template only — wiring to providers (email/SMS/webhooks) comes later.
      </p>
    </div>
  );
}
