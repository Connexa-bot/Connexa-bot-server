# 📷 Status/Story Posting Guide

## Overview

Your WhatsApp backend now supports posting status updates (stories) with text, images, videos, and audio. Status updates disappear after 24 hours, just like regular WhatsApp.

---

## 🎯 Available Status Types

### 1. Text Status
Post a simple text status update.

```javascript
import { postTextStatus } from './services/api';

// Simple text status
await postTextStatus(phone, 'Hello World!');

// With privacy controls
const statusJidList = [
  '1234567890@s.whatsapp.net',
  '9876543210@s.whatsapp.net'
];
await postTextStatus(phone, 'Hello World!', statusJidList);

// With styling options
await postTextStatus(phone, 'Hello World!', statusJidList, {
  backgroundColor: '#FF5733',
  font: 1
});
```

### 2. Image Status
Post an image as a status update.

```javascript
import { postImageStatus } from './services/api';

// From URL
await postImageStatus(
  phone, 
  'https://example.com/image.jpg', 
  'Check this out!',
  statusJidList
);

// From local file path
await postImageStatus(
  phone,
  './path/to/image.jpg',
  'Amazing photo!',
  statusJidList
);

// With background color
await postImageStatus(
  phone,
  imageUrl,
  'Caption here',
  statusJidList,
  { backgroundColor: '#000000' }
);
```

### 3. Video Status
Post a video as a status update.

```javascript
import { postVideoStatus } from './services/api';

// Post video status
await postVideoStatus(
  phone,
  'https://example.com/video.mp4',
  'Watch this!',
  statusJidList
);

// From local file
await postVideoStatus(
  phone,
  './path/to/video.mp4',
  'Amazing clip!',
  statusJidList
);
```

### 4. Audio Status (Voice Note)
Post an audio/voice note as a status update.

```javascript
import { postAudioStatus } from './services/api';

// Post audio status
await postAudioStatus(
  phone,
  './path/to/audio.mp3',
  statusJidList
);

// From URL
await postAudioStatus(
  phone,
  'https://example.com/audio.mp3',
  statusJidList
);
```

---

## 🔒 Privacy Controls

### Get Contact List for Status Privacy

```javascript
import { getStatusContacts } from './services/api';

// Get all contacts
const { data } = await getStatusContacts(phone);
// Returns: { contacts: [{ jid: '...', name: '...' }, ...] }

// Use contacts for status privacy
const statusJidList = data.contacts.map(c => c.jid);
await postTextStatus(phone, 'Private status!', statusJidList);
```

### Privacy Options

```javascript
// Show to all contacts (empty array)
await postTextStatus(phone, 'Public status', []);

// Show to specific contacts only
const selectedContacts = [
  '1234567890@s.whatsapp.net',
  '9876543210@s.whatsapp.net'
];
await postTextStatus(phone, 'Private status', selectedContacts);

// Show to everyone except specific contacts (implement in frontend)
const allContacts = await getStatusContacts(phone);
const excludeList = ['1234567890@s.whatsapp.net'];
const statusJidList = allContacts.data.contacts
  .filter(c => !excludeList.includes(c.jid))
  .map(c => c.jid);
await postTextStatus(phone, 'Excluded status', statusJidList);
```

---

## 🎨 Styling Options

### Text Status with Styling

```javascript
await postTextStatus(
  phone,
  'Styled Status!',
  statusJidList,
  {
    backgroundColor: '#FF5733',  // Hex color
    font: 1                       // Font style (0-5)
  }
);
```

### Available Background Colors

Common color options:
- `#FFFFFF` - White
- `#000000` - Black
- `#FF5733` - Orange/Red
- `#3498DB` - Blue
- `#2ECC71` - Green
- `#F39C12` - Yellow
- `#9B59B6` - Purple

### Font Options

Font style numbers (0-5):
- `0` - Default font
- `1` - Sans-serif bold
- `2` - Serif
- `3` - Typewriter
- `4` - Handwriting
- `5` - Stylish

---

## 📱 React Native Examples

### Complete Status Posting Component

