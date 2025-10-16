
# Frontend Integration Guide

## Overview
This guide explains how to integrate with the ConnexaBot WhatsApp Backend API from your frontend application.

## API Response Format

All API endpoints follow a consistent response structure:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message description"
}
```

## Authentication Flow

1. **Connect to WhatsApp**
   - Call `/api/connect` with phone number
   - Receive QR code or link code
   - User scans QR or enters link code
   - Poll `/api/status/:phone` to check connection

2. **Maintain Connection**
   - Store phone number in local state
   - Include phone number in all API calls
   - Handle disconnection by redirecting to connect page

## Error Handling

### Common Error Scenarios

1. **Not Connected (400)**
   ```javascript
   if (response.error === "Not connected") {
     // Redirect to connection page
     router.push('/connect');
   }
   ```

2. **Session Expired (400)**
   ```javascript
   if (response.error?.includes("session")) {
     // Clear local session and reconnect
     localStorage.removeItem('phone');
     router.push('/connect');
   }
   ```

3. **API Error (500)**
   ```javascript
   if (response.error) {
     // Show error toast/notification
     showNotification(response.error, 'error');
   }
   ```

## Data Handling Patterns

### 1. Chats List
```javascript
// Response structure
{
  "success": true,
  "chats": [
    {
      "id": "1234567890@s.whatsapp.net",
      "name": "Contact Name",
      "unreadCount": 5,
      "lastMessage": {
        "text": "Last message text",
        "timestamp": 1234567890
      },
      "isGroup": false,
      "isArchived": false,
      "isPinned": true,
      "isMuted": false,
      "profilePicUrl": "https://..."
    }
  ],
  "count": 10
}

// Frontend handling
const { chats, count } = await callAPI(ChatEndpoints.getAll(phone));
setChats(chats);
setTotalChats(count);
```

### 2. Messages
```javascript
// Response structure
{
  "success": true,
  "data": {
    "messages": [
      {
        "key": {
          "remoteJid": "1234567890@s.whatsapp.net",
          "id": "MESSAGE_ID",
          "fromMe": false
        },
        "message": {
          "conversation": "Text message"
        },
        "messageTimestamp": 1234567890,
        "pushName": "Sender Name"
      }
    ]
  }
}

// Frontend handling
const { data } = await callAPI(MessageEndpoints.get(phone, chatId, 50));
setMessages(data.messages);
```

### 3. Contacts
```javascript
// Response structure
{
  "success": true,
  "contacts": [
    {
      "id": "1234567890@s.whatsapp.net",
      "name": "Contact Name",
      "notify": "Display Name",
      "verifiedName": "Business Name",
      "imgUrl": "https://...",
      "status": "Hey there!"
    }
  ],
  "count": 50
}

// Frontend handling
const { contacts } = await callAPI(ContactEndpoints.getAll(phone));
setContacts(contacts);
```

### 4. Groups
```javascript
// Response structure
{
  "success": true,
  "groups": [
    {
      "id": "123456789@g.us",
      "subject": "Group Name",
      "participants": ["user1@s.whatsapp.net", "user2@s.whatsapp.net"],
      "admins": ["admin@s.whatsapp.net"],
      "desc": "Group description",
      "profilePicUrl": "https://..."
    }
  ]
}

// Frontend handling
const { groups } = await callAPI(GroupEndpoints.getAll(phone));
setGroups(groups);
```

### 5. AI Responses
```javascript
// Smart Reply Response
{
  "success": true,
  "suggestions": [
    "Sure, I'd be happy to help!",
    "Thanks for reaching out!",
    "Let me check that for you."
  ]
}

// Sentiment Analysis Response
{
  "success": true,
  "sentiment": {
    "sentiment": "positive",
    "score": 0.85,
    "emotions": ["joy", "excitement"]
  }
}

// Frontend handling
const { suggestions } = await callAPI(AIEndpoints.smartReply(phone, chatId, lastMessage));
setSuggestions(suggestions);
```

## File Upload Handling

For media messages, use FormData:

```javascript
// Image upload
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('phone', phone);
formData.append('to', chatId);
formData.append('caption', 'Image caption');

const response = await fetch(`${API_BASE_URL}/api/messages/send-image`, {
  method: 'POST',
  body: formData // Don't set Content-Type header
});

const data = await response.json();
if (data.success) {
  console.log('Message sent:', data.messageId);
}
```

## WebSocket Integration (Optional)

For real-time updates:

```javascript
const ws = new WebSocket(`wss://${window.location.host}/ws`);

ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'subscribe', phone }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'message':
      // New message received
      addMessage(data.message);
      break;
    case 'status':
      // Connection status changed
      updateConnectionStatus(data.status);
      break;
  }
};
```

## Pagination

For large datasets, use pagination:

```javascript
// Messages with pagination
const limit = 50;
const cursor = lastMessageId;

const { data } = await callAPI({
  url: `${API_BASE_URL}/api/messages/${phone}/${chatId}?limit=${limit}&cursor=${cursor}`,
  method: 'GET'
});

setMessages(prev => [...prev, ...data.messages]);
```

## Best Practices

1. **Always Check Connection Status**
   ```javascript
   const checkConnection = async () => {
     const { connected } = await callAPI(HealthEndpoints.status(phone));
     if (!connected) {
       router.push('/connect');
     }
   };
   ```

2. **Handle Loading States**
   ```javascript
   const [loading, setLoading] = useState(false);
   
   const fetchChats = async () => {
     setLoading(true);
     try {
       const { chats } = await callAPI(ChatEndpoints.getAll(phone));
       setChats(chats);
     } catch (error) {
       showError(error.message);
     } finally {
       setLoading(false);
     }
   };
   ```

3. **Implement Retry Logic**
   ```javascript
   const callAPIWithRetry = async (endpoint, retries = 3) => {
     for (let i = 0; i < retries; i++) {
       try {
         return await callAPI(endpoint);
       } catch (error) {
         if (i === retries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
       }
     }
   };
   ```

4. **Cache Frequently Accessed Data**
   ```javascript
   const cachedContacts = useMemo(() => {
     return contacts.reduce((acc, contact) => {
       acc[contact.id] = contact;
       return acc;
     }, {});
   }, [contacts]);
   ```

## Testing Endpoints

Use the provided test scripts:

```bash
# Test all endpoints
./test-endpoints.sh https://your-repl.replit.app

# Quick test
./test-quick.sh https://your-repl.replit.app
```

## Environment Variables

Required frontend environment variables:

```env
REACT_APP_API_URL=https://your-repl.replit.app
# or
VITE_API_URL=https://your-repl.replit.app
```
