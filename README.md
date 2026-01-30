# EMBR-Web

A full-stack web application for managing autonomous robotics missions, monitoring robot telemetry data, and tracking environmental conditions. Built with **Next.js** (frontend), **Node.js/Express** (backend), and **MySQL** (database), with Docker containerization for easy deployment.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Understanding the Architecture](#understanding-the-architecture)
- [Development Workflow](#development-workflow)
- [Debugging Guide](#debugging-guide)
- [Common Tasks](#common-tasks)
- [Additional Resources](#additional-resources)
- [Quick References](#quick-reference)

---
## Project Overview

### What is this project?

EMBR-Web is a management system for autonomous robots:
- **Track robots** in real-time on a map
- **Create and assign missions** to robots
- **Monitor sensor data** (temperature, battery, position)
- **View mission progress** and historical data

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MySQL 8.3 |
| Real-time | Socket.IO |
| Maps | Google Maps API |
| Deployment | Docker & Docker Compose |

### Folder Structure

```
EMBR-Web/
├── client/                      # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                # Pages and routes
│   │   │   ├── bots/          # Bots page with [id] detail route
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── hotspots/      # Hotspots page with [id] route
│   │   │   ├── missions/      # Missions page with [id] and create routes
│   │   │   ├── reports/       # Reports page
│   │   │   ├── settings/      # Settings page
│   │   │   ├── team/          # Team page
│   │   │   ├── layout.tsx     # Root layout
│   │   │   ├── page.tsx       # Home page
│   │   │   └── globals.css    # Global styles
│   │   ├── components/         # React components
│   │   │   ├── features/      # Feature-specific components
│   │   │   │   ├── bot/       # Bot components 
│   │   │   │   ├── dashboard/ # Dashboard components 
│   │   │   │   ├── map/       # Map components 
│   │   │   │   └── mission/   # Mission components 
│   │   │   ├── layout/        # Layout components (Navigation)
│   │   │   └── ui/            # Reusable UI components 
│   │   ├── api/                # API client functions
│   │   ├── assets/             # Static assets
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/            # React Context
│   │   ├── types/              # TypeScript types & interfaces
│   │   ├── constants/          # Constants & configuration
│   │   └── utils/              # Helper functions
│   └── package.json
├── server/                      # Backend (Express.js)
│   ├── src/
│   │   ├── index.mjs           # Server entry point
│   │   ├── config/             # Configuration files
│   │   ├── routes/             # API endpoint definitions
│   │   ├── controllers/        # Business logic & request handlers
│   │   ├── services/           # Database & external services
│   │   ├── sockets/            # WebSocket handlers
│   │   └── utils/              # Helper functions
│   ├── docker/
│   │   ├── ddl/                # Database initialization
│   │   │   └── init.sql        # SQL schema & initial data
│   │   └── mysql/              # MySQL data storage
│   └── package.json
├── docker-compose.yml          # Container orchestration
└── package.json                # Root package.json
```

---

## Prerequisites

You need to have these installed on your machine:

### Required
- **Docker** (v20.10+) - [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Git** - [Download](https://git-scm.com/downloads)
- **VS Code** - [Download](https://code.visualstudio.com/)

### Optional (Recommended)
- **Node.js** (v18+) - [Download](https://nodejs.org/)
  - Not required to run the project (Docker handles it), but installing it locally removes red squiggly underlines in VS Code for valid JavaScript/TypeScript code, improving the development experience.
- **MySQL Client Extension for VS Code** - [Download](https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-mysql-client2)
  - Useful for browsing the database, viewing table contents, and modifying data directly without using the command line.
- **Docker Containers Extension for VS Code** - [Download](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-containers)
  - Helpful for visualizing and managing Docker containers directly from VS Code.

### Verify Installation

```bash
# Check Docker is installed
docker --version

# Check Docker Compose is installed
docker compose version

# Check Git is installed
git --version

# (Optional) Check Node.js is installed
node --version
npm --version
```

### Removing Red Squiggly Underlines (Optional but Recommended)

If you install Node.js locally, VS Code will automatically use it for TypeScript checking. To ensure it's working:

1. **Install Node.js** locally (v18+)

2. **Restart VS Code** completely:
   - Close all VS Code windows
   - Reopen the project folder

3. **Install dependencies** (this helps VS Code understand types):
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```

4. **Verify TypeScript support** in VS Code:
   - Open any `.ts` or `.tsx` file
   - You should see no red squiggly underlines on valid code
   - If you still see errors, try:
     - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
     - Search for "TypeScript: Restart TS Server"
     - Select it and press Enter

**Result:** Valid TypeScript/JavaScript code will no longer have red underlines, and you'll get better code completion and error detection.

---



## Installation & Setup

Docker handles all dependencies for you.

```bash
# 1. Clone the repository
git clone <repo-url>
cd EMBR-Web

# 2. Start all services (builds images if needed)
docker compose up --build -d

# This command:
# - Builds Docker images for frontend and backend
# - Starts three containers: frontend, backend, database
# - Initializes the MySQL database with tables
# - Runs in background (-d flag)
```

**What's running after this?**
- Frontend: http://localhost:3000 (Next.js dev server)
- Backend: http://localhost:3100 (Express API)
- Database: localhost:3306 (MySQL)

---

## Understanding the Architecture

### How the App Works

```
User Browser (http://localhost:3000)
    ↓
Next.js Frontend (React + TypeScript)
    ├→ API Calls (axios to backend)
    └→ WebSocket (real-time data)
    ↓
Express Backend (http://localhost:3100)
    ├→ API Routes (/api/missions, /api/bots, etc.)
    ├→ WebSocket Handlers (real-time updates)
    └→ Business Logic & Data Processing
    ↓
MySQL Database (localhost:3306)
    └→ Tables: bot, mission, temperature, battery, position, hotspot
```

### Data Flow Explained: From User Click to Database

Here's what happens when a user interacts with the app (e.g., clicking "Load Bots"):

```
1. User clicks a button in the browser (e.g. Clicks Bots page)
                ↓
2. React component calls a HOOK (e.g., useBotData)
                ↓
3. Hook calls an API FUNCTION (e.g., fetchBots())
                ↓
4. API function makes HTTP request to backend
   GET http://localhost:3100/api/bots
                ↓
5. Backend ROUTE receives the request
   (/api/bots route defined in bot.routes.mjs)
                ↓
6. CONTROLLER processes the request and queries the DATABASE
   (bot.controller.mjs selects data from bot table in MySQL)
                ↓
7. Database returns data
                ↓
8. Controller formats and returns JSON response
                ↓
9. Frontend receives data and updates React component state
                ↓
10. Component re-renders with new data
                ↓
11. User sees updated bots on screen
```

### Understanding Key Concepts

**What is a Hook?**
- A **hook** is a React function that lets components "hook into" React features
- Example: `useBotData()` hook fetches bot data and manages loading/error states
- Hooks are reusable logic that can be shared across multiple components
- They handle complex operations like data fetching and state management
- Location: `client/src/hooks/`

**What is an API Call?**
- An **API call** is an HTTP request from the frontend to the backend asking for data
- It's like making a phone call to a restaurant: you ask for something (GET request), the restaurant responds with data
- Uses `axios` library to make requests
- Types of API calls:
  - `GET` - Retrieve data (read-only)
  - `POST` - Create new data
  - `PUT` - Update existing data
  - `DELETE` - Remove data
- Location: `client/src/api/`

**What are WebSockets and How Are They Different?**

| Feature | HTTP API Calls | WebSockets |
|---------|---|---|
| **Direction** | One-way: Client requests, server responds | Two-way: Server can send data anytime |
| **Use Case** | Getting initial data, creating/updating records | Real-time updates (live notifications) |
| **Connection** | New connection for each request | Persistent connection stays open |
| **Speed** | Slower (connection overhead per request) | Faster (connection already open) |
| **Example** | `GET /api/bots` returns all bots once | Server sends `'bots:update'` whenever bot data changes |

**WebSocket Flow:**
```typescript
// Backend: Sends real-time updates to all connected clients
socket.emit('bots:update', botData);

// Frontend: Listens for updates in useBotData hook
socket.on('bots:update', (data) => {
  processBotData(data);  // Update local state immediately
});
```

**When to Use What:**
- **HTTP API**: Loading initial data, creating missions, updating settings
- **WebSockets**: Live bot position updates, real-time temperature data, mission progress changes

---

## Development Workflow

### Code Quality Tools

```bash
# Format code (JavaScript/TypeScript)
cd client
npm run format

# Check for linting issues
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check formatting without fixing
npm run format:check
```

### Testing

```bash
# Run all tests
cd client
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**About the Tests:**
- Unit tests are located in the same directory as the source files with `.test.ts` or `.test.tsx` extensions
- Tests cover utility functions for area calculations, time conversions, and date/time formatting
- Coverage reports are generated in `client/coverage/` directory
- All tests must pass before merging a PR (enforced by GitHub Actions CI)

---

## Debugging Guide

### 1. View Container Logs

```bash
# All containers
docker compose logs -f

# Specific container
docker compose logs -f embr-server    # Backend
docker compose logs -f embr-frontend  # Frontend
docker compose logs -f embr-db        # Database

# Last 50 lines
docker compose logs --tail=50 embr-server

# Follow logs in real-time
docker compose logs -f
```

### 2. Access Container Shell

```bash
# Backend shell
docker exec -it embr-server bash

# Frontend shell
docker exec -it embr-frontend bash

# Database shell
docker exec -it embr-db bash
```

### 3. Database Debugging

1. Ensure the docker database container is running
2. Go to the database extension (Listed in [Prerequisites](#prerequisites)) and create a new connection
3. Host = 127.0.0.1, Port = 3306, Username = testuser, Password = pw, Database = embr

### 4. Browser DevTools (Frontend)

1. Open http://localhost:3000 in your browser
2. Press `F12` or right-click → "Inspect"
3. Use Console, Network, and Debugger tabs to inspect:
   - API calls (Network tab)
   - JavaScript errors (Console tab)
   - Component state (React DevTools extension recommended)

## Common Tasks

### Rebuild and restart
```bash
docker compose down  # Remove containers
docker compose up --build -d  # Rebuild
```

### Modifying database structure
If a database table structure needs to be modified, added, or deleted (this means changing columns, data types, etc not adding or removing actual data) these are the steps to follow:
1. Make your change in `server/docker/ddl/init.sql`
2. Bring down the docker containers: `docker compose down`
3. Delete `server/docker/mysql/data`
    - This contains all the files storing the database and its data. For the structure to change, the database has to be deleted so the app knows to rebuild the database with the structure defined in `init.sql`
4. Start all containers: `docker compose up --build -d`

## Additional Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [MySQL Reference](https://dev.mysql.com/doc/)
- [Socket.IO Docs](https://socket.io/docs/)
- [Docker Docs](https://docs.docker.com/)

### Learning Resources
- [Docker for Beginners](https://www.docker.com/resources/what-container)
- [Next.js Tutorial](https://nextjs.org/learn)
- [Express.js Tutorial](https://expressjs.com/en/starter/basic-routing.html)
- [MySQL Tutorial](https://www.w3schools.com/mysql/)

### Getting Help
- Check logs first: `docker compose logs`
- Check browser console (F12) for frontend errors
- Review error messages carefully—they usually point to the problem

---

## Quick Reference

### Most Common Commands

```bash
# Start everything
docker compose up --build -d

# View all logs
docker compose logs -f

# Stop everything
docker compose down

# Format code
cd client && npm run format

# Rebuild after dependency changes
docker compose build

# Restart everything
docker compose down && docker compose up --build -d

# Access backend shell
docker exec -it embr-server bash
```
