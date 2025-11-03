# EMBR Web - Page Structure

## Overview
This document describes the page structure for the EMBR firefighter mission management system.

### 1. **Dashboard** (`/dashboard`)
- Overview of system status
- Quick stats: active missions, online bots, pending hotspots, alerts
- Quick action buttons
- Recent activity feed
- Active missions overview

### 2. **Missions** (`/missions`)
- Mission list with filtering (All, Draft, Active, Completed)
- Create new mission button
- Mission status overview

#### Mission Create (`/missions/create`)
- 5-step wizard for creating missions:
  1. Basic Info (name, description, priority)
  2. Define Area (map integration needed)
  3. Assign Bot
  4. Set Parameters (scan frequency, temperature thresholds)
  5. Review & Launch

#### Mission Detail (`/missions/[id]`)
- Live mission map showing bot location and hotspots
- Real-time bot status panel
- Mission information and progress
- Live temperature readings feed
- Export mission data option

### 3. **Bots** (`/bots`)
- Bot status overview (total, online, on mission)
- Bot list/grid view toggle
- Individual bot cards with status and actions

#### Bot Detail (`/bots/[id]`)
- Current bot status and telemetry
- Live data visualization
- Mission history
- Bot specifications and sensor status
- Maintenance log

### 4. **Hotspots** (`/hotspots`)
- Hotspot statistics by priority (Critical, High, Resolved)
- List view / Map view toggle
- Filter by status (All, New, Investigating, Resolved)
- Hotspot table with temperature, GPS, timestamp, mission info
- Export options (CSV, PDF)

#### Hotspot Detail (`/hotspots/[id]`)
- Map showing exact hotspot location
- Temperature history chart
- Thermal and visual images
- Priority and status information
- Field assignment to team members
- Notes and action log

### 5. **Reports** (`/reports`)
- Date range selector
- Summary statistics
- Mission history chart
- Hotspot frequency heatmap
- Bot performance metrics
- Temperature trends
- Export options (CSV, PDF)

### 6. **Team** (`/team`)
- Team member overview
- Member list with roles, status, and assignments
- Role management (Admin, Operator, Field Crew)
- Communication log

### 7. **Settings** (`/settings`)
- General settings (organization name, timezone, units)
- Temperature thresholds configuration
  - Normal, Moderate, High, Critical levels
- Alert preferences
  - Sound alerts, email, SMS, desktop notifications
- Bot configuration
- Map preferences

## Navigation

All pages include a consistent top navigation bar with:
- EMBR logo (links to dashboard)
- Navigation links to all main pages
- User menu placeholder

## Color Coding System

- 🟢 **Green**: Normal/Safe
- 🟡 **Yellow**: Moderate concern
- 🟠 **Orange**: High priority (brand color)
- 🔴 **Red**: Critical/Active fire

## Next Steps for Development

1. Integrate your existing `GoogleMap` component into mission pages
2. Connect bot data from your existing hooks (`useBotData`, etc.)
3. Implement real-time data updates with WebSocket connections
4. Add authentication and user management
5. Connect to backend APIs for mission, bot, and hotspot management
6. Implement the 5-step mission creation wizard with map drawing
7. Add chart components for temperature and analytics data
8. Implement export functionality for reports and hotspot data
9. Add mobile-responsive views for field crew

## Styling

All pages use:
- Tailwind CSS for styling
- Consistent card-based layouts
- White backgrounds with gray-100 page backgrounds
- Orange-600 as primary action color
- Responsive grid layouts

## File Structure

```
client/src/app/
├── page.tsx (redirects to /dashboard)
├── dashboard/
│   └── page.tsx
├── missions/
│   ├── page.tsx
│   ├── create/
│   │   └── page.tsx
│   └── [id]/
│       └── page.tsx
├── bots/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── hotspots/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── reports/
│   └── page.tsx
├── team/
│   └── page.tsx
└── settings/
    └── page.tsx

client/src/components/
└── Navigation.tsx
```
