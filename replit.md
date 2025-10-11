# ConnexaBot WhatsApp Backend

## Overview
ConnexaBot is a WhatsApp bot backend built with Node.js, Express, and Baileys (WhatsApp Web API). This backend provides a RESTful API for managing WhatsApp connections, sending/receiving messages, managing contacts, groups, and integrating AI features using OpenAI.

**Current State**: Backend server is running successfully on port 5000 in Replit environment.

## Recent Changes (October 11, 2025)
- **Phone Number Normalization Fix**: Fixed critical bug where frontend and backend used different phone number formats, causing connection status detection to fail
- **Backend Normalization**: Added `normalizePhone()` function to `/api/connect`, `/api/status/:phone`, and `/api/logout` endpoints to strip all non-digit characters
- **Frontend Normalization**: Added `cleanPhone` state to `LinkDeviceScreen` to store normalized phone number for consistent polling and storage
- **Enhanced Status Endpoint**: Added comprehensive debug logging to `/api/status/:phone` endpoint
- **Improved Status Response**: Status endpoint returns multiple status fields (connected, authenticated, ready, isConnected) for frontend compatibility
- **Session Validation**: Added better session existence checks and detailed logging for troubleshooting
- **Replit Setup**: Configured workflow to run backend server with proper logging

## Project Architecture

### Core Components
1. **Entry Point**: `index.js` - Main server setup with Express, Socket.IO, and middleware configuration
2. **Session Management**: `helpers/whatsapp.js` - Manages WhatsApp client connections using Baileys library
3. **API Routes**: `routes/api.js` - Main API endpoints for connection, status, and core operations
4. **Controllers**: Individual controllers for chats, messages, groups, contacts, presence, profile, AI
5. **Helpers**: Utility functions for WhatsApp operations, AI service, message actions, etc.

### Key Files
- `index.js`: Server entry point (port 5000)
- `helpers/whatsapp.js`: WhatsApp client initialization and session management
- `routes/api.js`: Connection, status, and main API routes
- `helpers/aiService.js`: OpenAI integration for AI features
- `package.json`: Dependencies and scripts

### Directory Structure
```
.
├── controllers/       # Request handlers
├── helpers/          # Core logic and utilities
├── routes/           # API route definitions
├── utils/            # Utility functions
├── auth/             # WhatsApp session data (gitignored)
├── media/            # Downloaded media files (gitignored)
├── chat_history/     # AI chat history (gitignored)
└── index.js          # Main entry point
```

## API Endpoints

### Connection Endpoints
- `POST /api/connect` - Initiate WhatsApp connection (returns QR code or link code)
- `GET /api/status/:phone` - Check connection status with detailed logging
- `POST /api/logout` - Disconnect and clear session

### Chat & Message Endpoints
- `GET /api/chats/:phone` - Get all chats
- `GET /api/messages/:phone/:chatId` - Get message history
- `POST /api/messages/send` - Send text message
- `POST /api/messages/send-media` - Send media message

### Contact & Group Endpoints
- `GET /api/contacts/:phone` - Get contacts
- `GET /api/groups/:phone` - Get groups
- `POST /api/groups/create` - Create group
- Various group management endpoints

### AI Endpoints
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/analyze-image` - Analyze images with AI
- `POST /api/ai/transcribe` - Transcribe audio
- Various AI feature endpoints

## Environment Variables
- `PORT`: Server port (default: 5000)
- `HOST`: Server host (default: 0.0.0.0)
- `SERVER_URL`: Public server URL (auto-detected for Replit/Render)
- `AUTH_DIR`: WhatsApp auth directory (default: ./auth)
- `MEDIA_DIR`: Media storage directory (default: ./media)
- `MAX_QR_ATTEMPTS`: Maximum QR generation attempts (default: 3)
- `MAX_QR_WAIT`: Connection timeout in ms (default: 60000)
- `OPENAI_API_KEY`: OpenAI API key for AI features (optional)

## Session Management
- Sessions are stored in-memory using a `Map` in `helpers/whatsapp.js`
- Each session includes: socket, store, connection status, QR code, link code, error state
- Sessions are keyed by normalized phone number (digits only: `phone.replace(/\D/g, '')`)
- Session data is persisted to disk in the `auth/` directory
- **Critical**: All endpoints use consistent phone normalization to ensure session lookup works correctly

## Status Detection Fix
The `/api/status/:phone` endpoint was enhanced with:
1. **Comprehensive Logging**: Logs all session keys, session details, connection status
2. **Multiple Status Fields**: Returns `connected`, `authenticated`, `ready`, `isConnected` for frontend compatibility
3. **Robust Detection**: Checks both `session.connected` and `session.sock?.user?.id` for connection state
4. **Debug Output**: Detailed console logs with separators for easy troubleshooting

## Frontend Integration
This backend is designed to work with a separate frontend application (https://github.com/Connexa-bot/ConnexaBotApp). The frontend should:
1. Call `POST /api/connect` with phone number to initiate connection
2. Display the returned QR code or link code to user
3. Poll `GET /api/status/:phone` every 3 seconds to check connection status
4. Once `connected: true` is received, navigate to main app screen
5. Use the phone number for all subsequent API calls

## Development
- **Start Server**: `npm start` (runs on port 5000)
- **Dependencies**: Installed via `npm install`
- **Workflow**: Backend Server workflow is configured and running

## Dependencies
- `baileys`: WhatsApp Web API
- `express`: Web framework
- `socket.io`: WebSocket support
- `openai`: AI features
- `mongoose`: MongoDB ORM (if using database)
- `@rodrigogs/baileys-store`: Baileys in-memory store
- Other utilities: cors, dotenv, morgan, multer, qrcode, etc.

## Notes
- Backend runs on port 5000 (suitable for Replit environment)
- No frontend is included in this repository
- WhatsApp connection uses pairing code (link code) or QR code
- AI features require OPENAI_API_KEY environment variable
- Session data is stored locally in `auth/` directory
