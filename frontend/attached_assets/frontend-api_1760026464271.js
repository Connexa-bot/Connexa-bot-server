// ===============================
// 📱 WhatsApp Backend API Documentation
// ===============================
// Complete API endpoint reference for frontend integration
// Server URL: https://connexa-bot-server.onrender.com (or your deployed URL)

import axios from 'axios';

const SERVER_URL = 'https://connexa-bot-server.onrender.com';
const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===============================
// 🔌 CONNECTION ENDPOINTS
// ===============================

/**
 * Initiate WhatsApp connection
 * POST /api/connect
 * @param {string} phone - User's phone number (e.g., "1234567890")
 * @returns {Promise} { qrCode, linkCode, message, connected }
 */
export const connectWhatsApp = async (phone) => {
  const response = await api.post('/connect', { phone });
  return response.data;
};

/**
 * Check connection status
 * GET /api/status/:phone
 * @param {string} phone - User's phone number
 * @returns {Promise} { connected, qrCode, linkCode, error }
 */
export const checkStatus = async (phone) => {
  const response = await api.get(`/status/${phone}`);
  return response.data;
};

/**
 * Logout and disconnect
 * POST /api/logout
 * @param {string} phone - User's phone number
 * @returns {Promise} { message }
 */
export const logout = async (phone) => {
  const response = await api.post('/logout', { phone });
  return response.data;
};

// ===============================
// 💬 CHAT ENDPOINTS
// ===============================

/**
 * Get all chats for a user
 * GET /api/chats/:phone
 * @param {string} phone - User's phone number
 * @returns {Promise} { success, data: { chats: [...] } }
 */
export const getChats = async (phone) => {
  const response = await api.get(`/chats/${phone}`);
  return response.data;
};

// ===============================
// 📨 MESSAGE ENDPOINTS
// ===============================

/**
 * Get message history for a specific chat
 * GET /api/messages/:phone/:chatId
 * @param {string} phone - User's phone number
 * @param {string} chatId - Chat ID (e.g., "1234567890@s.whatsapp.net")
 * @param {number} limit - Number of messages to fetch (default: 50)
 * @returns {Promise} { success, data: { messages: [...] } }
 */
export const getMessages = async (phone, chatId, limit = 50) => {
  const response = await api.get(`/messages/${phone}/${chatId}?limit=${limit}`);
  return response.data;
};

/**
 * Send a text message
 * POST /api/messages/send
 * @param {string} phone - User's phone number
 * @param {string} to - Recipient's JID (e.g., "1234567890@s.whatsapp.net")
 * @param {string} text - Message text
 * @returns {Promise} { success, messageId }
 */
export const sendMessage = async (phone, to, text) => {
  const response = await api.post('/messages/send', { phone, to, text });
  return response.data;
};

/**
 * Download media from a message
 * POST /api/messages/download
 * @param {string} phone - User's phone number
 * @param {string} chatId - Chat ID
 * @param {string} msgId - Message ID
 * @param {string} type - Media type (image, video, audio, document)
 * @returns {Promise} { filePath }
 */
export const downloadMedia = async (phone, chatId, msgId, type) => {
  const response = await api.post('/messages/download', { phone, chatId, msgId, type });
  return response.data;
};

/**
 * Perform message actions
 * POST /api/messages/action
 * @param {string} phone - User's phone number
 * @param {string} action - Action type: delete, forward, star, react, edit
 * @param {object} params - Additional parameters based on action
 * @returns {Promise} { success }
 */
export const messageAction = async (phone, action, params) => {
  const response = await api.post('/messages/action', { phone, action, ...params });
  return response.data;
};

// ===============================
// 📞 CALL ENDPOINTS
// ===============================

/**
 * Get call history for a user
 * GET /api/calls/:phone
 * @param {string} phone - User's phone number
 * @returns {Promise} { success, data: { calls: [...] } }
 */
export const getCalls = async (phone) => {
  const response = await api.get(`/calls/${phone}`);
  return response.data;
};

// ===============================
// 📷 STATUS/STORY ENDPOINTS
// ===============================

/**
 * Get status updates (stories) from contacts
 * GET /api/status-updates/:phone
 * @param {string} phone - User's phone number
 * @returns {Promise} { success, data: { statuses: [...] } }
 */
