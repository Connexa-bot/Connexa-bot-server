# ConnexaBot WhatsApp Backend

## Overview
ConnexaBot is a comprehensive WhatsApp backend server built with Baileys library, providing a complete REST API for WhatsApp automation and AI-powered features.

## Current State
- ✅ Server running on port 3000  
- ✅ MongoDB connected successfully
- ✅ Health endpoints functional
- ✅ 28 endpoint sections structured and organized
- 🔄 Helper functions partially updated (in progress)
- 🔄 Full endpoint testing pending

## Recent Changes (October 15, 2025)
1. **Restructured API Routes**: Organized routes/api.js into 28 clear sections matching Baileys capabilities
2. **Fixed Workflow**: Configured backend to run on port 3000 (port 5000 reserved for frontend)
3. **Added Missing Helpers**: Added getChats, getChatById, getArchivedChats, searchChats to chatActions.js
4. **Fixed Contact Actions**: Added all missing contact helper functions with proper phone parameter

## Project Architecture

### Technology Stack
- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **WebSocket**: Socket.IO
- **WhatsApp Library**: Baileys v6.7.20
- **Database**: MongoDB (Mongoose)
- **AI Integration**: OpenAI (optional)

### Directory Structure
```
├── routes/
│   ├── api.js          # Main API router with 28 sections
│   ├── chats.js        # Chat-specific routes
│   ├── contacts.js     # Contact routes
│   ├── groups.js       # Group management routes
│   ├── messages.js     # Message handling routes
│   ├── status.js       # Status/Story routes
│   ├── channels.js     # Channel routes
│   ├── calls.js        # Call history routes
│   ├── profile.js      # Profile management routes
│   ├── privacy.js      # Privacy settings routes
│   └── ai.js           # AI automation routes
├── helpers/
│   ├── whatsapp.js     # Core WhatsApp connection management
│   ├── chatActions.js  # Chat-related actions
│   ├── messageActions.js # Message sending/handling
│   ├── groupActions.js # Group operations
│   ├── contactActions.js # Contact management
│   ├── statusActions.js # Status/Story operations
│   ├── presenceActions.js # Typing/presence updates
│   ├── profileActions.js # Profile updates
│   ├── channelActions.js # Channel operations
│   ├── callActions.js  # Call management
│   └── fetchers.js     # Data fetching utilities
├── controllers/        # Business logic controllers
├── models/            # Mongoose data models
├── config/            # Configuration files
└── utils/             # Utility functions
```

## API Endpoint Sections

The API is organized into 28 comprehensive sections:

### Section 0: Health & Connection
- GET `/health` - Server health check
- GET `/api/health` - API health check
- POST `/api/connect` - Connect WhatsApp (generates QR/link code)
- GET `/api/status/:phone` - Check connection status
- POST `/api/logout` - Logout and clear session
- POST `/api/clear-state/:phone` - Clear session state

### Section 1: Chat List Screen
- GET `/api/chats/:phone` - Get all chats
- GET `/api/chats/:phone/:chatId` - Get specific chat
- POST `/api/chats/archive` - Archive/unarchive chat
- POST `/api/chats/pin` - Pin/unpin chat
- POST `/api/chats/delete` - Delete chat
- POST `/api/chats/mark-read` - Mark chat as read
- POST `/api/chats/mark-unread` - Mark chat as unread
- POST `/api/chats/mute` - Mute/unmute chat
- POST `/api/chats/clear` - Clear chat history
- GET `/api/chats/archived/:phone` - Get archived chats
- GET `/api/chats/search/:phone` - Search chats

### Section 2: Contact Profile Screen  
- GET `/api/contacts/:phone` - Get all contacts
- GET `/api/contacts/:phone/:contactId` - Get specific contact
- GET `/api/contacts/:phone/:contactId/picture` - Get profile picture
- GET `/api/contacts/:phone/:contactId/status` - Get contact status/about
- POST `/api/contacts/check-exists` - Check if contact exists on WhatsApp
- POST `/api/contacts/block` - Block contact
- POST `/api/contacts/unblock` - Unblock contact
- GET `/api/contacts/:phone/:contactId/business-profile` - Get business profile

