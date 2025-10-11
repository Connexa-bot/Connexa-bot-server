# 📱 Frontend Integration Guide

## Quick Start for React Native/Expo App

Your backend is now complete with AI automation! Here's how to integrate it with your frontend.

## Step 1: Copy the API Client

Copy `frontend-api.js` to your frontend project:

```bash
cp frontend-api.js /path/to/your/frontend/src/services/api.js
```

## Step 2: Update Server URL

In `src/services/api.js`, update the server URL:

```javascript
const SERVER_URL = 'https://your-backend-url.com'; // Your deployed backend URL
```

## Step 3: Use in Your React Native App

### Example: Auto-Reply Feature

```javascript
import { autoReplyAI, sendMessage } from './services/api';
import { useEffect } from 'react';

function ChatScreen({ phone, chatId }) {
  useEffect(() => {
    // Listen for incoming messages
    socket.on('message', async (msg) => {
      // Generate AI reply
      const { data } = await autoReplyAI(phone, chatId, msg.text, {
        personality: 'friendly assistant',
        language: 'auto-detect'
      });
      
      // Send the reply
      if (data.shouldSend && data.confidence > 0.8) {
        await sendMessage(phone, chatId, data.reply);
      }
    });
  }, []);
  
  return (
    // Your chat UI
  );
}
```

### Example: Smart Reply Buttons

```javascript
import { getSmartReplies } from './services/api';
import { View, Button } from 'react-native';

function SmartReplyButtons({ phone, chatId, lastMessage }) {
  const [suggestions, setSuggestions] = useState([]);
  
  useEffect(() => {
    loadSuggestions();
  }, [lastMessage]);
  
  const loadSuggestions = async () => {
    const { data } = await getSmartReplies(phone, chatId, {
      lastMessage,
      senderName: 'Friend',
      relationship: 'friend'
    });
    setSuggestions(data.suggestions);
  };
  
  const handleSuggestion = async (text) => {
    await sendMessage(phone, chatId, text);
  };
  
  return (
    <View>
      {suggestions.map((text, i) => (
        <Button key={i} title={text} onPress={() => handleSuggestion(text)} />
      ))}
    </View>
  );
}
```

### Example: Image Analysis

```javascript
import { analyzeImageAI } from './services/api';

async function handleImageMessage(phone, base64Image) {
  const { data } = await analyzeImageAI(
    phone, 
    base64Image, 
    "Describe this image and suggest a response"
  );
  
  // Show AI analysis
  Alert.alert('Image Analysis', data.analysis);
}
```

### Example: Voice Message Transcription

```javascript
import { transcribeAudioAI } from './services/api';

async function handleVoiceMessage(phone, audioPath) {
  const { data } = await transcribeAudioAI(phone, audioPath);
  
  // Display transcription
  setTranscription(data.text);
}
```

## Available AI Functions

All functions are imported from `./services/api`:

### Auto-Reply & Smart Suggestions
- `autoReplyAI(phone, chatId, message, settings)` - Get AI auto-reply
- `getSmartReplies(phone, chatId, context)` - Get 3 smart reply options
- `generateAIResponse(phone, chatId, message, options)` - Generate custom AI response

### Media Analysis
- `analyzeImageAI(phone, base64Image, prompt)` - Analyze images
- `transcribeAudioAI(phone, audioFilePath)` - Transcribe voice messages

### Chat Intelligence
- `analyzeSentimentAI(phone, text)` - Detect message sentiment
- `summarizeConversation(phone, chatId, messageCount)` - Summarize chat history
- `getAIChatHistory(phone, chatId)` - Get AI conversation history
- `clearAIChatHistory(phone, chatId)` - Clear chat history

### WhatsApp Core Functions
- `connectWhatsApp(phone)` - Connect to WhatsApp
- `checkStatus(phone)` - Check connection status
- `getChats(phone)` - Get all chats
- `getMessages(phone, chatId)` - Get message history
- `sendMessage(phone, to, text)` - Send message
- `postTextStatus(phone, text, statusJidList)` - Post text status
- `postImageStatus(phone, image, caption, statusJidList)` - Post image status
- `postVideoStatus(phone, video, caption, statusJidList)` - Post video status
- `postAudioStatus(phone, audio, statusJidList)` - Post audio status
- And many more...

## Complete Feature List

### 🔌 Connection
- Connect/Disconnect WhatsApp
- QR code authentication
- Status monitoring

### 💬 Messaging
- Send/receive messages
- Download media
- Message actions (delete, forward, star, react, edit)

### 👥 Contacts & Groups
- Get contacts
- Block/unblock
- Group management
- Add/remove members

### 📞 Calls & Status
- Call history (view only - making calls not supported)
- View status updates (stories)
- Post status updates (text/image/video/audio)
- Channels
- Communities

### 🤖 AI Automation
- Auto-reply with learning
- Smart reply suggestions
- Image analysis
- Audio transcription
- Sentiment analysis
- Conversation summarization

## Response Format

All API calls return:

**Success:**
```json
{
  "success": true,
  "data": {
    // endpoint-specific data
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Error Handling

```javascript
import { sendMessage } from './services/api';

try {
  const result = await sendMessage(phone, chatId, text);
  if (result.success) {
    console.log('Message sent!');
  }
} catch (error) {
  console.error('Failed to send:', error.message);
}
```

## AI Settings Examples

### Customer Support Bot
```javascript
const settings = {
  personality: 'professional customer service agent',
  language: 'auto-detect',
  autoReplyEnabled: true,
  contextWindow: 10
};
```

### Personal Assistant
```javascript
const settings = {
  personality: 'friendly and helpful personal assistant',
  language: 'English',
  maxTokens: 300,
  includeHistory: true
};
```

### Casual Chat Bot
```javascript
const settings = {
  personality: 'casual and fun friend',
  language: 'auto-detect',
  contextWindow: 5
};
```

## Testing

The backend includes test files you can run:

```bash
# Test basic endpoints
node test-endpoints.js

# Test AI endpoints  
node test-ai-endpoints.js
```

## Documentation Files

- `frontend-api.js` - Complete API reference
- `AI_AUTOMATION_GUIDE.md` - Detailed AI usage guide
- `AI_FEATURES_SUMMARY.md` - AI features overview
- `BACKEND_SUMMARY.md` - Backend implementation summary
- `replit.md` - Project documentation

## ⚠️ Known Limitations

**Voice/Video Calls**: The Baileys library only supports viewing call history. Making or answering calls is **NOT supported** by the underlying WhatsApp library.

## Need Help?

1. Check `AI_AUTOMATION_GUIDE.md` for detailed examples
2. Review `frontend-api.js` for all available functions
3. See `AI_FEATURES_SUMMARY.md` for feature overview

## Next Steps

1. ✅ Copy `frontend-api.js` to your frontend
2. ✅ Update SERVER_URL with your backend URL
3. ✅ Import and use API functions in your components
4. ✅ Test with real WhatsApp connection
5. ✅ Customize AI personality for your use case
6. ✅ Deploy and enjoy! 🚀

---

**Your backend is production-ready with advanced AI automation!**
