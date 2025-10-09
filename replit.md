# ConnexaBot WhatsApp Server - Replit Setup

## Overview
ConnexaBot is a WhatsApp bot backend built with Node.js, Express, and Baileys. It provides a REST API and WebSocket connections for managing WhatsApp sessions, sending messages, and AI integration.

## Project Structure
- **controllers/** - API endpoint handlers
- **helpers/** - Core functionality (WhatsApp connection, AI services, etc.)
- **routes/** - Express route definitions
- **utils/** - Utility functions
- **auth/** - WhatsApp session storage (gitignored)
- **media/** - Media file storage (gitignored)

## Configuration

### Environment Variables
Key environment variables in `.env`:
- `PORT` - Server port (default: 5000)
- `SERVER_URL` - Public URL for the API (auto-detected for Replit)
- `AUTH_DIR` - Directory for WhatsApp sessions (default: ./auth)
- `OPENAI_API_KEY` - OpenAI API key for AI features (optional)
- `MAX_QR_WAIT` - QR code timeout in milliseconds (default: 60000)

### Replit Domain
The server automatically detects the Replit domain using `REPLIT_DEV_DOMAIN` environment variable. If you need to use a custom URL, set `SERVER_URL` in your environment.

## Running the Server
The server is configured to run automatically via the "Server" workflow:
- Command: `node index.js`
- Port: 5000 (publicly accessible)
- Output: Console logs

## API Endpoints

### Session Management
- `POST /api/connect` - Connect WhatsApp session
- `POST /api/disconnect` - Disconnect session
- `GET /api/status/:phone` - Get session status

### Messaging
- `POST /api/messages/send` - Send text message
- `POST /api/messages/send-media` - Send media message
- `POST /api/messages/send-audio` - Send audio message
- `GET /api/messages/:phone` - Get message history

### Contacts & Groups
- `GET /api/contacts/:phone` - Get contacts
- `GET /api/groups/:phone` - Get groups
- `POST /api/groups/create` - Create group
- `POST /api/groups/add-participant` - Add group member

### AI Features
- `POST /api/ai/chat` - Send AI chat message
- `POST /api/ai/image` - Generate AI image
- `POST /api/ai/transcribe` - Transcribe audio

### Status/Stories
- `POST /api/status/text` - Post text status
- `POST /api/status/image` - Post image status

## WebSocket Events
The server uses Socket.IO for real-time updates:
- `connection` - Client connected
- `qr` - QR code for WhatsApp login
- `status` - Connection status updates
- `connect-whatsapp` - Trigger WhatsApp connection
- `logout-whatsapp` - Trigger logout

## Dependencies
All dependencies are managed via npm (see package.json):
- `baileys` - WhatsApp Web API
- `express` - Web framework
- `socket.io` - WebSocket server
- `openai` - OpenAI integration
- `mongoose` - MongoDB integration
- And more...

## Frontend Integration
This backend is designed to work with the ConnexaBot mobile app (Expo/React Native). The frontend should:
1. Connect to the API base URL: `https://<your-repl>.replit.dev/api`
2. Use WebSocket for real-time updates
3. Handle QR code display for WhatsApp authentication

## Recent Changes (2024-10-09)
- ✅ Configured for Replit environment
- ✅ Auto-detection of Replit domain
- ✅ Server listening on 0.0.0.0:5000
- ✅ Workflow configured for automatic startup
- ✅ Media directory added to .gitignore

## Troubleshooting

### Connection Errors
If you see "Connection Terminated" errors:
1. Check WhatsApp session is valid
2. Verify auth directory has proper credentials
3. Try clearing session and reconnecting

### Frontend Can't Connect
1. Ensure SERVER_URL is set to your Replit domain
2. Check CORS is enabled (already configured in index.js)
3. Verify port 5000 is accessible

### Dependencies Issues
Run `npm install` if you see module not found errors.
