# Robot Status Model

## Overview: Two Statuses, Clear Roles

Each robot now uses exactly two statuses with distinct responsibilities:

- assignmentStatus (DB-stored): Mission availability — one of "ready" | "assigned" | "active | "inactive"
- operationalStatus (calculated): Real-time health — one of "operational" | "chargingRequired" | "attentionRequired" | "systemFailed"

This replaces the previous three-status model (missionStatus/databaseStatus/operationalStatus) to remove overlap and confusion.

## Example Status Combinations

### Scenario 1: Healthy Bot on Mission
```typescript
{
  assignmentStatus: "active",       // Currently working a mission
  operationalStatus: "operational",   // All systems healthy
}
```
**Interpretation**: Bot is executing a mission and everything is working normally.

---

### Scenario 2: Available Bot with Low Battery
```typescript
{
  assignmentStatus: "ready",              // Available for missions
  operationalStatus: "chargingRequired",  // Battery low
}
```
**Interpretation**: Bot is available but should be charged before being assigned.

---

### Scenario 3: Bot on Mission with Temperature Warning
```typescript
{
  assignmentStatus: "assigned",            // Currently on a mission
  operationalStatus: "attentionRequired",  // Temperature high
}
```
**Interpretation**: Bot is working but needs monitoring due to high temperature.

---

### Scenario 4: Inactive Bot (Maintenance)
```typescript
{
  assignmentStatus: "inactive",       // Not available
  operationalStatus: "operational",   // Could be healthy, but offline
}
```
**Interpretation**: Bot is in maintenance/decommissioned and not available for missions.

---

### Scenario 5: Critical Failure
```typescript
{
  assignmentStatus: "assigned",      // Assigned to a mission but is not actively doing the mission
  operationalStatus: "systemFailed", // Battery dead or critical error
}
```
**Interpretation**: Bot has failed during mission execution - needs immediate attention!


## Status Usage Guidelines

### assignmentStatus
**When to check**:
- Filtering bots for mission assignment (`assignmentStatus === "ready"`)
- Displaying availability in fleet overview
- Determining if a bot can accept new tasks
- Mission planning workflows

**Where it's used**:
- `MissionCreate.tsx` - Filter available bots
- `Stats.tsx` - Count ready/assigned bots
- `Item.tsx` (BotsBar) - Display assignment state
- Database queries for mission planning

**Storage**: 
- **STORED** in `bot` table, `assignmentStatus` column
- Enum values: `'ready'`, `'assigned'`, `'inactive'`

---

### operationalStatus
**When to check**:
- Determining status indicator color
- Triggering alerts for battery/temperature
- Showing real-time health in UI
- Monitoring fleet health

**Where it's used**:
- `GoogleMap.tsx` - Bot marker colors
- `BotPanel.tsx` - Health status display
- `robotConstants.ts` - Status colors/icons
- `useBotData.tsx` - Calculate from sensor data
- `MissionStartEnd.tsx` - Use in startAndEndMissionButton to determine when to enable and dissable the button

**Storage**: 
- **NOT STORED** - calculated on-the-fly from live sensor data
- Determined in `useBotData.tsx` hook

---

## Decision Matrix: Show in Mission Assignment?

| operationalStatus     | assignmentStatus | Show in Dropdown? | Reason |
|-----------------------|------------------|-------------------|---------|
| operational           | ready            | ✅ YES            | Perfect candidate |
| chargingRequired      | ready            | ⚠️ YES (with warning) | Available but needs attention |
| attentionRequired     | ready            | ⚠️ YES (with warning) | Available but needs attention |
| systemFailed          | ready            | ❌ NO             | Not functional |
| any                   | assigned         | ❌ NO             | Already on mission |
| any                   | inactive         | ❌ NO             | Out of service |

---


