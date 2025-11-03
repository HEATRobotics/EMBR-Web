# Socket.IO Documentation for EMBR-Web

## Overview

This project uses **Socket.IO v4.7.2** to establish real-time, bidirectional communication between the server and client applications. Socket.IO enables the web interface to receive live updates about robot telemetry data (position, battery, temperature) without requiring constant HTTP polling.

## Architecture

### Server-Side (Node.js/Express)
- **Location**: `/server/server.mjs`
- **Technology**: Socket.IO Server with Express HTTP server
- **Port**: 3100
- **Purpose**: Broadcasts real-time telemetry data to connected clients

### Client-Side (Next.js/React)
- **Location**: `/client/src/context/WebSocketContext.tsx`
- **Technology**: Socket.IO Client wrapped in React Context
- **Purpose**: Maintains persistent connection and distributes events to React hooks

---

## Server Implementation

### Setup

```javascript
// server/server.mjs
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
```

**Configuration Details:**
- Creates HTTP server wrapping Express app
- Enables CORS for the client running on `localhost:3000`
- Allows GET and POST methods with credentials

### Connection Handling

```javascript
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
```

The server logs when clients connect and disconnect, using unique socket IDs for identification.

### Event Emissions

The server emits three primary events when new telemetry data arrives from robots:

#### 1. **bots:update**
Emitted when robot position data is received and stored.

```javascript
const latestBotData = await getLatestBotData();
io.emit('bots:update', latestBotData);
```

**Payload**: Array of latest bot position data with fields:
- `botID`: Robot identifier
- `latitude`: GPS latitude
- `longitude`: GPS longitude
- `altitude`: GPS altitude
- `clockTime`: Timestamp

#### 2. **temperature:update**
Emitted when temperature sensor data is received and stored.

```javascript
const allTemperatureData = await getAllTemperatureData();
io.emit('temperature:update', allTemperatureData);
```

**Payload**: Array of all temperature readings with fields:
- `botID`: Robot identifier
- `temperature`: Temperature value
- `clockTime`: Timestamp

#### 3. **battery:update**
Emitted when battery data is received and stored.

```javascript
const allBatteryData = await getAllBatteryData();
io.emit('battery:update', allBatteryData);
```

**Payload**: Array of all battery readings with fields:
- `botID`: Robot identifier
- `battery`: Battery percentage/level
- `clockTime`: Timestamp

### Data Flow

```
MAVLink Data → mavlinkHandler.mjs → storeMavlinkData()
    ↓
Database Insert (MySQL)
    ↓
Fetch Updated Data
    ↓
Socket.IO Broadcast (io.emit)
    ↓
All Connected Clients
```

---

## Client Implementation

### WebSocket Context Provider

**Location**: `/client/src/context/WebSocketContext.tsx`

The WebSocketContext provides a singleton Socket.IO connection shared across the entire Next.js application.

```typescript
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketInstance = io('http://localhost:3100', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socketInstance.on('connect', () => {
            console.log('WebSocket connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error: Error) => {
            console.error('WebSocket connection error:', error);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
};
```

**Configuration Details:**
- **Transports**: Attempts WebSocket first, falls back to polling
- **Reconnection**: Automatically reconnects if connection drops
- **Reconnection Delay**: 1 second between attempts
- **Max Attempts**: 5 reconnection attempts

### Custom Hook: useWebSocket

```typescript
export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
```

**Returns:**
- `socket`: Socket.IO client instance (or null if not connected)
- `isConnected`: Boolean indicating connection status

---

## Data Hooks Pattern

The application uses custom React hooks to subscribe to specific Socket.IO events. These hooks follow a consistent pattern:

### Pattern Overview

1. **Initial HTTP Fetch**: Immediately load data via REST API for faster initial render
2. **WebSocket Subscription**: Listen for real-time updates via Socket.IO
3. **Data Processing**: Transform raw data into application-specific formats
4. **Cleanup**: Remove event listeners when component unmounts

### Example: useBotData

**Location**: `/client/src/hooks/useBotData.tsx`

