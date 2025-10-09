# Frontend Connection Guide

## Fixed Issues ✅

I've fixed the connection issue where the app was freezing during login. The problem was that the QR code broadcast function wasn't properly connected to the WebSocket system.

### What Was Fixed:
- **QR Code Broadcasting**: The `/api/connect` endpoint now properly broadcasts QR codes via WebSocket to all connected clients
- **Connection Status Updates**: Status changes are now properly communicated to the frontend

## How to Connect Your Frontend

Your backend is now running at:
```
https://89b66ac7-131f-404a-96f3-8f786562c90a-00-2uczqxn06n9zz.picard.replit.dev
```

### Method 1: Using WebSocket (Recommended)

Connect to Socket.IO and listen for QR codes:

```javascript
import io from 'socket.io-client';

const socket = io('https://89b66ac7-131f-404a-96f3-8f786562c90a-00-2uczqxn06n9zz.picard.replit.dev');

// Connect to WhatsApp
socket.emit('connect-whatsapp', phoneNumber);

// Listen for QR code
socket.on('qr', (data) => {
  console.log('QR Code received:', data.qr);
  // Display QR code to user
  displayQRCode(data.qr);
});

// Listen for status updates
socket.on('status', (data) => {
  if (data.connected) {
    console.log('Connected successfully!');
  } else if (data.error) {
    console.error('Connection error:', data.error);
  }
});
```

### Method 2: Using HTTP Polling

Alternatively, you can use the REST API with polling:

```javascript
const phoneNumber = '1234567890';

// 1. Initiate connection
const response = await fetch('https://89b66ac7-131f-404a-96f3-8f786562c90a-00-2uczqxn06n9zz.picard.replit.dev/api/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: phoneNumber })
});

const result = await response.json();

if (result.qrCode) {
  // Display QR code
  displayQRCode(result.qrCode);
} else if (result.connected) {
  // Already connected
  console.log('Already connected!');
} else if (result.error) {
  // Handle error
  console.error('Error:', result.error);
}

// 2. Poll for status updates (if needed)
const checkStatus = async () => {
  const statusResponse = await fetch(`https://89b66ac7-131f-404a-96f3-8f786562c90a-00-2uczqxn06n9zz.picard.replit.dev/api/status/${phoneNumber}`);
  const status = await statusResponse.json();
  
  if (status.qrCode) {
    displayQRCode(status.qrCode);
  } else if (status.connected) {
    console.log('Connected!');
  }
};
```

## Available Endpoints

### Connection Endpoints
- `POST /api/connect` - Start WhatsApp connection
- `GET /api/status/:phone` - Check connection status
- `POST /api/logout` - Logout and clear session

### Data Endpoints (require active connection)
- `GET /api/chats/:phone` - Get all chats
- `GET /api/messages/:phone/:chatId` - Get messages for a chat
- `GET /api/contacts/:phone` - Get contacts
- `GET /api/groups/:phone` - Get groups
- `GET /api/profile/:phone` - Get user profile

## Troubleshooting

### App Still Freezing?
1. **Check WebSocket Connection**: Make sure your frontend can connect to Socket.IO
2. **CORS Issues**: The backend has CORS enabled for all origins, but check browser console
3. **Phone Number Format**: Use numbers only (e.g., "1234567890" not "+1 234-567-890")

### Connection Closes Immediately?
1. **Check Server Logs**: The backend logs all connection attempts
2. **Wait for QR**: The connection needs 1-2 seconds to generate a QR code
3. **Max Attempts**: By default, QR code expires after 3 attempts (configurable via `MAX_QR_ATTEMPTS` env var)

### No QR Code Displayed?
1. **Listen to Both Events**: Use WebSocket for real-time updates AND check the HTTP response
2. **Check Data Format**: QR code is returned as a string in `qrCode` field
3. **Multiple Connections**: If a session already exists for a phone number, it will be cleared first

## Environment Variables

You can configure these in your `.env` file (backend):

```env
PORT=5000
AUTH_DIR=./auth
MAX_QR_WAIT=60000      # Max wait time for QR (milliseconds)
MAX_QR_ATTEMPTS=3      # Max QR code generation attempts
```

## Next Steps

Your backend is ready to go! Make sure your frontend:
1. Uses the correct backend URL (shown above)
2. Implements either WebSocket or HTTP polling
3. Handles QR code display and status updates properly
