# WebSocket Integration Guide

## Overview

Aplikasi ini menggunakan **Socket.IO Client** untuk menerima data sensor secara real-time dari backend IoT.

## Configuration

### Environment Variables

File `.env` berisi konfigurasi URL WebSocket:

```env
VITE_WEBSOCKET_URL=ws://127.0.0.1:5000
```

### Switching Between Environments

#### Development (Local)

```env
VITE_WEBSOCKET_URL=ws://127.0.0.1:5000
```

#### Production (Ngrok)

```env
VITE_WEBSOCKET_URL=ws://premedical-caryl-gawkishly.ngrok-free.dev
```

## WebSocket Connection Details

### Connection URL Pattern

```
ws://{host}/socket.io/?EIO=4&transport=websocket&type=frontend
```

### Socket.IO Configuration

```javascript
{
  path: "/socket.io/",
  transports: ["websocket"],
  query: {
    EIO: 4,
    transport: "websocket",
    type: "frontend"
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
  autoConnect: true,
}
```

## Data Format

### Incoming Data (from Backend)

#### Option 1: Event `sensor_data`

```javascript
{
  hr: 85,              // Heart Rate in BPM
  temp: 34.5,          // Temperature in Celsius
  gsr: 12.345,         // Galvanic Skin Response in µS
}
```

#### Option 2: Event `esp32_live_data` (ESP32 Format)

```javascript
{
  hr: 75.5,            // Heart Rate in BPM
  temp: 36.2,          // Temperature in Celsius
  eda: 0.45,           // Electrodermal Activity (same as GSR) in µS
  device_id: "ESP32_001"  // Optional: Device identifier
}
```

**Note**: Both `eda` (Electrodermal Activity) and `gsr` (Galvanic Skin Response) refer to the same measurement and are interchangeable.

Alternative field names also supported:

```javascript
{
  heartRate: 85,                    // Alternative to 'hr'
  temperature: 34.5,                // Alternative to 'temp'
  galvanicSkinResponse: 12.345,     // Alternative to 'gsr'
  eda: 12.345,                      // Alternative to 'gsr' (ESP32 format)
}
```

## Events Handled

### Connection Events

- **connect**: Triggered when connection is established
- **disconnect**: Triggered when connection is lost
- **connect_error**: Triggered on connection errors
- **reconnect_attempt**: Triggered during reconnection attempts
- **reconnect**: Triggered when reconnection succeeds

### Data Events

- **sensor_data**: Receives real-time sensor data (standard format)
- **esp32_live_data**: Receives real-time sensor data from ESP32 devices

## Features

### Auto-Reconnection

The application automatically attempts to reconnect if connection is lost:

- Max attempts: 10
- Delay between attempts: 1000ms (1 second)

### Connection Status Indicator

Visual indicator in the dashboard header shows:

- 🟢 Green dot (pulsing): Connected
- 🔴 Red dot: Disconnected

### Data History

- Stores last 50 sensor readings
- Displays in RecordsTable component
- Auto-updates on new data

### Stress Classification

Data is automatically classified into:

- **Normal**: hr 60-90, gsr <5, temp 33.5-36.9°C
- **Stress Sedang**: hr 90-100, gsr 5-10, temp 33-34.5°C
- **Stress Berat**: Beyond above thresholds

## Testing the Connection

### Backend Requirements

Your backend server should:

1. Run Socket.IO server on specified port
2. Emit `sensor_data` events with correct format
3. Accept connections with query parameters: `type=frontend`

### Console Logs

Check browser console for connection status:

```
✅ WebSocket connected successfully!
Socket ID: ABC123XYZ
📊 Received sensor data: {hr: 85, temp: 34.5, gsr: 12.345}
```

### Troubleshooting

If connection fails:

1. Check if backend server is running
2. Verify VITE_WEBSOCKET_URL in .env
3. Check firewall/network settings
4. Verify Socket.IO server configuration
5. Check browser console for error messages

## Example Backend (Python with Flask-SocketIO)

```python
from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

# Send sensor data periodically
def send_sensor_data():
    while True:
        data = {
            'hr': get_heart_rate(),
            'temp': get_temperature(),
            'gsr': get_gsr()
        }
        socketio.emit('sensor_data', data)
        socketio.sleep(1)  # Send every second

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
```

## Security Notes

- The `.env` file is gitignored to protect sensitive configuration
- Use `.env.example` as template for new environments
- For production, use HTTPS/WSS instead of HTTP/WS
