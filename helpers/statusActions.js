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
