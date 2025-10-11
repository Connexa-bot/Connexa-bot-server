# 🤖 AI Automation Guide for WhatsApp Backend

## Overview

Your WhatsApp backend now includes advanced AI automation powered by OpenAI's GPT-5. The AI can handle everything a user would do in the frontend, with intelligent responses that learn from chat history.

## 🎯 AI Capabilities

### 1. **Smart Auto-Replies** 
- Automatically respond to messages with context-aware replies
- Learns from conversation history
- Maintains natural conversation flow
- Customizable personality and language

### 2. **Intelligent Chat Responses**
- Generate human-like responses to any message
- Uses conversation context for better replies
- Adjustable response length and style
- Multi-language support

### 3. **Smart Reply Suggestions**
- Get 3 quick reply suggestions for any message
- Context-aware and relationship-based
- Perfect for busy users who need quick responses

### 4. **Image Analysis**
- Describe images in detail
- Answer questions about image content
- Extract text from images
- Identify objects, people, and scenes

### 5. **Audio Transcription**
- Convert voice messages to text
- Support for multiple languages
- High accuracy with Whisper AI

### 6. **Sentiment Analysis**
- Detect emotional tone of messages
- Identify emotions (happy, sad, angry, etc.)
- Get confidence scores
- Perfect for customer service

### 7. **Conversation Summarization**
- Summarize long chat histories
- Extract key points and action items
- Save time reviewing conversations

### 8. **Chat History Management**
- Persistent conversation memory
- Context-aware responses
- Clear history when needed

## 📡 API Endpoints

### Generate AI Response
```javascript
POST /api/ai/generate-response
{
  "phone": "1234567890",
  "chatId": "0987654321@s.whatsapp.net",
  "message": "Hello, how are you?",
  "options": {
    "systemPrompt": "You are a helpful assistant",
    "maxTokens": 500,
    "includeHistory": true
  }
}

Response:
{
  "success": true,
  "data": {
    "reply": "I'm doing great! How can I help you today?",
    "usage": { "total_tokens": 45 },
    "model": "gpt-5"
  }
}
```

### Smart Auto-Reply
```javascript
POST /api/ai/auto-reply
{
  "phone": "1234567890",
  "chatId": "0987654321@s.whatsapp.net",
  "message": "Are you available for a meeting tomorrow?",
  "settings": {
    "autoReplyEnabled": true,
    "personality": "professional and friendly",
    "language": "auto-detect",
    "contextWindow": 5
  }
}

Response:
{
  "success": true,
  "data": {
    "reply": "Yes, I'm available! What time works best for you?",
    "confidence": 0.9,
    "shouldSend": true
  }
}
```

### Get Smart Reply Suggestions
```javascript
POST /api/ai/smart-replies
{
  "phone": "1234567890",
  "chatId": "0987654321@s.whatsapp.net",
  "context": {
    "lastMessage": "Want to grab lunch?",
    "messageType": "text",
    "senderName": "John",
    "relationship": "friend"
  }
}

Response:
{
  "success": true,
  "data": {
    "suggestions": [
      "Sure! What time?",
      "Sounds great! Where?",
      "Can't today, maybe tomorrow?"
    ]
  }
}
```

### Analyze Image
```javascript
POST /api/ai/analyze-image
{
  "phone": "1234567890",
  "base64Image": "data:image/jpeg;base64,/9j/4AAQ...",
  "prompt": "What's in this image?"
}

Response:
{
  "success": true,
  "data": {
    "analysis": "This image shows a beautiful sunset over the ocean with palm trees in the foreground..."
  }
}
```

### Transcribe Audio
```javascript
POST /api/ai/transcribe-audio
{
  "phone": "1234567890",
  "audioFilePath": "/media/1234567890/audio123.mp3"
}

Response:
{
  "success": true,
  "data": {
    "text": "Hello, this is a test voice message",
    "duration": 5.2
  }
}
```