### Section 3: Status/Updates Screen
- GET `/api/status/updates/:phone` - Get all status updates
- POST `/api/status/post-text` - Post text status
- POST `/api/status/post-image` - Post image status
- POST `/api/status/post-video` - Post video status
- POST `/api/status/delete` - Delete status
- POST `/api/status/view` - Mark status as viewed
- GET `/api/status/privacy/:phone` - Get status privacy settings

### Section 4-18: [Additional sections documented in routes/api.js]
- Groups Management
- Channels
- Communities  
- Messaging (text, media, location, contacts, polls, lists)
- Message Actions (react, edit, delete, forward, star)
- Calls
- Presence & Typing
- Profile Settings
- Privacy Settings
- Starred Messages
- Media Gallery
- Broadcast Lists
- Search
- Multi-Device Management
- Business Features

## Environment Variables

Required variables (set in .env or secrets):
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string (configured)
- `NODE_ENV` - Environment (development/production)
- `AUTH_DIR` - Directory for WhatsApp auth sessions (default: ./auth)
- `MEDIA_DIR` - Directory for media files (default: ./media)
- `OPENAI_API_KEY` - OpenAI API key for AI features (optional)

## Known Issues & TODOs

### Critical (Must Fix)
1. **Parameter Mismatch**: Many helper function calls in routes/api.js still pass `validation.session.sock` instead of `phone` parameter
   - Fixed: Chat actions (archive, pin, delete, mute, mark-read, mark-unread, clear)
   - Remaining: Status actions, group actions, message actions, presence actions, profile actions
   
2. **Missing Helper Functions**: Several functions called in api.js don't exist yet in helper files
   - Added: getChats, getChatById, getArchivedChats, searchChats (chatActions)
   - Added: getContact, getProfilePicture, getStatus, checkIfContactExists, blockContact, unblockContact, getBusinessProfile (contactActions)
   - Still needed: Various status, presence, profile, and channel helper functions

### Medium Priority  
3. **Update API.js Reference**: The API.js file needs updating to match the new 28-section structure
4. **Update Test Script**: test-endpoints.sh needs comprehensive updates to test all sections
5. **Add Missing Endpoints**: Some Baileys features may not have endpoints yet

### Low Priority
6. **OpenAI Integration**: AI features need OpenAI API key to function
7. **Business Features**: Business catalog and quick replies have limited support
8. **Documentation**: Add OpenAPI/Swagger documentation

## Testing

### Manual Testing
```bash
# Health check
curl http://localhost:3000/health
curl http://localhost:3000/api/health

# Connect WhatsApp (returns QR/link code)
curl -X POST http://localhost:3000/api/connect \
  -H "Content-Type: application/json" \
  -d '{"phone":"YOUR_PHONE_NUMBER"}'

# Check status
curl http://localhost:3000/api/status/YOUR_PHONE_NUMBER
```

### Automated Testing
Run the comprehensive test suite:
```bash
chmod +x test-endpoints.sh
./test-endpoints.sh
```

## Deployment

### Development
Server runs automatically via Replit workflow on port 3000.

### Production (TODO)
1. Configure deployment settings using deploy_config_tool
2. Set deployment target: "vm" (for stateful WhatsApp sessions)
3. Ensure MongoDB connection is production-ready
4. Set proper environment variables

## AI Automation Features

The backend supports AI-powered automation:
- Smart reply suggestions
- Auto-reply with context
- Sentiment analysis
- Message translation
- Content moderation
- Image analysis (vision)
- Audio transcription
- Conversation summarization
- Message composition and improvement

**Note**: AI features require `OPENAI_API_KEY` to be configured.

## User Preferences

*Document user preferences and coding style here as they emerge*

## Next Steps

1. **Immediate**: Fix remaining parameter mismatches in routes/api.js (status, group, message, presence, profile actions)
2. **Short-term**: Add all missing helper functions for complete endpoint coverage
3. **Medium-term**: Update API.js reference file and test-endpoints.sh
4. **Before Launch**: Comprehensive endpoint testing and deployment configuration
