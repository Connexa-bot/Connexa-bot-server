
# ConnexaBot WhatsApp Backend - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Installation](#setup--installation)
4. [Environment Variables](#environment-variables)
5. [Core Components](#core-components)
6. [API Reference](#api-reference)
7. [WebSocket Events](#websocket-events)
8. [Session Management](#session-management)
9. [AI Integration](#ai-integration)
10. [File Structure](#file-structure)
11. [Error Handling](#error-handling)
12. [Deployment](#deployment)

---

## 1. Overview

ConnexaBot is a comprehensive WhatsApp automation backend built on top of Baileys library. It provides a RESTful API and WebSocket interface for managing WhatsApp connections, messaging, AI automation, and more.

### Key Features
- ✅ Multi-session WhatsApp connection management
- ✅ Complete messaging API (text, media, polls, lists, etc.)
- ✅ Group and contact management
- ✅ Status/Story posting and viewing
- ✅ AI-powered features (OpenAI GPT-5 integration)
- ✅ Privacy and security controls
- ✅ Channel and community support
- ✅ Real-time WebSocket updates
- ✅ Persistent session storage

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **WhatsApp Library:** Baileys
- **WebSocket:** Socket.io
- **AI:** OpenAI GPT-5
- **Storage:** File-based (auth sessions) + In-memory store

---

## 2. Architecture

### System Architecture
```
┌─────────────┐
│   Client    │
│  (Frontend) │
└─────┬───────┘
      │
      ├─── HTTP/REST API
      │
      ├─── WebSocket (Socket.io)
      │
┌─────▼────────────────────────┐
│   Express Server (index.js)  │
│  - Routes                     │
│  - Middleware                 │
│  - WebSocket Handler          │
└─────┬────────────────────────┘
      │
      ├─── Routes Layer
      │    ├── /api (api.js)
      │    ├── /api/messages
      │    ├── /api/chats
      │    ├── /api/groups
      │    ├── /api/ai
      │    └── ... (13 route files)
      │
      ├─── Controllers Layer
      │    ├── chats.js
      │    ├── messages.js
      │    ├── ai.js
      │    └── ... (8 controller files)
      │
      ├─── Helpers Layer
      │    ├── whatsapp.js (core)
      │    ├── aiService.js
      │    ├── fetchers.js
      │    └── ... (12 helper files)
      │
      ├─── Session Manager
      │    ├── Multi-session support
      │    ├── QR code generation
      │    └── State persistence
      │
      └─── Baileys Library
           └── WhatsApp Web Protocol
```

### Request Flow
1. **Client Request** → HTTP/WebSocket
2. **Route Handler** → Validates phone number
3. **Session Check** → Ensures active connection
4. **Controller** → Business logic
5. **Helper/Action** → Baileys operations
6. **Response** → JSON/WebSocket event

---

## 3. Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional, for AI features)

### Installation Steps

```bash
# Clone repository
git clone <your-repo-url>
cd connexabot-backend

# Install dependencies
npm install

# Create directories
mkdir -p auth media

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start server
npm start
```

### Quick Start
```bash
# Development mode
npm run dev

# Production mode
npm start

# Run tests
bash test-endpoints.sh
```

---

## 4. Environment Variables

### Required Variables
```env
# Server Configuration
PORT=3000                    # Server port
HOST=0.0.0.0                # Bind address
NODE_ENV=production         # Environment mode

# Storage Paths
AUTH_DIR=./auth             # Session storage
MEDIA_DIR=./media           # Media files

# Connection Settings
MAX_QR_ATTEMPTS=3           # QR retry limit
CONNECTION_TIMEOUT_MS=60000 # Connection timeout

# AI Features (Optional)
OPENAI_API_KEY=sk-...       # OpenAI API key
```

### Auto-detected Variables
- `REPLIT_DEV_DOMAIN` - Auto-set on Replit
- `RENDER` - Auto-set on Render
- `SERVER_URL` - Manual override for base URL

---

## 5. Core Components

### 5.1 Session Manager (`helpers/whatsapp.js`)

Manages WhatsApp connections and sessions.

```javascript
// Session structure
{
  phone: "2349154347487",
  sock: WASocket,              // Baileys socket
  store: makeInMemoryStore(), // Message/chat store
  connected: true/false,
  qrCode: "base64_qr_string",
  linkCode: "XXXX-XXXX-XXXX",
  error: null
}
```

**Key Functions:**
- `startBot(phone, broadcast)` - Initialize connection
- `clearSession(phone)` - Remove session
- `logoutFromWhatsApp(sock, phone)` - Logout
- `clearSessionState(phone, fullReset)` - Clear state

### 5.2 Routes Layer

**13 Route Files:**
1. `routes/api.js` - Core API (connect, status, chats, etc.)
2. `routes/messages.js` - Message operations
3. `routes/chats.js` - Chat management
4. `routes/groups.js` - Group operations
5. `routes/contacts.js` - Contact management
6. `routes/presence.js` - Presence updates
7. `routes/profile.js` - Profile management
8. `routes/ai.js` - AI features
9. `routes/status.js` - Status/Story
10. `routes/channels.js` - Channel operations
11. `routes/calls.js` - Call history
12. `routes/privacy.js` - Privacy settings
13. `routes/websocket.js` - WebSocket handlers

### 5.3 Controllers Layer

**8 Controller Files:**
- `controllers/chats.js` - Chat logic
- `controllers/messages.js` - Message handling
- `controllers/groups.js` - Group logic
- `controllers/contacts.js` - Contact operations
- `controllers/presence.js` - Presence management
- `controllers/profile.js` - Profile updates
- `controllers/status.js` - Status operations
- `controllers/ai.js` - AI orchestration

### 5.4 Helpers Layer

**12 Helper Files:**
- `helpers/whatsapp.js` - Core WhatsApp functionality
- `helpers/aiService.js` - OpenAI integration
- `helpers/messageActions.js` - Message operations
- `helpers/chatActions.js` - Chat operations
- `helpers/groupActions.js` - Group operations
- `helpers/contactActions.js` - Contact operations
- `helpers/presenceActions.js` - Presence updates
- `helpers/profileActions.js` - Profile updates
- `helpers/statusActions.js` - Status operations
- `helpers/channelActions.js` - Channel operations
- `helpers/callActions.js` - Call operations
- `helpers/fetchers.js` - Data retrieval
- `helpers/file.js` - File handling
- `helpers/sessionManager.js` - Session utilities

---

## 6. API Reference

### Base URL
```
Production: https://7291a9b7-7686-42b0-ba38-4b0639ea71ed-00-22vcaa5x8ip3y.kirk.replit.dev
Development: http://localhost:3000
```

### 6.1 Connection & Session

#### Connect WhatsApp
```http
POST /api/connect
Content-Type: application/json

{
  "phone": "2349154347487"
}

Response:
{
  "success": true,
  "qrCode": "data:image/png;base64,...",
  "linkCode": "ABCD-EFGH-IJKL",
  "message": "Scan QR code or use link code",
  "connected": false
}
```

#### Check Status
```http
GET /api/status/:phone

Response:
{
  "connected": true,
  "status": "connected",
  "authenticated": true,
  "ready": true,
  "user": {
    "id": "2349154347487@s.whatsapp.net",
    "name": "User Name"
  }
}
```

#### Logout
```http
POST /api/logout
{
  "phone": "2349154347487"
}
```

#### Clear State
```http
POST /api/clear-state/:phone?fullReset=true
```

### 6.2 Messaging

#### Send Text Message
```http
POST /api/messages/send
{
  "phone": "2349154347487",
  "to": "2348012345678@s.whatsapp.net",
  "text": "Hello World!",
  "mentions": []
}
```

#### Send Image
```http
POST /api/messages/send-image
{
  "phone": "2349154347487",
  "to": "2348012345678@s.whatsapp.net",
  "imageUrl": "https://example.com/image.jpg",
  "caption": "Check this out!"
}
```

#### Send Poll
```http
POST /api/messages/send-poll
{
  "phone": "2349154347487",
  "to": "2348012345678@s.whatsapp.net",
  "name": "Favorite Color?",
  "options": ["Red", "Blue", "Green"],
  "selectableCount": 1
}
```

#### React to Message
```http
POST /api/messages/react
{
  "phone": "2349154347487",
  "chatId": "2348012345678@s.whatsapp.net",
  "messageKey": {...},
  "emoji": "👍"
}
```

### 6.3 Chat Management

#### Get Chats
```http
GET /api/chats/:phone

Response:
{
  "success": true,
  "chats": [
    {
      "id": "2348012345678@s.whatsapp.net",
      "name": "Contact Name",
      "unreadCount": 5,
      "lastMessage": {...},
      "isGroup": false,
      "isArchived": false,
      "isPinned": true,
      "isMuted": false
    }
  ],
  "count": 50
}
```

#### Archive Chat
```http
POST /api/chats/archive
{
  "phone": "2349154347487",
  "chatId": "2348012345678@s.whatsapp.net",
  "archive": true
}
```

#### Pin Chat
```http
POST /api/chats/pin
{
  "phone": "2349154347487",
  "chatId": "2348012345678@s.whatsapp.net",
  "pin": true
}
```

#### Mute Chat
```http
POST /api/chats/mute
{
  "phone": "2349154347487",
  "chatId": "2348012345678@s.whatsapp.net",
  "duration": 28800000  // 8 hours in ms, null to unmute
}
```

### 6.4 Group Management

#### Get Groups
```http
GET /api/groups/:phone
```

#### Create Group
```http
POST /api/groups/action
{
  "phone": "2349154347487",
  "action": "create",
  "name": "My Group",
  "participants": ["2348012345678@s.whatsapp.net"]
}
```

#### Add Participants
```http
POST /api/groups/action
{
  "phone": "2349154347487",
  "action": "add",
  "groupId": "123456789@g.us",
  "participants": ["2348012345678@s.whatsapp.net"]
}
```

### 6.5 AI Features

#### Smart Reply
```http
POST /api/ai/smart-reply
{
  "phone": "2349154347487",
  "chatId": "2348012345678@s.whatsapp.net",
  "lastMessage": "How are you?",
  "senderName": "John",
  "relationship": "friend"
}

Response:
{
  "success": true,
  "suggestions": [
    "I'm doing great! How about you?",
    "Pretty good, thanks for asking!",
    "All good here! What's up?"
  ]
}
```

#### Generate AI Response
```http
POST /api/ai/generate
{
  "phone": "2349154347487",
  "chatId": "2348012345678@s.whatsapp.net",
  "userMessage": "Tell me a joke",
  "includeHistory": true,
  "maxTokens": 500
}
```

#### Sentiment Analysis
```http
POST /api/ai/sentiment
{
  "phone": "2349154347487",
  "text": "I love this product!"
}

Response:
{
  "success": true,
  "sentiment": {
    "sentiment": "positive",
    "score": 0.95,
    "emotions": ["joy", "excitement"]
  }
}
```

#### Translate Text
```http
POST /api/ai/translate
{
  "phone": "2349154347487",
  "text": "Hello world",
  "targetLang": "Spanish"
}
```

### 6.6 Privacy & Security

#### Get Privacy Settings
```http
GET /api/privacy/settings/:phone
```

#### Update Privacy Settings
```http
POST /api/privacy/settings/update
{
  "phone": "2349154347487",
  "setting": "readreceipts",  // Options: readreceipts, profile, status, online, last, groupadd, calladd
  "value": "contacts"         // Options: all, contacts, contact_blacklist, none
}
```

#### Block Contact
```http
POST /api/privacy/block
{
  "phone": "2349154347487",
  "jid": "2348012345678@s.whatsapp.net"
}
```

#### Set Disappearing Messages
```http
POST /api/privacy/disappearing-messages
{
  "phone": "2349154347487",
  "chatId": "2348012345678@s.whatsapp.net",
  "duration": 86400  // 24 hours in seconds, 0 to disable
}
```

---

## 7. WebSocket Events

### Client → Server Events

#### Connect WhatsApp
```javascript
socket.emit('connect-whatsapp', '2349154347487');
```

#### Logout WhatsApp
```javascript
socket.emit('logout-whatsapp', '2349154347487');
```

### Server → Client Events

#### Connection Status
```javascript
socket.on('status', (data) => {
  // data: { phone, status: 'connecting'|'connected'|'disconnected', error? }
});
```

#### QR Code Update
```javascript
socket.on('qr', (data) => {
  // data: { phone, qrCode: 'base64...', linkCode: 'XXXX-XXXX' }
});
```

#### New Message
```javascript
socket.on('message', (data) => {
  // data: { phone, message: {...} }
});
```

---

## 8. Session Management

### Session Lifecycle
1. **Initialize** - `startBot()` creates session
2. **Authenticate** - QR/Link code scan
3. **Connected** - Active WhatsApp connection
4. **Persist** - Auth saved to `./auth/{phone}/`
5. **Reconnect** - Auto-reconnect on disconnect
6. **Logout** - Manual disconnect and cleanup

### Session Storage
```
./auth/
  └── 2349154347487/
      ├── creds.json          # Authentication credentials
      └── app-state-sync-*.json  # Sync state
```

### Multi-Session Support
- Each phone number has isolated session
- Sessions stored in Map: `sessions.get(phone)`
- Concurrent connections supported

---

## 9. AI Integration

### OpenAI Configuration
```javascript
// helpers/aiService.js
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Default model: gpt-4o (GPT-5)
```

### AI Features Overview

| Feature | Endpoint | Description |
|---------|----------|-------------|
| Smart Reply | `/api/ai/smart-reply` | Generate reply suggestions |
| Auto Reply | `/api/ai/auto-reply` | Automated responses |
| Chat Generation | `/api/ai/generate` | Conversational AI |
| Sentiment Analysis | `/api/ai/sentiment` | Emotion detection |
| Image Analysis | `/api/ai/analyze-image` | Vision AI |
| Audio Transcription | `/api/ai/transcribe` | Speech-to-text |
| Translation | `/api/ai/translate` | Language translation |
| Text Improvement | `/api/ai/improve` | Grammar/clarity |
| Content Moderation | `/api/ai/moderate` | Safety checks |
| Summarization | `/api/ai/summarize` | Conversation summary |
| Smart Compose | `/api/ai/compose` | Message composition |

### Chat History Management
- Stored per chat: `chatHistory.get(chatId)`
- Limited to last 20 messages
- System prompts for context
- Clearable via API

---

## 10. File Structure

```
connexabot-backend/
├── index.js                 # Main server entry
├── config.js               # Configuration
├── package.json            # Dependencies
│
├── routes/                 # API Routes (13 files)
│   ├── api.js             # Core API
│   ├── messages.js        # Messaging
│   ├── chats.js           # Chats
│   ├── groups.js          # Groups
│   ├── contacts.js        # Contacts
│   ├── presence.js        # Presence
│   ├── profile.js         # Profile
│   ├── ai.js              # AI Features
│   ├── status.js          # Status/Story
│   ├── channels.js        # Channels
│   ├── calls.js           # Calls
│   ├── privacy.js         # Privacy
│   └── websocket.js       # WebSocket
│
├── controllers/           # Business Logic (8 files)
│   ├── chats.js
│   ├── messages.js
│   ├── groups.js
│   ├── contacts.js
│   ├── presence.js
│   ├── profile.js
│   ├── status.js
│   └── ai.js
│
├── helpers/               # Core Helpers (14 files)
│   ├── whatsapp.js       # Main WhatsApp logic
│   ├── aiService.js      # OpenAI integration
│   ├── messageActions.js
│   ├── chatActions.js
│   ├── groupActions.js
│   ├── contactActions.js
│   ├── presenceActions.js
│   ├── profileActions.js
│   ├── statusActions.js
│   ├── channelActions.js
│   ├── callActions.js
│   ├── fetchers.js       # Data retrieval
│   ├── file.js           # File operations
│   └── sessionManager.js
│
├── utils/                # Utilities
│   ├── api.js           # API documentation
│   └── gracefulShutdown.js
│
├── auth/                # Session storage (gitignored)
├── media/               # Media files (gitignored)
│
├── API.js               # Frontend API client
├── API_DOCUMENTATION.md # API reference
├── BACKEND_DOCUMENTATION.md # This file
└── test-endpoints.sh    # Testing script
```

---

## 11. Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `NOT_CONNECTED` - No active WhatsApp session
- `INVALID_PHONE` - Invalid phone number format
- `SESSION_NOT_FOUND` - Session doesn't exist
- `TIMEOUT` - Connection timeout
- `AUTH_FAILED` - Authentication failed
- `RATE_LIMIT` - Too many requests
- `AI_ERROR` - AI service error

### Error Handling Pattern
```javascript
try {
  // Operation
} catch (error) {
  console.error('Operation failed:', error);
  res.status(500).json({
    success: false,
    error: error.message
  });
}
```

---

## 12. Deployment

### Deployment on Replit

#### Using Autoscale Deployment
1. Open Deployments tab
2. Select "Autoscale" type
3. Configure:
   - Machine Power: 0.5 vCPU / 1 GB RAM
   - Max instances: 1-10
4. Set run command: `PORT=3000 node index.js`
5. Click "Deploy"

#### Environment Setup
```bash
# Set in Replit Secrets
OPENAI_API_KEY=sk-...
NODE_ENV=production
```

#### Accessing Deployment
- URL: Auto-detected from `REPLIT_DEV_DOMAIN`
- API Base: `https://{domain}/api`
- Health Check: `https://{domain}/health`

### Production Checklist
- [ ] Set `OPENAI_API_KEY` in secrets
- [ ] Set `NODE_ENV=production`
- [ ] Configure max instances based on traffic
- [ ] Enable logging/monitoring
- [ ] Set up error tracking
- [ ] Configure CORS for frontend domain
- [ ] Test all critical endpoints
- [ ] Set up backup/recovery for auth sessions

### Monitoring
```bash
# Health check
curl https://your-domain/health

# API health
curl https://your-domain/api/health

# Active sessions
curl https://your-domain/api/health | jq .activeSessions
```

---

## 13. Testing

### Running Test Suite
```bash
# Use current deployment URL
bash test-endpoints.sh

# Custom URL and phone
BASE_URL=https://your-domain PHONE=1234567890 bash test-endpoints.sh
```

### Test Coverage
- ✅ Health & Connection (4 tests)
- ✅ Data Retrieval (8 tests)
- ✅ Messaging (8 tests)
- ✅ Message Actions (3 tests)
- ✅ Chat Actions (7 tests)
- ✅ Status/Story (2 tests)
- ✅ Group Management (2 tests)
- ✅ AI Features (8 tests)
- ✅ Channels & Calls (3 tests)
- ✅ Presence & Profile (3 tests)
- ✅ Privacy & Security (5 tests)
- ✅ Advanced Features (2 tests)

**Total: 55+ endpoint tests**

---

## 14. Best Practices

### Performance
- Use connection pooling for database
- Implement rate limiting
- Cache frequently accessed data
- Optimize media handling
- Use lazy loading for heavy operations

### Security
- Validate all inputs
- Sanitize user data
- Use HTTPS in production
- Rotate API keys regularly
- Implement request signing
- Rate limit AI endpoints

### Scalability
- Horizontal scaling with Autoscale
- Stateless session design
- External state storage (PostgreSQL)
- Message queuing for high load
- CDN for media files

### Reliability
- Graceful error handling
- Auto-reconnect on disconnect
- Health checks and monitoring
- Backup auth sessions
- Log aggregation

---

## 15. FAQ

**Q: How many sessions can run simultaneously?**
A: Unlimited. Each phone number has an isolated session.

**Q: What happens if connection drops?**
A: Auto-reconnect attempts are made. Session persists in auth folder.

**Q: How to handle media files?**
A: Upload to cloud storage (S3, Cloudinary) and pass URLs to API.

**Q: Is AI required?**
A: No. AI features are optional. Set `OPENAI_API_KEY` to enable.

**Q: How to scale for high traffic?**
A: Use Autoscale deployment with max instances. Consider message queues.

**Q: Can I use this commercially?**
A: Check Baileys and WhatsApp ToS. Use at your own risk.

---

## 16. Support & Resources

### Documentation
- Baileys: https://github.com/WhiskeySockets/Baileys
- OpenAI: https://platform.openai.com/docs
- Socket.io: https://socket.io/docs

### Community
- GitHub Issues: [Your repo]
- Discord: [Your server]
- Email: [Your email]

### Contributing
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

**Last Updated:** 2024
**Version:** 1.0.0
**Author:** ConnexaBot Team
