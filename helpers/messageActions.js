// helpers/messageActions.js
// ===============================
// Comprehensive message action helpers for all WhatsApp message types
// ===============================

import { getClient } from "./whatsapp.js";
import { generateWAMessageFromContent, proto } from "@whiskeysockets/baileys";
import fs from "fs/promises";
import path from "path";

/**
 * Send a text message
 */
export async function sendMessage(phone, to, text) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const msg = await client.sendMessage(to, { text });
  return msg;
}

/**
 * Send a text message with mentions
 */
export async function sendMessageWithMentions(phone, to, text, mentions) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const msg = await client.sendMessage(to, { 
    text,
    mentions: mentions || []
  });
  return msg;
}

/**
 * Reply to a message
 */
export async function replyToMessage(phone, to, text, quotedMessage) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const msg = await client.sendMessage(to, { text }, { quoted: quotedMessage });
  return msg;
}

/**
 * Send an image message
 */
export async function sendImage(phone, to, image, caption = '') {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  let imageData;
  if (typeof image === 'string') {
    // Check if it's a URL or file path
    if (image.startsWith('http://') || image.startsWith('https://')) {
      imageData = { url: image };
    } else {
      // File path
      const buffer = await fs.readFile(image);
      imageData = buffer;
    }
  } else {
    // Assume it's a buffer
    imageData = image;
  }

  const msg = await client.sendMessage(to, { 
    image: imageData,
    caption 
  });
  return msg;
}

/**
 * Send a video message
 */
export async function sendVideo(phone, to, video, caption = '', gifPlayback = false) {
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

  const msg = await client.sendMessage(to, { 
    video: videoData,
    caption,
    gifPlayback 
  });
  return msg;
}

/**
 * Send an audio message
 */
export async function sendAudio(phone, to, audio, ptt = false) {
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

  const msg = await client.sendMessage(to, { 
    audio: audioData,
    mimetype: ptt ? 'audio/ogg; codecs=opus' : 'audio/mp4',
    ptt // Push to talk (voice note)
  });
  return msg;
}

/**
 * Send a document/file
 */
export async function sendDocument(phone, to, document, fileName, mimetype = 'application/pdf') {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  let documentData;
  if (typeof document === 'string') {
    if (document.startsWith('http://') || document.startsWith('https://')) {
      documentData = { url: document };
    } else {
      const buffer = await fs.readFile(document);
      documentData = buffer;
    }
  } else {
    documentData = document;
  }

  const msg = await client.sendMessage(to, { 
    document: documentData,
    fileName,
    mimetype
  });
  return msg;
}

/**
 * Send a sticker
 */
export async function sendSticker(phone, to, sticker) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  let stickerData;
  if (typeof sticker === 'string') {
    if (sticker.startsWith('http://') || sticker.startsWith('https://')) {
      stickerData = { url: sticker };
    } else {
      const buffer = await fs.readFile(sticker);
      stickerData = buffer;
    }
  } else {
    stickerData = sticker;
  }

  const msg = await client.sendMessage(to, { sticker: stickerData });
  return msg;
}

/**
 * Send a location message
 */
export async function sendLocation(phone, to, latitude, longitude, name = '', address = '') {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const msg = await client.sendMessage(to, {
    location: {
      degreesLatitude: latitude,
      degreesLongitude: longitude,
      name,
      address
    }
  });
  return msg;
}

/**
 * Send a contact card
 */
export async function sendContact(phone, to, contacts) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  // contacts should be an array of { displayName, vcard }
  const msg = await client.sendMessage(to, {
    contacts: {
      displayName: contacts[0]?.displayName || 'Contact',
      contacts: contacts.map(c => ({ vcard: c.vcard }))
    }
  });
  return msg;
}

/**
 * Send a poll message
 */
export async function sendPoll(phone, to, name, options, selectableCount = 1) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const msg = await client.sendMessage(to, {
    poll: {
      name,
      values: options,
      selectableCount
    }
  });
  return msg;
}

/**
 * Send a list message
 */
export async function sendList(phone, to, text, buttonText, sections, footer = '', title = '') {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const msg = await client.sendMessage(to, {
    text,
    footer,
    title,
    buttonText,
    sections
  });
  return msg;
}

/**
 * Send a broadcast message
 */
export async function sendBroadcast(phone, recipients, message) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const results = [];
  for (const recipient of recipients) {
    try {
      let msg;
      // Handle string message
      if (typeof message === 'string') {
        msg = await client.sendMessage(recipient, { text: message });
      } 
      // Handle object with text property
      else if (message && typeof message === 'object' && 'text' in message) {
        msg = await client.sendMessage(recipient, { text: message.text });
      } 
      // Handle other message types
      else {
        msg = await client.sendMessage(recipient, message);
      }
      results.push({ recipient, success: true, messageId: msg.key.id });
    } catch (error) {
      results.push({ recipient, success: false, error: error.message });
    }
  }
  return results;
}

/**
 * Delete a message
 */
export async function deleteMessage(phone, chatId, messageKey) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.sendMessage(chatId, { delete: messageKey });
  return { success: true };
}

/**
 * Forward a message
 */
export async function forwardMessage(phone, to, message) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.sendMessage(to, { forward: message });
  return { success: true };
}

/**
 * Star a message
 */
export async function starMessage(phone, chatId, messageKey, star = true) {
    const client = getClient(phone);
    if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

    await client.chatModify({ star: { messages: [{ id: messageKey.id, fromMe: messageKey.fromMe }], star } }, chatId);
    return { success: true };
}

/**
 * React to a message
 */
export async function reactToMessage(phone, chatId, messageKey, emoji) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.sendMessage(chatId, {
    react: { text: emoji, key: messageKey },
  });
  return { success: true };
}

/**
 * Edit a message
 */
export async function editMessage(phone, chatId, messageKey, newText) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.sendMessage(chatId, { text: newText, edit: messageKey });
  return { success: true };
}

/**
 * Mark message as read
 */
export async function markMessageRead(phone, messageKey) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.readMessages([messageKey]);
  return { success: true };
}

/**
 * Get message info (read receipts, delivery status)
 */
export async function getMessageInfo(phone, chatId, messageId) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  // This is a placeholder - Baileys doesn't have direct message info API
  // You would track this through events
  return { success: true, info: 'Track via message-receipt.update event' };
}