### Analyze Sentiment
```javascript
POST /api/ai/analyze-sentiment
{
  "phone": "1234567890",
  "text": "I'm so happy with your service!"
}

Response:
{
  "success": true,
  "data": {
    "sentiment": "positive",
    "score": 0.95,
    "emotions": ["joy", "satisfaction"]
  }
}
```

### Summarize Conversation
```javascript
POST /api/ai/summarize
{
  "phone": "1234567890",
  "chatId": "0987654321@s.whatsapp.net",
  "messageCount": 20
}

Response:
{
  "success": true,
  "data": {
    "summary": "The conversation discussed project timeline and deliverables. John agreed to submit the report by Friday. Follow-up meeting scheduled for next week."
  }
}
```

### Get AI Chat History
```javascript
GET /api/ai/chat-history/:phone/:chatId

Response:
{
  "success": true,
  "data": {
    "history": [
      {
        "role": "user",
        "content": "Hello",
        "timestamp": 1699564800000
      },
      {
        "role": "assistant",
        "content": "Hi! How can I help?",
        "timestamp": 1699564805000
      }
    ]
  }
}
```

### Clear AI Chat History
```javascript
DELETE /api/ai/chat-history/:phone/:chatId

Response:
{
  "success": true,
  "data": {
    "cleared": 1
  }
}
```

## 💡 Frontend Integration Examples

### Example 1: Auto-Reply Bot
```javascript
import { autoReplyAI, sendMessage } from './frontend-api';

// Listen for incoming messages (via WebSocket)
socket.on('message', async (msg) => {
  const { phone, chatId, text } = msg;
  
  // Get AI auto-reply
  const { data } = await autoReplyAI(phone, chatId, text, {
    personality: 'friendly customer service agent',
    language: 'auto-detect'
  });
  
  // Send the AI-generated reply
  if (data.shouldSend) {
    await sendMessage(phone, chatId, data.reply);
  }
});
```

### Example 2: Smart Reply Buttons
```javascript
import { getSmartReplies } from './frontend-api';

// When user receives a message
const showSmartReplies = async (phone, chatId, lastMessage) => {
  const { data } = await getSmartReplies(phone, chatId, {
    lastMessage,
    senderName: 'Friend',
    relationship: 'friend'
  });
  
  // Display suggestions as quick reply buttons
  data.suggestions.forEach(suggestion => {
    renderQuickReplyButton(suggestion);
  });
};
```

### Example 3: Image Analysis in Chat
```javascript
import { analyzeImageAI, sendMessage } from './frontend-api';

// When user receives an image
const handleImage = async (phone, chatId, base64Image) => {
  const { data } = await analyzeImageAI(phone, base64Image, 
    "Describe this image and suggest a response"
  );
  
  // Show AI analysis to user
  displayAnalysis(data.analysis);
  
  // Optionally send AI response
  await sendMessage(phone, chatId, `About the image: ${data.analysis}`);
};
```

### Example 4: Conversation Summary
```javascript
import { summarizeConversation } from './frontend-api';

// Summarize last 50 messages
const summarizeChat = async (phone, chatId) => {
  const { data } = await summarizeConversation(phone, chatId, 50);
  
  displaySummary(data.summary);
};
```

### Example 5: Voice Message Transcription
```javascript
import { transcribeAudioAI } from './frontend-api';

// When voice message is received
const handleVoiceMessage = async (phone, audioPath) => {
  const { data } = await transcribeAudioAI(phone, audioPath);
  
  // Show transcription
  displayTranscription(data.text);
};
```

## 🎨 Customization Options

### Personality Settings
Customize the AI's personality for different use cases:

```javascript
const personalities = {
  professional: "professional and courteous",
  friendly: "warm and friendly",
  casual: "casual and fun",
  customer_service: "helpful and patient customer service agent",
  technical: "technical expert with detailed explanations"
};
```

### Language Settings
Support multiple languages:

```javascript
const languages = {
  auto: "auto-detect",
  english: "English",
  spanish: "Spanish",
  french: "French",
  german: "German",
  // ... add more as needed
};
```

### Response Length
Control response verbosity:

