// helpers/statusActions.js
// ===============================
// Comprehensive status/story action helpers
// ===============================

import { getClient } from "./whatsapp.js";
import fs from "fs/promises";

/**
 * Post a text status update
 * @param {string} phone - User's phone number
 * @param {string} text - Status text content
 * @param {Array<string>} statusJidList - Array of contact JIDs who can see this status
 * @param {object} options - Additional options (backgroundColor, font)
 * @returns {Promise<object>} Message result
 */
export async function postTextStatus(phone, text, statusJidList = [], options = {}) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const messageOptions = {
    statusJidList,
    backgroundColor: options.backgroundColor || '#000000',
    font: options.font || 0,
  };

  const result = await client.sendMessage(
    'status@broadcast',
    { text },
    messageOptions
  );

  return result;
}

/**
 * Post an image status update
 * @param {string} phone - User's phone number
 * @param {string|Buffer} image - Image URL, path, or buffer
 * @param {string} caption - Optional caption for the image
 * @param {Array<string>} statusJidList - Array of contact JIDs who can see this status
 * @returns {Promise<object>} Message result
 */
export async function postImageStatus(phone, image, caption = '', statusJidList = []) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  let imageData;
  if (typeof image === 'string') {
    if (image.startsWith('http://') || image.startsWith('https://')) {
      imageData = { url: image };
    } else {
      const buffer = await fs.readFile(image);
      imageData = buffer;
    }
  } else {
    imageData = image;
  }

  const messageOptions = { statusJidList };

  const result = await client.sendMessage(
    'status@broadcast',
    { 
      image: imageData,
      caption 
    },
    messageOptions
  );

  return result;
}

/**
 * Post a video status update
 * @param {string} phone - User's phone number
 * @param {string|Buffer} video - Video URL, path, or buffer
 * @param {string} caption - Optional caption for the video
 * @param {Array<string>} statusJidList - Array of contact JIDs who can see this status
 * @returns {Promise<object>} Message result
 */
export async function postVideoStatus(phone, video, caption = '', statusJidList = []) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  let videoData;
  if (typeof video === 'string') {
    if (video.startsWith('http://') || video.startsWith('https://')) {
      videoData = { url: video };
    } else {
      const buffer = await fs.readFile(video);
      videoData = buffer;
    }
  } else {
    videoData = video;
  }

  const messageOptions = { statusJidList };

  const result = await client.sendMessage(
    'status@broadcast',
    { 
      video: videoData,
      caption 
    },
    messageOptions
  );

  return result;
}

/**
 * Post an audio status update (voice note)
 * @param {string} phone - User's phone number
 * @param {string|Buffer} audio - Audio URL, path, or buffer
 * @param {Array<string>} statusJidList - Array of contact JIDs who can see this status
 * @returns {Promise<object>} Message result
 */
export async function postAudioStatus(phone, audio, statusJidList = []) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  let audioData;
  if (typeof audio === 'string') {
    if (audio.startsWith('http://') || audio.startsWith('https://')) {
      audioData = { url: audio };
    } else {
      const buffer = await fs.readFile(audio);
      audioData = buffer;
    }
  } else {
    audioData = audio;
  }

  const messageOptions = { statusJidList };

  const result = await client.sendMessage(
    'status@broadcast',
    { 
      audio: audioData,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    },
    messageOptions
  );

  return result;
}

/**
 * Delete a status update
 * @param {string} phone - User's phone number
 * @param {object} statusKey - The message key of the status to delete
 * @returns {Promise<object>} Result
 */
export async function deleteStatus(phone, statusKey) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.sendMessage('status@broadcast', { delete: statusKey });
  return { success: true };
}

/**
 * View someone's status
 * @param {string} phone - User's phone number
 * @param {string} statusJid - JID of the user whose status to view
 * @param {array} messageKeys - Array of message keys to mark as viewed
 * @returns {Promise<object>} Result
 */
export async function viewStatus(phone, statusJid, messageKeys) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  // Mark status as read
  await client.readMessages(messageKeys);
  return { success: true };
}

/**
 * Get privacy settings for status
 * @param {string} phone - User's phone number
 * @returns {Promise<object>} Privacy settings
 */
export async function getStatusPrivacy(phone) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const privacy = await client.fetchPrivacySettings();
  return privacy;
}

/**
 * Get status feed - all status updates from contacts
 * @param {string} phone - User's phone number
 * @returns {Promise<object>} Status feed
 */
