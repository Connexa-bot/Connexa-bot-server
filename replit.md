# ConnexaBot WhatsApp Backend Server

## Project Overview
ConnexaBot is a WhatsApp bot backend server built with Node.js, Express, and the Baileys WhatsApp library. It provides a REST API and WebSocket interface for managing WhatsApp connections, messages, contacts, groups, and AI-powered features.

## Architecture

### Backend Server
- **Entry Point**: `index.js`
- **Port**: 5000
- **Host**: 0.0.0.0 (configured for Replit environment)
- **Framework**: Express.js with Socket.IO for real-time communication

### Key Components
1. **WhatsApp Integration**: Uses Baileys library for WhatsApp Web API
2. **Session Management**: Multi-session support with persistent authentication
3. **API Routes**: RESTful endpoints for all WhatsApp operations
4. **WebSocket**: Real-time updates via Socket.IO
5. **AI Features**: OpenAI integration for smart replies and automation

### Directory Structure
- `/routes` - API route handlers
- `/helpers` - Core WhatsApp functionality and utilities
- `/controllers` - Business logic controllers
- `/auth` - WhatsApp session authentication data (gitignored)
- `/media` - Uploaded/downloaded media files (gitignored)
- `/frontend` - React Native mobile app (separate from backend)

## Environment Configuration

The server auto-detects the environment and configures URLs accordingly:

1. **Replit**: Uses `REPLIT_DEV_DOMAIN` environment variable
2. **Render**: Uses Render-specific URL
3. **Local**: Falls back to `http://localhost:5000`

### Required Environment Variables
- `PORT` - Server port (default: 5000)
- `AUTH_DIR` - Session data directory (default: ./auth)
- `OPENAI_API_KEY` - OpenAI API key for AI features (optional)
- `NODE_ENV` - Environment mode (development/production)

## API Endpoints

### Connection Management
- `POST /api/connect` - Connect WhatsApp session
- `GET /api/qr/:phoneNumber` - Get QR code for authentication
- `GET /api/status/:phoneNumber` - Check connection status
- `POST /api/disconnect/:phoneNumber` - Disconnect session

### Data Retrieval
- `GET /api/chats/:phoneNumber` - Get all chats
- `GET /api/messages/:phoneNumber/:chatId` - Get messages from chat
- `GET /api/contacts/:phoneNumber` - Get contacts
- `GET /api/groups/:phoneNumber` - Get groups
- `GET /api/status-updates/:phoneNumber` - Get status updates

### Actions
- `POST /api/messages/send` - Send message
- `POST /api/groups/create` - Create group
- `POST /api/profile/update` - Update profile

### AI Features
- `POST /api/ai/smart-reply` - Generate smart reply suggestions
- `POST /api/ai/translate` - Translate messages
- `POST /api/ai/summarize` - Summarize conversations

## Frontend Integration

The frontend is a React Native mobile application located in the `/frontend` directory. It connects to this backend API via:

- **API URL**: Auto-detected based on environment
- **Communication**: REST API + Socket.IO for real-time updates

To update the frontend API endpoint, modify `/frontend/src/config.js`.

## Recent Changes (Oct 12, 2025)

1. **Environment Auto-Detection**: Fixed server URL detection to prioritize Replit environment over .env file configuration
2. **Gitignore**: Updated with comprehensive Node.js ignore patterns
3. **Deployment**: Configured for VM deployment (always-on for WebSocket connections)

## Development Workflow

### Running Locally
```bash
npm install
node index.js
```

### Running on Replit
The server is configured to run automatically via the "Backend Server" workflow. It will:
1. Auto-detect the Replit domain
2. Start on port 5000
3. Create necessary directories (auth/, media/)
4. Listen for WebSocket and HTTP connections

## Deployment

Configured for Replit VM deployment:
- **Type**: VM (always running)
- **Command**: `node index.js`
- **Rationale**: WhatsApp sessions require persistent connections

## Known Issues & Solutions

### State Synchronization Errors
If you see "tried remove, but no previous op" errors, the session state may be corrupted. Use the clear state endpoint to reset.

### Empty Chats Response
Ensure the WhatsApp session is fully connected before fetching chats. The connection process can take a few seconds after QR code scan.

## User Preferences
- **Language**: JavaScript (ES6 modules)
- **Package Manager**: npm
- **Environment**: Replit