```javascript
const maxTokens = {
  brief: 150,      // Short responses
  normal: 500,     // Standard responses
  detailed: 1000,  // Detailed explanations
};
```

## 🔄 Auto-Reply Workflow

Here's a complete auto-reply bot implementation:

```javascript
import { 
  autoReplyAI, 
  sendMessage, 
  analyzeSentimentAI,
  getAIChatHistory 
} from './frontend-api';

class AutoReplyBot {
  constructor(phone) {
    this.phone = phone;
    this.settings = {
      enabled: true,
      personality: 'friendly and helpful',
      language: 'auto-detect',
      contextWindow: 10
    };
  }

  async handleIncomingMessage(chatId, message) {
    if (!this.settings.enabled) return;

    // Analyze sentiment
    const sentiment = await analyzeSentimentAI(this.phone, message);
    
    // Adjust personality based on sentiment
    if (sentiment.data.sentiment === 'negative') {
      this.settings.personality = 'empathetic and understanding';
    }

    // Generate reply
    const response = await autoReplyAI(
      this.phone, 
      chatId, 
      message, 
      this.settings
    );

    // Send if confidence is high
    if (response.data.confidence > 0.7) {
      await sendMessage(this.phone, chatId, response.data.reply);
    }
  }

  async getChatSummary(chatId) {
    const history = await getAIChatHistory(this.phone, chatId);
    return history.data.history;
  }
}

// Usage
const bot = new AutoReplyBot('1234567890');
socket.on('message', (msg) => {
  bot.handleIncomingMessage(msg.chatId, msg.text);
});
```

## 📊 Best Practices

1. **Context Management**
   - Keep chat history under 50 messages for optimal performance
   - Clear old conversations periodically
   - Use contextWindow to limit history used in responses

2. **Response Quality**
   - Use clear system prompts
   - Include conversation context for better replies
   - Adjust maxTokens based on use case

3. **Performance**
   - Cache frequently used responses
   - Use lower token limits for quick replies
   - Implement confidence thresholds for auto-send

4. **User Experience**
   - Show typing indicators while generating responses
   - Provide manual override options
   - Display AI-generated status (e.g., "AI suggested reply")

5. **Privacy & Safety**
   - Never log sensitive information
   - Implement content filters
   - Allow users to disable AI features

## 🚀 Advanced Use Cases

### Customer Support Bot
```javascript
const customerSupportSettings = {
  personality: 'professional customer service agent',
  systemPrompt: `You are a helpful customer support agent for [Company Name]. 
    Be polite, solve problems efficiently, and escalate complex issues.`,
  autoReplyEnabled: true,
  language: 'auto-detect'
};
```

### Sales Assistant
```javascript
const salesAssistantSettings = {
  personality: 'enthusiastic sales professional',
  systemPrompt: `You are a sales assistant. Help customers find products, 
    answer questions, and guide them through the purchase process.`,
  includeHistory: true,
  contextWindow: 15
};
```

### Personal Assistant
```javascript
const personalAssistantSettings = {
  personality: 'organized and proactive personal assistant',
  systemPrompt: `You are a personal assistant. Help with scheduling, 
    reminders, and information retrieval. Be concise and actionable.`,
  maxTokens: 300
};
```

## 🔧 Troubleshooting

### Common Issues

1. **AI not responding**
   - Check OPENAI_API_KEY is set
   - Verify WhatsApp connection is active
   - Check API quota/limits

2. **Poor response quality**
   - Increase contextWindow
   - Improve system prompt
   - Include more chat history

3. **Slow responses**
   - Reduce maxTokens
   - Limit contextWindow
   - Use caching for common queries

## 📝 Summary

The AI automation system provides:
- ✅ Smart auto-replies with learning capability
- ✅ Image and audio analysis
- ✅ Sentiment detection
- ✅ Conversation summarization
- ✅ Multi-language support
- ✅ Customizable personality
- ✅ Context-aware responses
- ✅ Chat history management

All endpoints are documented in `frontend-api.js` and ready for integration!
