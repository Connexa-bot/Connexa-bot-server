// ===============================
// 🌐 ConnexaBot API Endpoints Reference
// ===============================
// This file provides a comprehensive listing of all available API endpoints
// for frontend integration with the WhatsApp backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     process.env.SERVER_URL || 
                     process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` :
                     'http://localhost:5000';

export const API_ENDPOINTS = {
  
  // ========== HEALTH & CONNECTION ==========
  HEALTH: () => ({
    url: `${API_BASE_URL}/health`,
    method: 'GET'
  }),

  API_HEALTH: () => ({
    url: `${API_BASE_URL}/api/health`,
    method: 'GET'
  }),
  
  CONNECT: (phone) => ({
    url: `${API_BASE_URL}/api/connect`,
    method: 'POST',
    body: { phone }
  }),
  
  GET_STATUS: (phone) => ({
    url: `${API_BASE_URL}/api/status/${phone}`,
    method: 'GET'
  }),
  
  LOGOUT: (phone) => ({
    url: `${API_BASE_URL}/api/logout`,
    method: 'POST',
    body: { phone }
  }),
  
  CLEAR_STATE: (phone, fullReset = false) => ({
    url: `${API_BASE_URL}/api/clear-state/${phone}?fullReset=${fullReset}`,
    method: 'POST'
  }),
  
  // ========== CHATS ==========
  GET_CHATS: (phone) => ({
    url: `${API_BASE_URL}/api/chats/${phone}`,
    method: 'GET'
  }),

  ARCHIVE_CHAT: (phone, chatId, archive = true) => ({
    url: `${API_BASE_URL}/api/chats/archive`,
    method: 'POST',
    body: { phone, chatId, archive }
  }),

  PIN_CHAT: (phone, chatId, pin = true) => ({
    url: `${API_BASE_URL}/api/chats/pin`,
    method: 'POST',
    body: { phone, chatId, pin }
  }),

  MUTE_CHAT: (phone, chatId, duration) => ({
    url: `${API_BASE_URL}/api/chats/mute`,
    method: 'POST',
    body: { phone, chatId, duration }
  }),

  MARK_CHAT_READ: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/mark-read`,
    method: 'POST',
    body: { phone, chatId }
  }),

  MARK_CHAT_UNREAD: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/mark-unread`,
    method: 'POST',
    body: { phone, chatId }
  }),

  DELETE_CHAT: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/delete`,
    method: 'POST',
    body: { phone, chatId }
  }),

  CLEAR_CHAT: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/clear`,
    method: 'POST',
    body: { phone, chatId }
  }),

  GET_CHAT_LABELS: (phone) => ({
    url: `${API_BASE_URL}/api/chats/labels/${phone}`,
    method: 'GET'
  }),

  ADD_CHAT_LABEL: (phone, chatId, labelId) => ({
    url: `${API_BASE_URL}/api/chats/label/add`,
    method: 'POST',
    body: { phone, chatId, labelId }
  }),

  REMOVE_CHAT_LABEL: (phone, chatId, labelId) => ({
    url: `${API_BASE_URL}/api/chats/label/remove`,
    method: 'POST',
    body: { phone, chatId, labelId }
  }),
  
  // ========== MESSAGES ==========
  GET_MESSAGES: (phone, chatId, limit = 50) => ({
    url: `${API_BASE_URL}/api/messages/${phone}/${chatId}?limit=${limit}`,
    method: 'GET'
  }),

  SEND_MESSAGE: (phone, to, text, mentions = []) => ({
    url: `${API_BASE_URL}/api/messages/send`,
    method: 'POST',
    body: { phone, to, text, mentions }
  }),

  REPLY_MESSAGE: (phone, to, text, quotedMessage) => ({
    url: `${API_BASE_URL}/api/messages/reply`,
    method: 'POST',
    body: { phone, to, text, quotedMessage }
  }),

  SEND_IMAGE: (phone, to, imageUrl, caption = '') => ({
    url: `${API_BASE_URL}/api/messages/send-image`,
    method: 'POST',
    body: { phone, to, imageUrl, caption }
  }),

  SEND_VIDEO: (phone, to, videoUrl, caption = '', gifPlayback = false) => ({
    url: `${API_BASE_URL}/api/messages/send-video`,
    method: 'POST',
    body: { phone, to, videoUrl, caption, gifPlayback }
  }),

  SEND_AUDIO: (phone, to, audioUrl, ptt = false) => ({
    url: `${API_BASE_URL}/api/messages/send-audio`,
    method: 'POST',
    body: { phone, to, audioUrl, ptt }
  }),

  SEND_DOCUMENT: (phone, to, documentUrl, fileName, mimetype) => ({
    url: `${API_BASE_URL}/api/messages/send-document`,
    method: 'POST',
    body: { phone, to, documentUrl, fileName, mimetype }
  }),

  SEND_LOCATION: (phone, to, latitude, longitude, name = '', address = '') => ({
    url: `${API_BASE_URL}/api/messages/send-location`,
    method: 'POST',
    body: { phone, to, latitude, longitude, name, address }
  }),

  SEND_CONTACT: (phone, to, contacts) => ({
    url: `${API_BASE_URL}/api/messages/send-contact`,
    method: 'POST',
    body: { phone, to, contacts }
  }),

  SEND_POLL: (phone, to, name, options, selectableCount = 1) => ({
    url: `${API_BASE_URL}/api/messages/send-poll`,
    method: 'POST',
    body: { phone, to, name, options, selectableCount }
  }),

  SEND_LIST: (phone, to, text, buttonText, sections, footer = '', title = '') => ({
    url: `${API_BASE_URL}/api/messages/send-list`,
    method: 'POST',
    body: { phone, to, text, buttonText, sections, footer, title }
  }),

  SEND_BROADCAST: (phone, recipients, message) => ({
    url: `${API_BASE_URL}/api/messages/send-broadcast`,
    method: 'POST',
    body: { phone, recipients, message }
  }),

  DOWNLOAD_MEDIA: (phone, messageKey) => ({
    url: `${API_BASE_URL}/api/messages/download`,
    method: 'POST',
    body: { phone, messageKey }
  }),

  DELETE_MESSAGE: (phone, chatId, messageKey) => ({
    url: `${API_BASE_URL}/api/messages/delete`,
    method: 'POST',
    body: { phone, chatId, messageKey }
  }),

  FORWARD_MESSAGE: (phone, to, message) => ({
    url: `${API_BASE_URL}/api/messages/forward`,
    method: 'POST',
    body: { phone, to, message }
  }),

  REACT_MESSAGE: (phone, chatId, messageKey, emoji) => ({
    url: `${API_BASE_URL}/api/messages/react`,
    method: 'POST',
    body: { phone, chatId, messageKey, emoji }
  }),

  EDIT_MESSAGE: (phone, chatId, messageKey, newText) => ({
    url: `${API_BASE_URL}/api/messages/edit`,
    method: 'POST',
    body: { phone, chatId, messageKey, newText }
  }),

  STAR_MESSAGE: (phone, chatId, messageKey, star = true) => ({
    url: `${API_BASE_URL}/api/messages/star`,
    method: 'POST',
    body: { phone, chatId, messageKey, star }
  }),

  MARK_MESSAGE_READ: (phone, messageKey) => ({
    url: `${API_BASE_URL}/api/messages/read`,
    method: 'POST',
    body: { phone, messageKey }
  }),

  // ========== STATUS/STORY ==========
  GET_STATUS_UPDATES: (phone) => ({
    url: `${API_BASE_URL}/api/status-updates/${phone}`,
    method: 'GET'
  }),

  POST_TEXT_STATUS: (phone, text, statusJidList = [], backgroundColor = '', font = '') => ({
    url: `${API_BASE_URL}/api/status/post-text`,
    method: 'POST',
    body: { phone, text, statusJidList, backgroundColor, font }
  }),

  POST_IMAGE_STATUS: (phone, imageUrl, caption = '', statusJidList = []) => ({
    url: `${API_BASE_URL}/api/status/post-image`,
    method: 'POST',
    body: { phone, imageUrl, caption, statusJidList }
  }),

  POST_VIDEO_STATUS: (phone, videoUrl, caption = '', statusJidList = []) => ({
    url: `${API_BASE_URL}/api/status/post-video`,
    method: 'POST',
    body: { phone, videoUrl, caption, statusJidList }
  }),

  POST_AUDIO_STATUS: (phone, audioUrl, statusJidList = []) => ({
    url: `${API_BASE_URL}/api/status/post-audio`,
    method: 'POST',
    body: { phone, audioUrl, statusJidList }
  }),

  DELETE_STATUS: (phone, statusKey) => ({
    url: `${API_BASE_URL}/api/status/delete`,
    method: 'POST',
    body: { phone, statusKey }
  }),

  VIEW_STATUS: (phone, statusJid, messageKeys) => ({
    url: `${API_BASE_URL}/api/status/view`,
    method: 'POST',
    body: { phone, statusJid, messageKeys }
  }),

  GET_STATUS_PRIVACY: (phone) => ({
    url: `${API_BASE_URL}/api/status/privacy/${phone}`,
    method: 'GET'
  }),
  
  // ========== GROUPS ==========
  GET_GROUPS: (phone) => ({
    url: `${API_BASE_URL}/api/groups/${phone}`,
    method: 'GET'
  }),

  GROUP_ACTION: (phone, action, data = {}) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action, ...data }
  }),

  // ========== CONTACTS ==========
  GET_CONTACTS: (phone) => ({
    url: `${API_BASE_URL}/api/contacts/${phone}`,
    method: 'GET'
  }),

  CONTACT_ACTION: (phone, action, data = {}) => ({
    url: `${API_BASE_URL}/api/contacts/action`,
    method: 'POST',
    body: { phone, action, ...data }
  }),

  // ========== PRESENCE ==========
  PRESENCE_ACTION: (phone, action, data = {}) => ({
    url: `${API_BASE_URL}/api/presence/action`,
    method: 'POST',
    body: { phone, action, ...data }
  }),

  // ========== PROFILE ==========
  GET_PROFILE: (phone) => ({
    url: `${API_BASE_URL}/api/profile/${phone}`,
    method: 'GET'
  }),

  PROFILE_ACTION: (phone, action, data = {}) => ({
    url: `${API_BASE_URL}/api/profile/action`,
    method: 'POST',
    body: { phone, action, ...data }
  }),

  // ========== AI AUTOMATION ==========
  AI_SMART_REPLY: (phone, chatId, lastMessage, senderName = 'User', relationship = 'friend') => ({
    url: `${API_BASE_URL}/api/ai/smart-reply`,
    method: 'POST',
    body: { phone, chatId, lastMessage, senderName, relationship }
  }),

  AI_AUTO_REPLY: (phone, chatId, to, message, settings = {}) => ({
    url: `${API_BASE_URL}/api/ai/auto-reply`,
    method: 'POST',
    body: { phone, chatId, to, message, settings }
  }),

  AI_GENERATE: (phone, chatId, userMessage, systemPrompt = '', maxTokens = 500, includeHistory = true) => ({
    url: `${API_BASE_URL}/api/ai/generate`,
    method: 'POST',
    body: { phone, chatId, userMessage, systemPrompt, maxTokens, includeHistory }
  }),

  AI_SENTIMENT: (phone, text) => ({
    url: `${API_BASE_URL}/api/ai/sentiment`,
    method: 'POST',
    body: { phone, text }
  }),

  AI_ANALYZE_IMAGE: (phone, base64Image, prompt = '') => ({
    url: `${API_BASE_URL}/api/ai/analyze-image`,
    method: 'POST',
    body: { phone, base64Image, prompt }
  }),

  AI_TRANSCRIBE: (phone, audioFilePath) => ({
    url: `${API_BASE_URL}/api/ai/transcribe`,
    method: 'POST',
    body: { phone, audioFilePath }
  }),

  AI_SUMMARIZE: (phone, chatId, messageCount = 20) => ({
    url: `${API_BASE_URL}/api/ai/summarize`,
    method: 'POST',
    body: { phone, chatId, messageCount }
  }),

  AI_TRANSLATE: (phone, text, targetLang) => ({
    url: `${API_BASE_URL}/api/ai/translate`,
    method: 'POST',
    body: { phone, text, targetLang }
  }),

  AI_COMPOSE: (phone, chatId, context, tone = 'friendly') => ({
    url: `${API_BASE_URL}/api/ai/compose`,
    method: 'POST',
    body: { phone, chatId, context, tone }
  }),

  AI_IMPROVE: (phone, text, improvements = ['grammar', 'clarity', 'tone']) => ({
    url: `${API_BASE_URL}/api/ai/improve`,
    method: 'POST',
    body: { phone, text, improvements }
  }),

  AI_MODERATE: (phone, text) => ({
    url: `${API_BASE_URL}/api/ai/moderate`,
    method: 'POST',
    body: { phone, text }
  }),

  AI_BATCH_ANALYZE: (phone, messages) => ({
    url: `${API_BASE_URL}/api/ai/batch-analyze`,
    method: 'POST',
    body: { phone, messages }
  }),

  AI_GET_HISTORY: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/ai/history/${phone}/${chatId}`,
    method: 'GET'
  }),

  AI_CLEAR_HISTORY: (phone, chatId = null) => ({
    url: `${API_BASE_URL}/api/ai/history/clear`,
    method: 'POST',
    body: { phone, chatId }
  }),

  // ========== CHANNELS ==========
  GET_CHANNELS: (phone) => ({
    url: `${API_BASE_URL}/api/channels/${phone}`,
    method: 'GET'
  }),

  FOLLOW_CHANNEL: (phone, channelJid) => ({
    url: `${API_BASE_URL}/api/channels/follow`,
    method: 'POST',
    body: { phone, channelJid }
  }),

  UNFOLLOW_CHANNEL: (phone, channelJid) => ({
    url: `${API_BASE_URL}/api/channels/unfollow`,
    method: 'POST',
    body: { phone, channelJid }
  }),

  GET_CHANNEL_METADATA: (phone, channelJid) => ({
    url: `${API_BASE_URL}/api/channels/metadata/${phone}/${channelJid}`,
    method: 'GET'
  }),

  MUTE_CHANNEL: (phone, channelJid, duration) => ({
    url: `${API_BASE_URL}/api/channels/mute`,
    method: 'POST',
    body: { phone, channelJid, duration }
  }),

  GET_COMMUNITIES: (phone) => ({
    url: `${API_BASE_URL}/api/channels/communities/${phone}`,
    method: 'GET'
  }),

  // ========== CALLS ==========
  GET_CALLS: (phone) => ({
    url: `${API_BASE_URL}/api/calls/${phone}`,
    method: 'GET'
  }),

  MAKE_CALL: (phone, to, isVideo = false) => ({
    url: `${API_BASE_URL}/api/calls/make`,
    method: 'POST',
    body: { phone, to, isVideo }
  }),
};

// Helper function to make API calls
export const callAPI = async (endpoint) => {
  try {
    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: endpoint.body ? JSON.stringify(endpoint.body) : undefined
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// ===============================
// 📝 USAGE EXAMPLES
// ===============================

// Example 1: Connect to WhatsApp
// const result = await callAPI(API_ENDPOINTS.CONNECT('2349154347487'));

// Example 2: Get chats
// const chats = await callAPI(API_ENDPOINTS.GET_CHATS('2349154347487'));

// Example 3: Send message
// const sent = await callAPI(API_ENDPOINTS.SEND_MESSAGE('2349154347487', '2348012345678@s.whatsapp.net', 'Hello!'));

// Example 4: AI Smart Reply
// const reply = await callAPI(API_ENDPOINTS.AI_SMART_REPLY('2349154347487', 'chat123', 'How are you?'));

// Example 5: Archive chat
// const archived = await callAPI(API_ENDPOINTS.ARCHIVE_CHAT('2349154347487', '2348012345678@s.whatsapp.net', true));

export default API_ENDPOINTS;