export async function getStatusFeed(phone) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  try {
    const { sessions } = await import('./whatsapp.js');
    const normalizedPhone = phone.replace(/\D/g, '');
    const session = sessions.get(normalizedPhone);
    
    if (!session || !session.store) {
      throw new Error(`No store found for ${phone}`);
    }

    const store = session.store;
    const statusUpdates = [];
    const statusBroadcastJid = 'status@broadcast';

    const allMessages = store.messages?.[statusBroadcastJid];
    if (allMessages) {
      const messageArray = Array.from(allMessages.values());
      
      const groupedByContact = {};
      
      for (const msg of messageArray) {
        const participant = msg.participant || msg.key?.participant;
        if (!participant) continue;

        const now = Date.now();
        const messageTime = (msg.messageTimestamp || 0) * 1000;
        const isExpired = (now - messageTime) > (24 * 60 * 60 * 1000);
        
        if (isExpired) continue;

        if (!groupedByContact[participant]) {
          groupedByContact[participant] = {
            jid: participant,
            messages: [],
            latestTimestamp: 0
          };
        }

        groupedByContact[participant].messages.push(msg);
        
        if (messageTime > groupedByContact[participant].latestTimestamp) {
          groupedByContact[participant].latestTimestamp = messageTime;
        }
      }

      for (const jid in groupedByContact) {
        const contactData = groupedByContact[jid];
        const profilePic = await client.profilePictureUrl(jid, 'image').catch(() => null);
        
        let contactName = jid.split('@')[0];
        try {
          const contact = store.contacts?.[jid];
          if (contact?.name || contact?.notify) {
            contactName = contact.name || contact.notify;
          }
        } catch (err) {
        }

        statusUpdates.push({
          jid,
          name: contactName,
          profilePicUrl: profilePic,
          messageCount: contactData.messages.length,
          latestTimestamp: contactData.latestTimestamp,
          unread: true
        });
      }

      statusUpdates.sort((a, b) => b.latestTimestamp - a.latestTimestamp);
    }

    return {
      success: true,
      statusUpdates,
      count: statusUpdates.length
    };
  } catch (error) {
    console.error('Error fetching status feed:', error);
    return {
      success: false,
      error: error.message,
      statusUpdates: [],
      count: 0
    };
  }
}

/**
 * Get status messages from a specific contact
 * @param {string} phone - User's phone number
 * @param {string} statusJid - JID of contact whose status to view
 * @returns {Promise<object>} Status messages
 */
export async function getStatusMessages(phone, statusJid) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  try {
    const { sessions } = await import('./whatsapp.js');
    const normalizedPhone = phone.replace(/\D/g, '');
    const session = sessions.get(normalizedPhone);
    
    if (!session || !session.store) {
      throw new Error(`No store found for ${phone}`);
    }

    const store = session.store;
    const statusBroadcastJid = 'status@broadcast';
    const messages = [];

    const allMessages = store.messages?.[statusBroadcastJid];
    if (allMessages) {
      const messageArray = Array.from(allMessages.values());
      
      const now = Date.now();
      
      for (const msg of messageArray) {
        const participant = msg.participant || msg.key?.participant;
        
        if (participant === statusJid) {
          const messageTime = (msg.messageTimestamp || 0) * 1000;
          const isExpired = (now - messageTime) > (24 * 60 * 60 * 1000);
          
          if (!isExpired) {
            const formattedMsg = {
              id: msg.key?.id,
              timestamp: messageTime,
              type: getStatusMessageType(msg.message),
              content: getStatusMessageContent(msg.message),
              key: msg.key
            };
            messages.push(formattedMsg);
          }
        }
      }

      messages.sort((a, b) => a.timestamp - b.timestamp);
    }

    const profilePic = await client.profilePictureUrl(statusJid, 'image').catch(() => null);
    
    let contactName = statusJid.split('@')[0];
    try {
      const contact = store.contacts?.[statusJid];
      if (contact?.name || contact?.notify) {
        contactName = contact.name || contact.notify;
      }
    } catch (err) {
    }

    return {
      success: true,
      jid: statusJid,
      name: contactName,
      profilePicUrl: profilePic,
      messages,
      count: messages.length
    };
  } catch (error) {
    console.error('Error fetching status messages:', error);
    return {
      success: false,
      error: error.message,
      messages: [],
      count: 0
    };
  }
}

function getStatusMessageType(msg) {
  if (!msg) return 'unknown';
  if (msg.imageMessage) return 'image';
  if (msg.videoMessage) return 'video';
  if (msg.audioMessage) return 'audio';
  if (msg.extendedTextMessage) return 'text';
  if (msg.conversation) return 'text';
  return 'unknown';
}

function getStatusMessageContent(msg) {
  if (!msg) return {};
  
  if (msg.conversation) {
    return { text: msg.conversation };
  }
  
  if (msg.extendedTextMessage) {
    return {
      text: msg.extendedTextMessage.text,
      backgroundColor: msg.extendedTextMessage.backgroundArgb,
      font: msg.extendedTextMessage.font
    };
  }
  
  if (msg.imageMessage) {
    return {
      caption: msg.imageMessage.caption,
      url: msg.imageMessage.url,
      mimetype: msg.imageMessage.mimetype
    };
  }
  
  if (msg.videoMessage) {
    return {
      caption: msg.videoMessage.caption,
      url: msg.videoMessage.url,
      mimetype: msg.videoMessage.mimetype,
      seconds: msg.videoMessage.seconds
    };
  }
  
  if (msg.audioMessage) {
    return {
      url: msg.audioMessage.url,
      mimetype: msg.audioMessage.mimetype,
      seconds: msg.audioMessage.seconds,
      ptt: msg.audioMessage.ptt
    };
  }
  
  return {};
}
