# ConnexaBot Server

## Overview
ConnexaBot is a WhatsApp bot backend server built with Node.js, Express, and Baileys (WhatsApp Web API). This server provides RESTful API endpoints and WebSocket support for managing WhatsApp connections, sending/receiving messages, managing contacts, groups, and more.

## Current State
- Server is running successfully on port 5000
- All dependencies installed
- Configured for Replit environment
- Deployment configured as VM (always-on) for maintaining WhatsApp connections

## Recent Changes
- **2024-10-08**: Initial Replit setup completed
  - Installed npm dependencies
  - Configured workflow for backend server
  - Set up deployment configuration (VM type)
  - Created project documentation

## Project Architecture

### Tech Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **WebSocket**: Socket.io
- **WhatsApp API**: Baileys v6.7.20
- **Storage**: File-based session storage (@rodrigogs/baileys-store)

### Directory Structure
```
.
├── controllers/       # Request handlers for API endpoints
├── helpers/          # Business logic and utility functions
├── routes/           # Express route definitions
├── utils/            # Utility functions
├── auth/             # WhatsApp session data (gitignored)
├── media/            # Uploaded/downloaded media files
├── config.js         # Configuration constants
└── index.js          # Main server entry point
```

### Key Features
1. **WhatsApp Connection Management**
   - Multi-session support (multiple phone numbers)
   - QR code generation for authentication
   - Session persistence

2. **API Endpoints**
   - `/api` - Base API endpoint
   - `/api/contacts` - Contact management (POST /action)
   - `/api/groups` - Group management (GET /:phone, POST /action)
   - `/api/messages` - Message operations
   - `/api/presence` - Presence/typing indicators
   - `/api/profile` - Profile management

3. **WebSocket Events**
   - Real-time connection status
   - Message events
   - WhatsApp connection/disconnection

## Environment Variables
The following environment variables are configured in `.env`:

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `AUTH_DIR` - Session storage directory (default: ./auth)
- `SERVER_URL` - Public server URL for API
- `LOG_LEVEL` - Logging verbosity (default: info)
- `MAX_QR_WAIT` - QR code timeout in ms (default: 60000)

## API Usage

### Base Endpoint
```
GET /api
Response: "🚀 WhatsApp Bot Backend running..."
```

### Contacts
```
POST /api/contacts/action
Body: { phone, action: "get"|"block"|"unblock"|"blocked", jid? }
```

### Groups
```
GET /api/groups/:phone
POST /api/groups/action
Body: { phone, action, groupId?, name?, participants?, ... }
```

### Messages
```
POST /api/messages/send
POST /api/messages/action
```

## Development

### Running Locally
The server is configured to run automatically via the Replit workflow.

### Testing
- API endpoint: `http://localhost:5000/api`
- WebSocket: `ws://localhost:5000`

## Deployment
- **Type**: VM (always-on)
- **Command**: `npm start`
- **Purpose**: Maintains WhatsApp connections and handles real-time events

## Notes
- WhatsApp sessions are stored in the `./auth` directory (excluded from git)
- Media files are stored in the `./media` directory
- The server uses CORS with origin "*" for development (should be restricted in production)
- Session data persists between restarts for seamless reconnection
