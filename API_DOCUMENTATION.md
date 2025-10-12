# ConnexaBot WhatsApp Backend - Complete API Documentation

## Base Configuration

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     process.env.SERVER_URL || 
                     'http://localhost:5000';
```

---

## 1. HEALTH & CONNECTION

### Health Check
- **Endpoint:** `GET /health`
- **Response:** `{ status, uptime, timestamp, serverUrl }`

### API Health Check
- **Endpoint:** `GET /api/health`
- **Response:** `{ status, uptime, timestamp, activeSessions }`

### Connect WhatsApp
- **Endpoint:** `POST /api/connect`
- **Body:** `{ phone }`
- **Response:** `{ qrCode?, linkCode?, message, connected }`

### Check Status
- **Endpoint:** `GET /api/status/:phone`
- **Response:** `{ connected, status, qrCode?, linkCode?, user?, error? }`

### Logout
- **Endpoint:** `POST /api/logout`
- **Body:** `{ phone }`
- **Response:** `{ message }`

### Clear State
- **Endpoint:** `POST /api/clear-state/:phone?fullReset=false`
- **Response:** `{ success, message }`

---

## 2. DATA RETRIEVAL

### Get Chats
- **Endpoint:** `GET /api/chats/:phone`
- **Response:** `{ success, chats: [{id, name, unreadCount, lastMessage, isGroup, isArchived, isPinned, isMuted}], count }`

### Get Messages
- **Endpoint:** `GET /api/messages/:phone/:chatId?limit=50`
- **Response:** `{ success, data: { messages } }`

### Get Contacts
- **Endpoint:** `GET /api/contacts/:phone`
- **Response:** `{ success, contacts }`

### Get Groups
- **Endpoint:** `GET /api/groups/:phone`
- **Response:** `{ groups }`

### Get Call History
- **Endpoint:** `GET /api/calls/:phone`
- **Response:** `{ success, calls: [{id, from, to, timestamp, isVideo, isGroup, status}] }`

### Get Status Updates
- **Endpoint:** `GET /api/status-updates/:phone`
- **Response:** `{ success, statusUpdates, count }`

### Get Channels
- **Endpoint:** `GET /api/channels/:phone`
- **Response:** `{ success, channels }`

### Get Communities
- **Endpoint:** `GET /api/channels/communities/:phone`
- **Response:** `{ success, communities }`

### Get Profile
- **Endpoint:** `GET /api/profile/:phone`
- **Response:** `{ success, data: {name, phone, status, picture} }`

---

## 3. MESSAGING

### Send Text Message
- **Endpoint:** `POST /api/messages/send`
- **Body:** `{ phone, to, text, mentions? }`
- **Response:** `{ success, messageId }`

### Reply to Message
- **Endpoint:** `POST /api/messages/reply`
- **Body:** `{ phone, to, text, quotedMessage }`
- **Response:** `{ success, messageId }`

### Send Image
- **Endpoint:** `POST /api/messages/send-image`
- **Body:** FormData with `image` file OR `{ phone, to, caption, imageUrl }`
- **Response:** `{ success, messageId }`

### Send Video
- **Endpoint:** `POST /api/messages/send-video`
- **Body:** FormData with `video` file OR `{ phone, to, caption, videoUrl, gifPlayback }`
- **Response:** `{ success, messageId }`

### Send Audio/Voice
- **Endpoint:** `POST /api/messages/send-audio`
- **Body:** FormData with `audio` file OR `{ phone, to, audioUrl, ptt }`
- **Response:** `{ success, messageId }`

### Send Document
- **Endpoint:** `POST /api/messages/send-document`
- **Body:** FormData with `document` file OR `{ phone, to, fileName, mimetype, documentUrl }`
- **Response:** `{ success, messageId }`

### Send Location
- **Endpoint:** `POST /api/messages/send-location`
- **Body:** `{ phone, to, latitude, longitude, name?, address? }`
- **Response:** `{ success, messageId }`

### Send Contact
- **Endpoint:** `POST /api/messages/send-contact`
- **Body:** `{ phone, to, contacts: [{displayName, vcard}] }`
- **Response:** `{ success, messageId }`

### Send Poll
- **Endpoint:** `POST /api/messages/send-poll`
- **Body:** `{ phone, to, name, options: [], selectableCount? }`
- **Response:** `{ success, messageId }`

### Send List Message
- **Endpoint:** `POST /api/messages/send-list`
- **Body:** `{ phone, to, text, buttonText, sections: [{title, rows: [{title, rowId, description}]}], footer?, title? }`
- **Response:** `{ success, messageId }`

### Send Broadcast
- **Endpoint:** `POST /api/messages/send-broadcast`
- **Body:** `{ phone, recipients: [], message }`
- **Response:** `{ success, results: [{recipient, success, messageId?}] }`

---

## 4. MESSAGE ACTIONS

### Delete Message
- **Endpoint:** `POST /api/messages/delete`
- **Body:** `{ phone, chatId, messageKey }`
- **Response:** `{ success }`

### Forward Message
- **Endpoint:** `POST /api/messages/forward`
- **Body:** `{ phone, to, message }`
- **Response:** `{ success }`

### React to Message
- **Endpoint:** `POST /api/messages/react`
- **Body:** `{ phone, chatId, messageKey, emoji }`
- **Response:** `{ success }`

### Edit Message
- **Endpoint:** `POST /api/messages/edit`
- **Body:** `{ phone, chatId, messageKey, newText }`
- **Response:** `{ success }`

### Star Message
- **Endpoint:** `POST /api/messages/star`
- **Body:** `{ phone, chatId, messageKey, star }`
- **Response:** `{ success }`

### Mark as Read
- **Endpoint:** `POST /api/messages/read`
- **Body:** `{ phone, messageKey }`
- **Response:** `{ success }`

---

## 5. STATUS/STORY

### Post Text Status
- **Endpoint:** `POST /api/status/post-text`
- **Body:** `{ phone, text, statusJidList?, backgroundColor?, font? }`
- **Response:** `{ success, messageId }`

### Post Image Status
- **Endpoint:** `POST /api/status/post-image`
- **Body:** FormData with `image` file OR `{ phone, caption, statusJidList, imageUrl }`
- **Response:** `{ success, messageId }`

### Post Video Status
- **Endpoint:** `POST /api/status/post-video`
- **Body:** FormData with `video` file OR `{ phone, caption, statusJidList, videoUrl }`
- **Response:** `{ success, messageId }`

### Post Audio Status
- **Endpoint:** `POST /api/status/post-audio`
- **Body:** FormData with `audio` file OR `{ phone, statusJidList, audioUrl }`
- **Response:** `{ success, messageId }`

### Delete Status
- **Endpoint:** `POST /api/status/delete`
- **Body:** `{ phone, statusKey }`
- **Response:** `{ success }`

### View Status
- **Endpoint:** `POST /api/status/view`
- **Body:** `{ phone, statusJid, messageKeys }`
- **Response:** `{ success }`

### Get Privacy Settings
- **Endpoint:** `GET /api/status/privacy/:phone`
- **Response:** `{ success, privacy }`

---

## 6. CHAT ACTIONS

### Archive Chat
- **Endpoint:** `POST /api/chats/archive`
- **Body:** `{ phone, chatId, archive }`
- **Response:** `{ success }`

### Pin Chat
- **Endpoint:** `POST /api/chats/pin`
- **Body:** `{ phone, chatId, pin }`
- **Response:** `{ success }`

### Mute Chat
- **Endpoint:** `POST /api/chats/mute`
- **Body:** `{ phone, chatId, duration }` (duration in ms, null to unmute)
- **Response:** `{ success }`

### Mark as Read
- **Endpoint:** `POST /api/chats/mark-read`
- **Body:** `{ phone, chatId }`
- **Response:** `{ success }`

### Mark as Unread
- **Endpoint:** `POST /api/chats/mark-unread`
- **Body:** `{ phone, chatId }`
- **Response:** `{ success }`

### Delete Chat
- **Endpoint:** `POST /api/chats/delete`
- **Body:** `{ phone, chatId }`
- **Response:** `{ success }`

### Clear Chat
- **Endpoint:** `POST /api/chats/clear`
- **Body:** `{ phone, chatId }`
- **Response:** `{ success }`

### Get Labels
- **Endpoint:** `GET /api/chats/labels/:phone`
- **Response:** `{ success, labels }`

### Add Label
- **Endpoint:** `POST /api/chats/label/add`
- **Body:** `{ phone, chatId, labelId }`
- **Response:** `{ success }`

### Remove Label
- **Endpoint:** `POST /api/chats/label/remove`
- **Body:** `{ phone, chatId, labelId }`
- **Response:** `{ success }`

---

## 7. GROUP MANAGEMENT

### List Groups
- **Endpoint:** `GET /api/groups/:phone`
- **Response:** `{ groups }`

### Group Actions
- **Endpoint:** `POST /api/groups/action`
- **Body:** Varies by action type
- **Actions:**
  - `create`: `{ phone, action: "create", name, participants }`
  - `add`: `{ phone, action: "add", groupId, participants }`
  - `remove`: `{ phone, action: "remove", groupId, participants }`
  - `promote`: `{ phone, action: "promote", groupId, participants }`
  - `demote`: `{ phone, action: "demote", groupId, participants }`
  - `updateSubject`: `{ phone, action: "updateSubject", groupId, subject }`
  - `updateDescription`: `{ phone, action: "updateDescription", groupId, description }`
  - `updateSettings`: `{ phone, action: "updateSettings", groupId, setting }`
  - `leave`: `{ phone, action: "leave", groupId }`
  - `getInviteCode`: `{ phone, action: "getInviteCode", groupId }`
  - `revokeInviteCode`: `{ phone, action: "revokeInviteCode", groupId }`
  - `acceptInvite`: `{ phone, action: "acceptInvite", inviteCode }`
  - `getMetadata`: `{ phone, action: "getMetadata", groupId }`

---

## 8. AI AUTOMATION

### Smart Reply
- **Endpoint:** `POST /api/ai/smart-reply`
- **Body:** `{ phone, chatId, lastMessage, senderName?, relationship? }`
- **Response:** `{ success, suggestions: [] }`

### Auto Reply
- **Endpoint:** `POST /api/ai/auto-reply`
- **Body:** `{ phone, chatId, to?, message, settings? }`
- **Response:** `{ success, reply, sent }`

### Generate AI Response
- **Endpoint:** `POST /api/ai/generate`
- **Body:** `{ phone, chatId, userMessage, systemPrompt?, maxTokens?, includeHistory? }`
- **Response:** `{ success, reply, usage, model }`

### Analyze Sentiment
- **Endpoint:** `POST /api/ai/sentiment`
- **Body:** `{ phone, text }`
- **Response:** `{ success, sentiment: {sentiment, score, emotions} }`

### Analyze Image
- **Endpoint:** `POST /api/ai/analyze-image`
- **Body:** `{ phone, base64Image, prompt? }`
- **Response:** `{ success, analysis }`

### Transcribe Audio
- **Endpoint:** `POST /api/ai/transcribe`
- **Body:** `{ phone, audioFilePath }`
- **Response:** `{ success, text, duration }`

### Summarize Conversation
- **Endpoint:** `POST /api/ai/summarize`
- **Body:** `{ phone, chatId, messageCount? }`
- **Response:** `{ success, summary }`

### Translate Text
- **Endpoint:** `POST /api/ai/translate`
- **Body:** `{ phone, text, targetLang }`
- **Response:** `{ success, translation }`

### Smart Compose
- **Endpoint:** `POST /api/ai/compose`
- **Body:** `{ phone, chatId, context, tone? }`
- **Response:** `{ success, composed }`

### Improve Message
- **Endpoint:** `POST /api/ai/improve`
- **Body:** `{ phone, text, improvements? }`
- **Response:** `{ success, improved }`

### Content Moderation
- **Endpoint:** `POST /api/ai/moderate`
- **Body:** `{ phone, text }`
- **Response:** `{ success, moderation: {safe, reason, categories} }`

### Batch Analyze
- **Endpoint:** `POST /api/ai/batch-analyze`
- **Body:** `{ phone, messages: [{id, text}] }`
- **Response:** `{ success, results: [{messageId, sentiment, success}] }`

### Get Chat History
- **Endpoint:** `GET /api/ai/history/:phone/:chatId`
- **Response:** `{ success, history }`

### Clear Chat History
- **Endpoint:** `POST /api/ai/history/clear`
- **Body:** `{ phone, chatId? }`
- **Response:** `{ success, cleared }`

---

## 9. CHANNELS & CALLS

### Get Channels
- **Endpoint:** `GET /api/channels/:phone`
- **Response:** `{ success, channels }`

### Follow Channel
- **Endpoint:** `POST /api/channels/follow`
- **Body:** `{ phone, channelJid }`
- **Response:** `{ success }`

### Unfollow Channel
- **Endpoint:** `POST /api/channels/unfollow`
- **Body:** `{ phone, channelJid }`
- **Response:** `{ success }`

### Get Call History
- **Endpoint:** `GET /api/calls/:phone`
- **Response:** `{ success, calls }`

### Make Call (Not Supported)
- **Endpoint:** `POST /api/calls/make`
- **Body:** `{ phone, to, isVideo? }`
- **Response:** `{ success: false, message }`

---

## Usage Example

```javascript
// Helper function to make API calls
const callAPI = async (endpoint) => {
  const response = await fetch(endpoint.url, {
    method: endpoint.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: endpoint.body ? JSON.stringify(endpoint.body) : undefined
  });
  
  return await response.json();
};

// Example: Connect to WhatsApp
const connect = await callAPI({
  url: `${API_BASE_URL}/api/connect`,
  method: 'POST',
  body: { phone: '2349154347487' }
});

// Example: Send message
const send = await callAPI({
  url: `${API_BASE_URL}/api/messages/send`,
  method: 'POST',
  body: { phone: '2349154347487', to: '2348012345678@s.whatsapp.net', text: 'Hello!' }
});

// Example: Generate smart reply
const smartReply = await callAPI({
  url: `${API_BASE_URL}/api/ai/smart-reply`,
  method: 'POST',
  body: { phone: '2349154347487', chatId: 'chat123', lastMessage: 'How are you?' }
});
```

---

## Notes

- All endpoints require an active WhatsApp connection (except health checks and connect)
- Phone numbers should be in format: `2349154347487` (no +, spaces, or dashes)
- JIDs (WhatsApp IDs) format: `2349154347487@s.whatsapp.net` for users, `123456789@g.us` for groups
- File uploads use multipart/form-data
- Duration values are in milliseconds
- AI features require `OPENAI_API_KEY` environment variable

---

