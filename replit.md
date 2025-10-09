# ConnexaBot Server

## Overview
ConnexaBot is a WhatsApp bot backend server built with Node.js, Express, and Baileys (WhatsApp Web API). This server provides RESTful API endpoints and WebSocket support for managing WhatsApp connections, sending/receiving messages, managing contacts, groups, and more.

## Current State
- Server is running successfully on port 5000
- All dependencies installed
- Configured for Replit environment
- Deployment configured as VM (always-on) for maintaining WhatsApp connections

## Recent Changes
- **2024-10-09**: Added advanced AI automation system
  - Integrated OpenAI GPT-5 for intelligent chat automation
  - Implemented auto-reply, smart suggestions, and context-aware responses
  - Added image analysis, audio transcription, and sentiment detection
  - Created comprehensive AI endpoints and documentation
  - Added all missing frontend endpoints (messages, calls, status, etc.)
  - Updated frontend-api.js with complete API reference
  
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
- **AI Engine**: OpenAI GPT-5 (latest model)
- **Storage**: File-based session storage (@rodrigogs/baileys-store)
- **AI Features**: Auto-reply, smart suggestions, image analysis, audio transcription

### Directory Structure
```
.
├── controllers/       # Request handlers for API endpoints
│   ├── ai.js         # AI automation controller
│   └── ...          # Other controllers
├── helpers/          # Business logic and utility functions
│   ├── aiService.js  # AI service (GPT-5 integration)
│   └── ...          # Other helpers
├── routes/           # Express route definitions
│   ├── ai.js         # AI automation routes
│   └── ...          # Other routes
├── utils/            # Utility functions
├── auth/             # WhatsApp session data (gitignored)
├── media/            # Uploaded/downloaded media files
├── chat_history/     # AI conversation context (gitignored)
├── config.js         # Configuration constants
├── index.js          # Main server entry point
└── frontend-api.js   # Complete API documentation for frontend
```

### Key Features
1. **WhatsApp Connection Management**
   - Multi-session support (multiple phone numbers)
   - QR code generation for authentication
   - Session persistence

2. **🤖 AI Automation (NEW)**
   - Smart auto-replies with context learning
   - Image analysis and description
   - Audio transcription (voice to text)
   - Sentiment analysis
   - Smart reply suggestions (3 options)
   - Conversation summarization
   - Multi-language support

3. **API Endpoints**
   - `/api` - Base API endpoint
   - `/api/contacts` - Contact management
   - `/api/groups` - Group management
   - `/api/messages` - Message operations (send, download, actions)
   - `/api/calls` - Call history
   - `/api/status-updates` - Status/stories
   - `/api/channels` - Channel subscriptions
   - `/api/communities` - Community management
   - `/api/profile` - Profile management
   - `/api/presence` - Presence/typing indicators
   - `/api/ai/*` - AI automation endpoints (9 endpoints)

4. **WebSocket Events**
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
- `OPENAI_API_KEY` - OpenAI API key for AI automation (required for AI features)

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
