# Client Documentation

The `/client` directory contains the frontend code for the EMBR-Web project. It is built using modern web development tools and frameworks, including React, TypeScript, and Next.js. Below is an overview of the directory structure, conventions, and important components.

---

## **Directory Structure**

#### **1. `/components`**

This directory contains reusable React components that are used throughout the application. Components are organized by functionality or feature.

#### **2. `/hooks`**

This directory contains custom React hooks that encapsulate reusable logic for managing state and side effects. Currently, we have the following hooks:

- **`useMissions.tsx`**: A hook for fetching and managing mission data from the backend API.
- **`useBotData.tsx`**: A hook for retrieving and managing bot-related data.

#### **3. `/types`**

This directory defines TypeScript types and interfaces used throughout the application to ensure type safety.

- **`mission.type.ts`**: Defines the structure of a mission object, including fields like `missionID`, `botID`, `progress`, and `areaCoordinates`.
- **`robot.type.ts`**: Defines the structure of a robot object, including fields like `id`, `name`, `state`, and `coordinates`.
- **Conventions**: Types are named very closely to the way tables are named in SQL.

#### **4. `/api`**

This directory contains functions for interacting with the backend API. These functions abstract HTTP requests and provide a clean interface for fetching or updating data.

- **`missions.api.ts`**: Contains functions like `fetchMissions` and `updateMission` for interacting with the missions API.
- **Conventions**: API files are named after the feature they interact with (e.g., `missions.api.ts` for missions).

#### **5. `/app`**

This directory is specific to Next.js and contains application-level files, including layouts, pages, and global styles.

- **`layout.tsx`**: Defines the root layout for the application, including global providers like `StoreProvider`.
- **`globals.css`**: Contains global CSS styles for the application.
- **`embr-details/page.tsx`**: A page for displaying detailed information about a fleet, including charts and video streams.

#### **6. `/public`**

This directory contains static assets like images, icons, and other files that are served directly by the application.

---

### **Conventions**

#### **Component Organization**

- Components are organized by feature or functionality.
- Reusable components are placed in their respective directories under `/components`.
- Each component is typically accompanied by its styles and tests (if applicable).

#### **API Interaction**

- API calls are abstracted into functions in the `/api` directory.
- These functions use `axios` for making HTTP requests and handle error management.

---

### **Important Components**

#### **`MissionCreate`**

- **Location**: `/components/MissionControls/MissionCreate.tsx`
- **Purpose**: Provides a form for creating new missions, including selecting a fleet and defining mission parameters.
- **Props**:
  - `cancelCreate`: Function to cancel mission creation.
  - `saveCreate`: Function to save the new mission.
  - `newMission`: The current state of the mission being created.
  - `setNewMission`: Function to update the mission state.
  - `fleets`: List of available fleets to assign the mission to.

#### **`MapTools`**

- **Location**: `/components/MapTools/index.tsx`
- **Purpose**: Provides tools for interacting with the map, such as toggling satellite view and zooming.
- **Props**:
  - `satelliteValue`: Boolean indicating whether satellite view is enabled.
  - `onSatelliteViewChange`: Function to toggle satellite view.

#### **`RealTimeChart`**

- **Location**: `/components/RealTimeChart/index.tsx`
- **Purpose**: Displays real-time data visualizations, such as temperature or sensor readings.
- **Props**:
  - **`lineColor`**: Color of the chart line.
  - **`randomGenerator`**: Function to generate random data for the chart.
  - **`title`**: Title of the chart.
  - **`tags`**: Additional metadata or actions for the chart.

#### **`BotsBar`**

- **Location**: `/components/BotsBar/index.tsx`
- **Props**:

  - **`bots`**: An array of bot objects (`RobotType[]`) to be displayed in the sidebar.
  - **`selectedBot`**: The currently selected/clicked bot in the UI (`RobotType | null`).
  - **`disabled`**: A boolean indicating whether interactions with the bots or buttons are disabled.
  - **`setSelectedBot`**: A state setter function (`React.Dispatch<React.SetStateAction<RobotType | null>>`) to update the selected bot.

- **What it does**:
  - Displays a list of bots using the `Item` subcomponent.
  - Each bot shows its operational status via color coding (operational/green, charging required/yellow, attention required/orange, system failed/red).
  - Allows users to click on a bot to select it and view detailed information.
  - Includes action buttons for creating and deleting missions (delete currently disabled).
  - Shows a message ("No bots available") if the `bots` array is empty. The `bots` array is fetched from the database using the `useBotData` hook.

- **Terminology**:
  - **`selectedBot`**: The bot that is currently clicked/selected in the UI (for viewing details)
  - **`operationalStatus`**: The real-time operational state based on sensor data (operational, chargingRequired, attentionRequired, systemFailed)

---
