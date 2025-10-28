# EMBR-Web Terminology Guide

This document defines the key terms used throughout the EMBR-Web codebase to avoid confusion.

## Robot/Bot Terms

### UI State Terms
- **selectedBot**: The bot that is currently clicked/selected in the UI for viewing details
  - Type: `RobotType | null`
  - Used in: GoogleMap, BotsBar, DetailsPanel, etc.
  - Example: When a user clicks on "Bot 1" in the sidebar, it becomes the `selectedBot`

### Robot Status Terms

#### assignmentStatus (Stored in Database)
Whether the robot is available for mission assignment.

**Values**:
- `"ready"` - Bot is available and ready to be assigned to a new mission
- `"assigned"` - Bot is currently assigned to and executing a mission
- `"inactive"` - Bot is temporarily out of service (maintenance, decommissioned, etc.)

**Determined by**: Mission assignment updates in the database
**Changes**: When missions are assigned or completed, or when admin marks bot inactive
**Used for**: Mission planning, bot selection, availability filtering
**Storage**: **STORED IN DATABASE** (`bot` table, `assignmentStatus` column)

#### operationalStatus (Calculated from Live Data)
The real-time operational health based on sensor readings.

**Values**:
- `"operational"` - All systems functioning normally (green indicator)
- `"chargingRequired"` - Battery below 20% (yellow indicator)
- `"attentionRequired"` - Temperature above 80°C (orange indicator)
- `"systemFailed"` - Battery at 0% or critical failure (red indicator)

**Determined by**: Current sensor data (battery level, temperature, etc.)
**Changes**: Frequently, as sensor data updates
**Used for**: Visual indicators, alerts, operational decisions
**Storage**: **NOT STORED** - calculated on-the-fly from live sensor data

**Key Design Decision**: 
- **`assignmentStatus`** is **STORED in the database** because it changes when missions are assigned/completed
- **`operationalStatus`** is **CALCULATED from live sensor data** because it changes constantly and doesn't need persistence

**Example Scenario**:
- A bot can be `assignmentStatus: "assigned"` (on a mission) in the database
- While simultaneously `operationalStatus: "chargingRequired"` (battery low) from live sensors
- This tells you: "Bot is on a mission but needs attention soon"

## Tab/Step Terms

### currentTab
The currently displayed tab in a tabbed interface.

**Example values**: `"Bot Info"`, `"Mission Info"`, `"Overview"`, `"Orientation"`, etc.
**Used in**: DetailsPanel, BotPanel, BotInfoPanel

### currentStep
The current step in a multi-step workflow.

**Example values**: `0`, `1`, `2` (for area selection, bot selection, naming)
**Used in**: MissionCreate component

## Mission Terms

### activeMission
The mission associated with the currently selected bot.

**Type**: `MissionType | undefined`
**Note**: "active" here means "relevant to the current selection", not a status

### activeMissionCreate
Boolean flag indicating whether mission creation mode is currently active.

**Type**: `boolean`
**Note**: "active" here means "currently in progress/enabled"

## Map Terms

### UBCO_COORDS
The default center point of the map (University of British Columbia Okanagan campus).

**Type**: `google.maps.LatLngLiteral`
**Value**: `{ lat: 49.939434, lng: -119.396427 }`

### Zoom Levels
- `DEFAULT_ZOOM`: `14` - Default map zoom level
- `BOT_FOCUS_ZOOM`: `20` - Zoom level when focusing on a specific bot

## Common Patterns

### Naming Convention for UI State
- Use `selected*` for user-selected items
- Use `current*` for currently displayed/active UI elements
- Use `is*` or `*Enabled` for boolean flags

### Naming Convention for Handlers
- Use descriptive verb phrases: `handleBotClick`, `handleResizeStart`
- Use `on*` for callback props: `onSelect`, `onBoundsChanged`
- Use `enable*`/`disable*` for state toggles: `enableMapInteraction`

*Last Updated: 2025-10-27*
