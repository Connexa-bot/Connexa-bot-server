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
- `GET /api/status/:phone` - Check connection status
- `POST /api/logout` - Logout and clear session
- `POST /api/clear-state/:phone` - Clear session state

### Data Retrieval
- `GET /api/chats/:phone` - Get all chats
- `GET /api/messages/:phone/:chatId` - Get messages from chat
- `GET /api/contacts/:phone` - Get contacts
- `GET /api/groups/:phone` - Get groups
- `GET /api/status-updates/:phone` - Get status updates
- `GET /api/channels/:phone` - Get channels
- `GET /api/calls/:phone` - Get call history
- `GET /api/profile/:phone` - Get profile

### Messaging
- `POST /api/messages/send` - Send text message
- `POST /api/messages/send-image` - Send image
- `POST /api/messages/send-video` - Send video
- `POST /api/messages/send-audio` - Send audio
- `POST /api/messages/send-document` - Send document
- `POST /api/messages/send-location` - Send location
- `POST /api/messages/send-poll` - Send poll
- `POST /api/messages/send-broadcast` - Broadcast message

### Chat Actions
- `POST /api/chats/archive` - Archive/unarchive chat
- `POST /api/chats/pin` - Pin/unpin chat
- `POST /api/chats/mute` - Mute/unmute chat
- `POST /api/chats/mark-read` - Mark as read
- `POST /api/chats/delete` - Delete chat

### Privacy & Security
- `GET /api/privacy/settings/:phone` - Get privacy settings
- `POST /api/privacy/settings/update` - Update privacy settings
- `GET /api/privacy/blocked/:phone` - Get blocked contacts
- `POST /api/privacy/block` - Block user
- `POST /api/privacy/unblock` - Unblock user
- `POST /api/privacy/disappearing-messages` - Set disappearing messages
- `GET /api/privacy/business-profile/:phone/:jid` - Get business profile

### AI Features (Requires OPENAI_API_KEY)
- `POST /api/ai/smart-reply` - Generate smart reply suggestions
- `POST /api/ai/auto-reply` - Auto-reply with AI
- `POST /api/ai/generate` - Generate AI response
- `POST /api/ai/sentiment` - Analyze sentiment
- `POST /api/ai/analyze-image` - Analyze image with AI
- `POST /api/ai/transcribe` - Transcribe audio
- `POST /api/ai/translate` - Translate text
- `POST /api/ai/improve` - Improve message quality
- `POST /api/ai/moderate` - Content moderation
- `POST /api/ai/summarize` - Summarize conversation
- `POST /api/ai/compose` - Smart compose message

## Frontend Integration

The frontend is a React Native mobile application located in the `/frontend` directory. It connects to this backend API via:

- **API URL**: Auto-detected based on environment
- **Communication**: REST API + Socket.IO for real-time updates

To update the frontend API endpoint, modify `/frontend/src/config.js`.

## Recent Changes (Oct 12, 2025)

### Initial Setup & Configuration
1. **Environment Auto-Detection**: Fixed server URL detection to prioritize Replit environment over .env file configuration
2. **Gitignore**: Updated with comprehensive Node.js ignore patterns
3. **Deployment**: Configured for VM deployment (always-on for WebSocket connections)
4. **Port Standardization**: Unified all port configurations to 5000 (config.js, index.js, workflow)

### Backend Enhancements
5. **Complete API Endpoints**: Created comprehensive `API.js` file with all endpoints for frontend integration
6. **Advanced Baileys Features**: Added missing endpoints:
   - Privacy settings (get/update with validation)
   - Blocked contacts (list/block/unblock)
   - Disappearing messages
   - Business profile retrieval
7. **Privacy Settings Fix**: Updated privacy settings to use proper Baileys options object format with input validation
8. **Enhanced Test Script**: Updated `test-endpoints.sh` with comprehensive testing for all endpoints including new privacy section
9. **AI Integration**: Full OpenAI integration (GPT-5) for:
   - Smart replies and auto-reply
   - Sentiment analysis
   - Image and audio analysis
   - Translation and content moderation
   - Message improvement and composition
10. **New Privacy Routes**: Added `/api/privacy/*` endpoints for advanced privacy controls
11. **Health Monitoring**: Added health check endpoints at `/health` and `/api/health`
12. **Documentation**: Updated API documentation with all new endpoints and examples

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