export const getStatusUpdates = async (phone) => {
  const response = await api.get(`/status-updates/${phone}`);
  return response.data;
};

/**
 * Post a text status update
 * POST /api/status/post
 * @param {string} phone - User's phone number
 * @param {string} text - Status text content
 * @param {Array<string>} statusJidList - Array of contact JIDs who can see this status (optional, defaults to all contacts)
 * @param {object} options - Additional options (backgroundColor, font)
 * @returns {Promise} { success, data: { messageId, type, posted } }
 */
export const postTextStatus = async (phone, text, statusJidList = [], options = {}) => {
  const response = await api.post('/status/post', {
    phone,
    type: 'text',
    content: text,
    statusJidList,
    options
  });
  return response.data;
};

/**
 * Post an image status update
 * POST /api/status/post
 * @param {string} phone - User's phone number
 * @param {string|Buffer} image - Image URL, path, or buffer
 * @param {string} caption - Optional caption for the image
 * @param {Array<string>} statusJidList - Array of contact JIDs who can see this status (optional)
 * @param {object} options - Additional options (backgroundColor, font)
 * @returns {Promise} { success, data: { messageId, type, posted } }
 */
export const postImageStatus = async (phone, image, caption = '', statusJidList = [], options = {}) => {
  const response = await api.post('/status/post', {
    phone,
    type: 'image',
    content: image,
    caption,
    statusJidList,
    options
  });
  return response.data;
};

/**
 * Post a video status update
 * POST /api/status/post
 * @param {string} phone - User's phone number
 * @param {string|Buffer} video - Video URL, path, or buffer
 * @param {string} caption - Optional caption for the video
 * @param {Array<string>} statusJidList - Array of contact JIDs who can see this status (optional)
 * @param {object} options - Additional options
 * @returns {Promise} { success, data: { messageId, type, posted } }
 */
export const postVideoStatus = async (phone, video, caption = '', statusJidList = [], options = {}) => {
  const response = await api.post('/status/post', {
    phone,
    type: 'video',
    content: video,
    caption,
    statusJidList,
    options
  });
  return response.data;
};

/**
 * Post an audio status update (voice note)
 * POST /api/status/post
 * @param {string} phone - User's phone number
 * @param {string|Buffer} audio - Audio URL, path, or buffer
 * @param {Array<string>} statusJidList - Array of contact JIDs who can see this status (optional)
 * @param {object} options - Additional options
 * @returns {Promise} { success, data: { messageId, type, posted } }
 */
export const postAudioStatus = async (phone, audio, statusJidList = [], options = {}) => {
  const response = await api.post('/status/post', {
    phone,
    type: 'audio',
    content: audio,
    statusJidList,
    options
  });
  return response.data;
};

/**
 * Get contacts for status privacy list
 * GET /api/status/contacts/:phone
 * @param {string} phone - User's phone number
 * @returns {Promise} { success, data: { contacts: [...] } }
 */
export const getStatusContacts = async (phone) => {
  const response = await api.get(`/status/contacts/${phone}`);
  return response.data;
};

// ===============================
// 📢 CHANNEL ENDPOINTS
// ===============================

/**
 * Get channel subscriptions for a user
 * GET /api/channels/:phone
 * @param {string} phone - User's phone number
 * @returns {Promise} { success, data: { channels: [...] } }
 */
export const getChannels = async (phone) => {
  const response = await api.get(`/channels/${phone}`);
  return response.data;
};

// ===============================
// 👥 COMMUNITY ENDPOINTS
// ===============================

/**
 * Get user's communities
 * GET /api/communities/:phone
 * @param {string} phone - User's phone number
 * @returns {Promise} { success, data: { communities: [...] } }
 */
export const getCommunities = async (phone) => {
  const response = await api.get(`/communities/${phone}`);
  return response.data;
};

// ===============================
// 👤 PROFILE ENDPOINTS
// ===============================

/**
 * Get user profile information
 * GET /api/profile/:phone
 * @param {string} phone - User's phone number
 * @returns {Promise} { success, data: { name, phone, status, picture } }
 */
export const getProfile = async (phone) => {
  const response = await api.get(`/profile/${phone}`);
  return response.data;
};