```javascript
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList } from 'react-native';
import { 
  postTextStatus, 
  postImageStatus, 
  getStatusContacts 
} from './services/api';

function StatusPoster({ phone }) {
  const [statusText, setStatusText] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const { data } = await getStatusContacts(phone);
    setContacts(data.contacts);
  };

  const postStatus = async () => {
    const statusJidList = selectedContacts.length > 0 
      ? selectedContacts 
      : contacts.map(c => c.jid);
    
    await postTextStatus(phone, statusText, statusJidList, {
      backgroundColor: '#3498DB',
      font: 1
    });
    
    setStatusText('');
    alert('Status posted!');
  };

  return (
    <View>
      <TextInput
        value={statusText}
        onChangeText={setStatusText}
        placeholder="What's on your mind?"
      />
      
      <FlatList
        data={contacts}
        renderItem={({ item }) => (
          <CheckBox
            title={item.name}
            checked={selectedContacts.includes(item.jid)}
            onPress={() => toggleContact(item.jid)}
          />
        )}
      />
      
      <Button title="Post Status" onPress={postStatus} />
    </View>
  );
}
```

### Image Status with Camera

```javascript
import { launchCamera } from 'react-native-image-picker';
import { postImageStatus } from './services/api';

async function captureAndPostStatus(phone, statusJidList) {
  const result = await launchCamera({
    mediaType: 'photo',
    includeBase64: false
  });
  
  if (result.assets && result.assets[0]) {
    const imageUri = result.assets[0].uri;
    
    await postImageStatus(
      phone,
      imageUri,
      'Just captured this!',
      statusJidList
    );
    
    alert('Status posted!');
  }
}
```

### Video Status Recorder

```javascript
import { launchCamera } from 'react-native-image-picker';
import { postVideoStatus } from './services/api';

async function recordAndPostVideoStatus(phone, statusJidList) {
  const result = await launchCamera({
    mediaType: 'video',
    videoQuality: 'high'
  });
  
  if (result.assets && result.assets[0]) {
    const videoUri = result.assets[0].uri;
    
    await postVideoStatus(
      phone,
      videoUri,
      'Check out this video!',
      statusJidList
    );
    
    alert('Video status posted!');
  }
}
```

---

## 🚀 API Endpoint Reference

### POST /api/status/post

**Request Body:**
```json
{
  "phone": "1234567890",
  "type": "text",
  "content": "Hello World!",
  "caption": "Optional caption (for image/video)",
  "statusJidList": ["1234567890@s.whatsapp.net"],
  "options": {
    "backgroundColor": "#FF5733",
    "font": 1
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_123456",
    "type": "text",
    "posted": true
  }
}
```

### GET /api/status/contacts/:phone

**Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "jid": "1234567890@s.whatsapp.net",
        "name": "John Doe"
      }
    ]
  }
}
```

---

## ⚠️ Important Notes

1. **Privacy Required**: You must provide a `statusJidList` with contact JIDs who can see the status. Empty array means all contacts.

2. **24-Hour Limit**: Status updates automatically disappear after 24 hours (WhatsApp standard).

3. **Media Formats**: 
   - Images: JPG, PNG, WebP
   - Videos: MP4, MKV, AVI
   - Audio: MP3, AAC, OGG

4. **File Size Limits**: Keep media files under 16MB for best performance.

5. **JID Format**: Contact JIDs must be in format `[phone]@s.whatsapp.net`

---

## 🔍 Viewing Status Updates

To view status updates from others:

```javascript
import { getStatusUpdates } from './services/api';

const { data } = await getStatusUpdates(phone);
// Returns: { statuses: [...] }
```

---

## 📝 Complete Example

```javascript
import { 
  postTextStatus, 
  postImageStatus, 
  getStatusContacts 
} from './services/api';

async function fullStatusExample(phone) {
  // 1. Get contacts for privacy
  const { data: { contacts } } = await getStatusContacts(phone);
  
  // 2. Select specific contacts
  const friends = contacts.filter(c => 
    ['Alice', 'Bob', 'Charlie'].includes(c.name)
  );
  const statusJidList = friends.map(c => c.jid);
  
  // 3. Post text status
  await postTextStatus(
    phone,
    'Having a great day! 🌟',
    statusJidList,
    { backgroundColor: '#2ECC71', font: 1 }
  );
  
  // 4. Post image status
  await postImageStatus(
    phone,
    './my-photo.jpg',
    'Beach vibes! 🏖️',
    statusJidList
  );
  
  console.log('Status updates posted successfully!');
}
```

---

**Your status posting feature is ready to use!** 🎉
