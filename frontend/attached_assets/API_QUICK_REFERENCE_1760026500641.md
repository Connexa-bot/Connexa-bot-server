# 🚀 API Quick Reference

## Connection
```javascript
POST /api/connect              // Connect WhatsApp
GET  /api/status/:phone        // Check status
POST /api/logout               // Disconnect
```

## Messaging
```javascript
GET  /api/chats/:phone                    // Get all chats
GET  /api/messages/:phone/:chatId         // Get messages
POST /api/messages/send                   // Send message
POST /api/messages/download               // Download media
POST /api/messages/action                 // Delete/forward/star/react/edit
```

## Contacts & Groups
```javascript
GET  /api/contacts/:phone                 // Get contacts
POST /api/contacts/action                 // Block/unblock
GET  /api/groups/:phone                   // Get groups
POST /api/groups/action                   // Group management
```

## Other Features
```javascript
GET  /api/calls/:phone                    // Call history (view only)
GET  /api/status-updates/:phone           // Get status/stories
POST /api/status/post                     // Post status (text/image/video/audio)
GET  /api/status/contacts/:phone          // Get contacts for status privacy
GET  /api/channels/:phone                 // Channels
GET  /api/communities/:phone              // Communities
GET  /api/profile/:phone                  // User profile
POST /api/profile/action                  // Update profile
POST /api/presence/action                 // Typing indicators
```

## 🤖 AI Automation
```javascript
POST   /api/ai/generate-response          // Generate AI response
POST   /api/ai/auto-reply                 // Smart auto-reply
POST   /api/ai/smart-replies              // Get 3 suggestions
POST   /api/ai/analyze-image              // Analyze image
POST   /api/ai/transcribe-audio           // Voice to text
POST   /api/ai/analyze-sentiment          // Detect sentiment
POST   /api/ai/summarize                  // Summarize chat
GET    /api/ai/chat-history/:phone/:chatId  // Get AI history
DELETE /api/ai/chat-history/:phone/:chatId  // Clear history
```

## Quick Examples

### Auto-Reply
```javascript
const { data } = await autoReplyAI(phone, chatId, message, {
  personality: 'friendly assistant',
  language: 'auto-detect'
});
await sendMessage(phone, chatId, data.reply);
```

### Smart Suggestions
```javascript
const { data } = await getSmartReplies(phone, chatId, {
  lastMessage: 'Want to meet?',
  relationship: 'friend'
});
// Returns: ["Sure! When?", "Sounds good!", "Maybe later?"]
```

### Image Analysis
```javascript
const { data } = await analyzeImageAI(phone, base64Image);
// Returns detailed image description
```

### Post Status Update
```javascript
// Text status
await postTextStatus(phone, 'Hello World!', statusJidList);

// Image status
await postImageStatus(phone, imageUrl, 'Check this out!', statusJidList);

// Video status
await postVideoStatus(phone, videoUrl, 'Amazing!', statusJidList);
```

## ⚠️ Limitations

**Voice/Video Calls**: The Baileys library only supports viewing call history. Making or answering calls is **NOT supported** by the underlying WhatsApp library.

See `frontend-api.js` for complete API documentation.