/**
 * Perform profile actions
 * POST /api/profile/action
 * @param {string} phone - User's phone number
 * @param {string} action - Action type: updateName, updateStatus, updatePicture
 * @param {object} params - Additional parameters based on action
 * @returns {Promise} { success }
 */
export const profileAction = async (phone, action, params) => {
  const response = await api.post('/profile/action', { phone, action, ...params });
  return response.data;
};

// ===============================
// 👥 CONTACT ENDPOINTS
// ===============================

/**
 * Get user's contacts
 * GET /api/contacts/:phone
 * @param {string} phone - User's phone number
 * @returns {Promise} { contacts: [...] }
 */
export const getContacts = async (phone) => {
  const response = await api.get(`/contacts/${phone}`);
  return response.data;
};

/**
 * Perform contact actions
 * POST /api/contacts/action
 * @param {string} phone - User's phone number
 * @param {string} action - Action type: block, unblock
 * @param {string} contactId - Contact's JID
 * @returns {Promise} { success }
 */
export const contactAction = async (phone, action, contactId) => {
  const response = await api.post('/contacts/action', { phone, action, contactId });
  return response.data;
};

// ===============================
// 👥 GROUP ENDPOINTS
// ===============================

/**
 * Get user's groups
 * GET /api/groups/:phone
 * @param {string} phone - User's phone number
 * @returns {Promise} { groups: [...] }
 */
export const getGroups = async (phone) => {
  const response = await api.get(`/groups/${phone}`);
  return response.data;
};

/**
 * Perform group actions
 * POST /api/groups/action
 * @param {string} phone - User's phone number
 * @param {string} action - Action type: create, addMember, removeMember, makeAdmin, demoteAdmin, leave
 * @param {object} params - Additional parameters based on action
 * @returns {Promise} { success }
 */
export const groupAction = async (phone, action, params) => {
  const response = await api.post('/groups/action', { phone, action, ...params });
  return response.data;
};

// ===============================
// 👁️ PRESENCE ENDPOINTS
// ===============================

/**
 * Perform presence actions
 * POST /api/presence/action
 * @param {string} phone - User's phone number
 * @param {string} action - Action type: available, unavailable, composing, recording, paused
 * @param {string} to - Target chat JID (optional for some actions)
 * @returns {Promise} { success }
 */
export const presenceAction = async (phone, action, to = null) => {
  const response = await api.post('/presence/action', { phone, action, to });
  return response.data;
};

// ===============================
// 📋 RESPONSE FORMATS
// ===============================

/**
 * Standard Success Response:
 * {
 *   success: true,
 *   data: {
 *     // endpoint-specific data
 *   }
 * }
 * 
 * Standard Error Response:
 * {
 *   success: false,
 *   error: "Error message"
 * }
 */

// ===============================
// 🚀 USAGE EXAMPLE
// ===============================

/**
 * Example: Complete authentication flow
 * 
 * 1. Connect to WhatsApp:
 *    const { qrCode } = await connectWhatsApp('1234567890');
 * 
 * 2. Display QR code to user and poll status:
 *    const interval = setInterval(async () => {
 *      const { connected } = await checkStatus('1234567890');
 *      if (connected) {
 *        clearInterval(interval);
 *        // Navigate to main app
 *      }
 *    }, 3000);
 * 
 * 3. Fetch user data:
 *    const { data: { chats } } = await getChats('1234567890');
 *    const { data: { messages } } = await getMessages('1234567890', chatId);
 * 
 * 4. Send a message:
 *    await sendMessage('1234567890', '0987654321@s.whatsapp.net', 'Hello!');
 * 
 * 5. Logout:
 *    await logout('1234567890');
 */

// ===============================
// 🤖 AI AUTOMATION ENDPOINTS
// ===============================

/**
 * Generate AI response to a message
 * POST /api/ai/generate-response
 * @param {string} phone - User's phone number
 * @param {string} chatId - Chat ID
 * @param {string} message - User's message
 * @param {object} options - Optional settings (systemPrompt, maxTokens, includeHistory)
 * @returns {Promise} { success, data: { reply, usage, model } }
 */
export const generateAIResponse = async (phone, chatId, message, options = {}) => {
  const response = await api.post('/ai/generate-response', { phone, chatId, message, options });
  return response.data;
};