```typescript
export function useBotData() {
    const [bots, setBots] = useState<RobotType[]>([]);
    const [botsLoading, setBotsLoading] = useState<boolean>(true);
    const [botError, setBotError] = useState<string | null>(null);
    const { socket, isConnected } = useWebSocket();

    // 1. Initial HTTP fetch
    useEffect(() => {
        const fetchInitialBotData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/bots/latest`);
                processBotData(response.data);
            } catch (err) {
                setBotError('Failed to fetch bot data.');
                setBotsLoading(false);
            }
        };
        fetchInitialBotData();
    }, []);

    // 2. WebSocket subscription
    useEffect(() => {
        if (!socket) return;

        const handleBotUpdate = (data: any[]) => {
            console.log('Bot information updated via WebSocket!', data);
            processBotData(data);
        };

        socket.on('bots:update', handleBotUpdate);

        // 3. Cleanup
        return () => {
            socket.off('bots:update', handleBotUpdate);
        };
    }, [socket]);

    const processBotData = (data: any[]) => {
        // Transform and set state
        const botList: RobotType[] = data.map((bot: any) => ({
            // ... transformation logic
        }));
        setBots(botList);
        setBotsLoading(false);
    };

    return { bots, botsLoading, botError };
}
```

### Available Data Hooks

| Hook | Event | Purpose | Location |
|------|-------|---------|----------|
| `useBotData` | `bots:update` | Latest robot position data | `/client/src/hooks/useBotData.tsx` |
| `useAllBatteryData` | `battery:update` | Complete battery history | `/client/src/hooks/useAllBatteryData.tsx` |
| `useLatestBatteryData` | `battery:update` | Most recent battery reading | `/client/src/hooks/useLatestBatteryData.tsx` |
| `useAllTemperatureData` | `temperature:update` | Complete temperature history | `/client/src/hooks/useAllTemperatureData.tsx` |
| `useLatestTemperatureData` | `temperature:update` | Most recent temperature reading | `/client/src/hooks/useLatestTemperatureData.tsx` |

---

## Event Reference

### Server → Client Events

| Event Name | Trigger | Payload Type | Description |
|------------|---------|--------------|-------------|
| `bots:update` | New position data stored | `Array<BotData>` | Latest GPS coordinates for all robots |
| `temperature:update` | New temperature data stored | `Array<TemperatureData>` | All temperature readings |
| `battery:update` | New battery data stored | `Array<BatteryData>` | All battery level readings |
| `connect` | Client connects | - | Built-in Socket.IO event |
| `disconnect` | Client disconnects | - | Built-in Socket.IO event |
| `connect_error` | Connection fails | `Error` | Built-in Socket.IO event |

### Client → Server Events

**Currently None** - The application uses a unidirectional data flow where the server broadcasts to all clients. Clients do not send events to the server via Socket.IO (they use REST API for commands).

---

## Usage in Components

### 1. Wrap Application with Provider

**Location**: `/client/src/app/StoreProvider.tsx` or `/client/src/app/layout.tsx`

```typescript
import { WebSocketProvider } from '@/context/WebSocketContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <WebSocketProvider>
            {children}
        </WebSocketProvider>
    );
}
```

### 2. Use Data Hooks in Components

```typescript
import { useBotData } from '@/hooks/useBotData';

export function BotMap() {
    const { bots, botsLoading, botError } = useBotData();

    if (botsLoading) return <div>Loading...</div>;
    if (botError) return <div>Error: {botError}</div>;

    return (
        <div>
            {bots.map(bot => (
                <BotMarker key={bot.botID} bot={bot} />
            ))}
        </div>
    );
}
```

### 3. Direct Socket Access (Advanced)

If you need direct access to the socket instance:

```typescript
import { useWebSocket } from '@/context/WebSocketContext';

export function CustomComponent() {
    const { socket, isConnected } = useWebSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on('custom:event', (data) => {
            console.log('Custom event received:', data);
        });

        return () => {
            socket.off('custom:event');
        };
    }, [socket]);

    return <div>Connected: {isConnected ? 'Yes' : 'No'}</div>;
}
```

---

## Best Practices

### 1. Always Clean Up Event Listeners

```typescript
useEffect(() => {
    if (!socket) return;

    const handler = (data) => { /* ... */ };
    socket.on('event:name', handler);

    // IMPORTANT: Remove listener on unmount
    return () => {
        socket.off('event:name', handler);
    };
}, [socket]);
```

**Why?** Prevents memory leaks and duplicate event handlers.

### 2. Check Socket Existence Before Use

```typescript
useEffect(() => {
    if (!socket) return; // Guard clause
    
    // ... socket operations
}, [socket]);
```

**Why?** Socket may be null during initial render or disconnection.

### 3. Use isConnected for UI Feedback

```typescript
const { socket, isConnected } = useWebSocket();

return (
    <div>
        <StatusIndicator connected={isConnected} />
        {/* ... */}
    </div>
);
```

**Why?** Provides users visibility into connection status.

### 4. Prefer Custom Hooks Over Direct Socket Access

✅ **Good:**
```typescript
const { bots } = useBotData();
```

❌ **Avoid:**
```typescript
const { socket } = useWebSocket();
socket.on('bots:update', ...);
```

**Why?** Custom hooks handle data fetching, error handling, and cleanup consistently.

### 5. Combine HTTP + WebSocket for Best UX

The application uses a hybrid approach:
- **HTTP GET**: Initial data load (faster first paint)
- **WebSocket**: Real-time updates (efficient continuous sync)

```typescript
// 1. Fetch initial data via HTTP immediately
useEffect(() => {
    axios.get('/api/data').then(procesData);
}, []);

