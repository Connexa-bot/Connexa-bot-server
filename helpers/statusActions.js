// helpers/statusActions.js
// ===============================
// Status/Story action helpers
// ===============================

import { getClient } from "./whatsapp.js";

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
    broadcast: true,
    ...options
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
 * @param {object} options - Additional options (backgroundColor, font)
 * @returns {Promise<object>} Message result
 */
export async function postImageStatus(phone, image, caption = '', statusJidList = [], options = {}) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const messageOptions = {
    statusJidList,
    broadcast: true,
    ...options
  };

  const result = await client.sendMessage(
    'status@broadcast',
    { 
      image: typeof image === 'string' ? { url: image } : image,
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
 * @param {object} options - Additional options
 * @returns {Promise<object>} Message result
 */
export async function postVideoStatus(phone, video, caption = '', statusJidList = [], options = {}) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const messageOptions = {
    statusJidList,
    broadcast: true,
    ...options
  };

  const result = await client.sendMessage(
    'status@broadcast',
    { 
      video: typeof video === 'string' ? { url: video } : video,
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
 * @param {object} options - Additional options
 * @returns {Promise<object>} Message result
 */
export async function postAudioStatus(phone, audio, statusJidList = [], options = {}) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const messageOptions = {
    statusJidList,
    broadcast: true,
    ...options
  };

  const result = await client.sendMessage(
    'status@broadcast',
    { 
      audio: typeof audio === 'string' ? { url: audio } : audio,
      mimetype: 'audio/mp4',
      ptt: true  // Voice note flag
    },
    messageOptions
  );

  return result;
}