/**
 * Analyze an image with AI
 * POST /api/ai/analyze-image
 * @param {string} phone - User's phone number
 * @param {string} base64Image - Base64 encoded image
 * @param {string} prompt - Analysis prompt (optional)
 * @returns {Promise} { success, data: { analysis } }
 */
export const analyzeImageAI = async (phone, base64Image, prompt = "Describe this image") => {
  const response = await api.post('/ai/analyze-image', { phone, base64Image, prompt });
  return response.data;
};

/**
 * Transcribe audio with AI
 * POST /api/ai/transcribe-audio
 * @param {string} phone - User's phone number
 * @param {string} audioFilePath - Path to audio file
 * @returns {Promise} { success, data: { text, duration } }
 */
export const transcribeAudioAI = async (phone, audioFilePath) => {
  const response = await api.post('/ai/transcribe-audio', { phone, audioFilePath });
  return response.data;
};

/**
 * Analyze sentiment of text
 * POST /api/ai/analyze-sentiment
 * @param {string} phone - User's phone number
 * @param {string} text - Text to analyze
 * @returns {Promise} { success, data: { sentiment, score, emotions } }
 */
export const analyzeSentimentAI = async (phone, text) => {
  const response = await api.post('/ai/analyze-sentiment', { phone, text });
  return response.data;
};

/**
 * Get smart reply suggestions
 * POST /api/ai/smart-replies
 * @param {string} phone - User's phone number
 * @param {string} chatId - Chat ID
 * @param {object} context - Context (lastMessage, messageType, senderName, relationship)
 * @returns {Promise} { success, data: { suggestions: [...] } }
 */
export const getSmartReplies = async (phone, chatId, context) => {
  const response = await api.post('/ai/smart-replies', { phone, chatId, context });
  return response.data;
};

/**
 * Auto-reply to a message
 * POST /api/ai/auto-reply
 * @param {string} phone - User's phone number
 * @param {string} chatId - Chat ID
 * @param {string} message - Incoming message
 * @param {object} settings - Auto-reply settings (personality, language, etc.)
 * @returns {Promise} { success, data: { reply, confidence, shouldSend } }
 */
export const autoReplyAI = async (phone, chatId, message, settings = {}) => {
  const response = await api.post('/ai/auto-reply', { phone, chatId, message, settings });
  return response.data;
};

/**
 * Summarize conversation history
 * POST /api/ai/summarize
 * @param {string} phone - User's phone number
 * @param {string} chatId - Chat ID
 * @param {number} messageCount - Number of messages to summarize (default: 20)
 * @returns {Promise} { success, data: { summary } }
 */
export const summarizeConversation = async (phone, chatId, messageCount = 20) => {
  const response = await api.post('/ai/summarize', { phone, chatId, messageCount });
  return response.data;
};

/**
 * Get AI chat history
 * GET /api/ai/chat-history/:phone/:chatId
 * @param {string} phone - User's phone number
 * @param {string} chatId - Chat ID
 * @returns {Promise} { success, data: { history: [...] } }
 */
export const getAIChatHistory = async (phone, chatId) => {
  const response = await api.get(`/ai/chat-history/${phone}/${chatId}`);
  return response.data;
};

/**
 * Clear AI chat history
 * DELETE /api/ai/chat-history/:phone/:chatId?
 * @param {string} phone - User's phone number
 * @param {string} chatId - Chat ID (optional, clears all if not provided)
 * @returns {Promise} { success, data: { cleared } }
 */
export const clearAIChatHistory = async (phone, chatId = null) => {
  const url = chatId ? `/ai/chat-history/${phone}/${chatId}` : `/ai/chat-history/${phone}`;
  const response = await api.delete(url);
  return response.data;
};

export default {
  connectWhatsApp,
  checkStatus,
  logout,
  getChats,
  getMessages,
  sendMessage,
  downloadMedia,
  messageAction,
  getCalls,
  getStatusUpdates,
  getChannels,
  getCommunities,
  getProfile,
  profileAction,
  getContacts,
  contactAction,
  getGroups,
  groupAction,
  presenceAction,
  // AI Endpoints
  generateAIResponse,
  analyzeImageAI,
  transcribeAudioAI,
  analyzeSentimentAI,
  getSmartReplies,
  autoReplyAI,
  summarizeConversation,
  getAIChatHistory,
  clearAIChatHistory,
};