// 2. Subscribe to WebSocket for updates
useEffect(() => {
    socket?.on('data:update', processData);
    return () => socket?.off('data:update');
}, [socket]);
```

---

## Troubleshooting

### Connection Issues

**Problem**: Client cannot connect to Socket.IO server

**Solutions:**
1. Verify server is running on port 3100: `docker compose up --build -d`
2. Check CORS configuration matches client origin
3. Inspect browser console for connection errors
4. Ensure firewall allows port 3100

### Event Not Received

**Problem**: Client doesn't receive expected events

**Debugging Steps:**
1. Add logging to server emit: `console.log('Emitting event:', eventName, data);`
2. Verify event listener is registered: `socket.on('event:name', handler)`
3. Check handler function is defined correctly
4. Ensure component is mounted (events fire while unmounted are lost)

### Memory Leaks

**Problem**: Application slows down over time

**Causes:**
- Event listeners not cleaned up
- Multiple instances of same listener

**Solution:**
```typescript
useEffect(() => {
    if (!socket) return;
    
    const handler = (data) => { /* ... */ };
    socket.on('event:name', handler);
    
    // CRITICAL: Always cleanup
    return () => {
        socket.off('event:name', handler);
    };
}, [socket]);
```

### Reconnection Loop

**Problem**: Socket repeatedly connects and disconnects

**Causes:**
- Server keeps restarting
- Network instability
- CORS errors causing disconnection

**Investigation:**
1. Check server logs for crashes
2. Verify stable network connection
3. Review browser Network tab for WebSocket frames
4. Check for CORS errors in console

---

## Development vs Production

### Current Configuration (Development)

```javascript
// Server
origin: 'http://localhost:3000'

// Client
io('http://localhost:3100', { /* ... */ })
```

### Production Considerations

**Environment Variables:**
```javascript
// Server
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Client
const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100', {
    // ... config
});
```

**Additional Production Settings:**
- Enable compression
- Implement authentication/authorization
- Use HTTPS/WSS for secure connections
- Configure proper reconnection strategies
- Implement rate limiting

---

## Testing

### Manual Testing

1. Start server: `docker compose up --build -d`
2. Open browser DevTools → Console
3. Navigate to application
4. Look for: `WebSocket connected: <socket-id>`
5. Trigger data update (robot movement)
6. Verify console logs: `Bot information updated via WebSocket!`

### Adding Logging

**Server:**
```javascript
io.emit('bots:update', latestBotData);
console.log('Broadcasted bots:update to', io.engine.clientsCount, 'clients');
```

**Client:**
```typescript
socket.on('bots:update', (data) => {
    console.log('Received bots:update:', data);
    processBotData(data);
});
```

---

## Performance Considerations

### Broadcasting Strategy

The server uses `io.emit()` which broadcasts to **all connected clients**. This is suitable for the current use case but consider alternatives for scale:

- `socket.emit()`: Send to specific client
- `socket.broadcast.emit()`: Send to all except sender
- Rooms/Namespaces: Group clients by mission/team

### Data Volume

Current approach sends **all** historical data on each update:
```javascript
const allBatteryData = await getAllBatteryData();
io.emit('battery:update', allBatteryData);
```

**Optimization Ideas:**
- Only broadcast new/changed data
- Implement pagination for historical data
- Use HTTP for bulk data, WebSocket for deltas

### Connection Limits

Socket.IO scales well but consider:
- Default Node.js max connections: ~10,000
- Each socket consumes memory
- Monitor server resources with many simultaneous clients

---

## Future Enhancements

### Potential Improvements

1. **Authentication**: Secure WebSocket connections with JWT tokens
2. **Client-to-Server Events**: Allow clients to send commands via Socket.IO
3. **Namespaces**: Separate channels for different data types or missions
4. **Presence System**: Track which users are viewing which robots
5. **Compression**: Enable Socket.IO compression for large payloads
6. **Binary Support**: Use binary events for large thermal images
7. **Acknowledgments**: Confirm critical messages were received

### Example: Adding Authentication

**Server:**
```javascript
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (isValidToken(token)) {
        next();
    } else {
        next(new Error('Authentication failed'));
    }
});
```

**Client:**
```typescript
const socketInstance = io('http://localhost:3100', {
    auth: {
        token: userToken
    }
});
```

---

## Resources

- **Socket.IO Documentation**: https://socket.io/docs/v4/
- **Socket.IO Client API**: https://socket.io/docs/v4/client-api/
- **Socket.IO Server API**: https://socket.io/docs/v4/server-api/
- **Debugging Guide**: https://socket.io/docs/v4/troubleshooting-connection-issues/

---

## Summary

Socket.IO in EMBR-Web enables real-time robot telemetry visualization by:

1. **Server** receives MAVLink data from robots
2. **Server** stores data in MySQL database
3. **Server** broadcasts updates via Socket.IO events
4. **Client** maintains persistent WebSocket connection
5. **Client** hooks subscribe to specific events
6. **Client** updates UI with real-time data

This architecture provides low-latency updates while maintaining a clean separation between data transport (Socket.IO) and data consumption (React hooks).
