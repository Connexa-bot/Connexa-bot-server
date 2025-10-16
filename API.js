
// ================================================================
// ConnexaBot WhatsApp API - Frontend Integration
// Complete API endpoints organized by functionality
// ================================================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     process.env.VITE_API_URL ||
                     process.env.SERVER_URL || 
                     (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null) ||
                     'http://localhost:3000';

// ================================================================
// HELPER FUNCTION
// ================================================================
export const callAPI = async (endpoint) => {
  try {
    const config = {
      method: endpoint.method,
      headers: endpoint.headers || {
        'Content-Type': 'application/json',
      }
    };

    // Handle FormData (for file uploads)
    if (endpoint.body instanceof FormData) {
      delete config.headers['Content-Type'];
      config.body = endpoint.body;
    } else if (endpoint.body) {
      config.body = JSON.stringify(endpoint.body);
    }

    const response = await fetch(endpoint.url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// ================================================================
// SECTION 0: HEALTH & CONNECTION
// ================================================================
export const HealthEndpoints = {
  // Server health check
  serverHealth: () => ({
    url: `${API_BASE_URL}/health`,
    method: 'GET'
  }),

  // API health check
  apiHealth: () => ({
    url: `${API_BASE_URL}/api/health`,
    method: 'GET'
  }),

  // OpenAI status check
  openaiStatus: () => ({
    url: `${API_BASE_URL}/api/openai/status`,
    method: 'GET'
  }),

  // Connect WhatsApp
  connect: (phone) => ({
    url: `${API_BASE_URL}/api/connect`,
    method: 'POST',
    body: { phone }
  }),

  // Check connection status
  status: (phone) => ({
    url: `${API_BASE_URL}/api/status/${phone}`,
    method: 'GET'
  }),

  // Logout
  logout: (phone) => ({
    url: `${API_BASE_URL}/api/logout`,
    method: 'POST',
    body: { phone }
  }),

  // Clear session state
  clearState: (phone, fullReset = false) => ({
    url: `${API_BASE_URL}/api/clear-state/${phone}?fullReset=${fullReset}`,
    method: 'POST'
  })
};

// ================================================================
// SECTION 1: CHAT MANAGEMENT
// ================================================================
export const ChatEndpoints = {
  // Get all chats
  getAll: (phone) => ({
    url: `${API_BASE_URL}/api/chats/${phone}`,
    method: 'GET'
  }),

  // Get specific chat
  getById: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/${phone}/${chatId}`,
    method: 'GET'
  }),

  // Archive/Unarchive chat
  archive: (phone, chatId, archive = true) => ({
    url: `${API_BASE_URL}/api/chats/archive`,
    method: 'POST',
    body: { phone, chatId, archive }
  }),

  // Pin/Unpin chat
  pin: (phone, chatId, pin = true) => ({
    url: `${API_BASE_URL}/api/chats/pin`,
    method: 'POST',
    body: { phone, chatId, pin }
  }),

  // Delete chat
  delete: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/delete`,
    method: 'POST',
    body: { phone, chatId }
  }),

  // Mark as read
  markRead: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/mark-read`,
    method: 'POST',
    body: { phone, chatId }
  }),

  // Mark as unread
  markUnread: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/mark-unread`,
    method: 'POST',
    body: { phone, chatId }
  }),

  // Mute/Unmute chat
  mute: (phone, chatId, duration = null) => ({
    url: `${API_BASE_URL}/api/chats/mute`,
    method: 'POST',
    body: { phone, chatId, duration }
  }),

  // Clear chat history
  clear: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/clear`,
    method: 'POST',
    body: { phone, chatId }
  }),

  // Get archived chats
  getArchived: (phone) => ({
    url: `${API_BASE_URL}/api/chats/archived/${phone}`,
    method: 'GET'
  }),

  // Search chats
  search: (phone, query) => ({
    url: `${API_BASE_URL}/api/chats/search/${phone}?query=${encodeURIComponent(query)}`,
    method: 'GET'
  }),

  // Get chat labels
  getLabels: (phone) => ({
    url: `${API_BASE_URL}/api/chats/labels/${phone}`,
    method: 'GET'
  }),

  // Add label to chat
  addLabel: (phone, chatId, labelId) => ({
    url: `${API_BASE_URL}/api/chats/label/add`,
    method: 'POST',
    body: { phone, chatId, labelId }
  }),

  // Remove label from chat
  removeLabel: (phone, chatId, labelId) => ({
    url: `${API_BASE_URL}/api/chats/label/remove`,
    method: 'POST',
    body: { phone, chatId, labelId }
  })
};

// ================================================================
// SECTION 2: CONTACTS
// ================================================================
export const ContactEndpoints = {
  // Get all contacts
  getAll: (phone) => ({
    url: `${API_BASE_URL}/api/contacts/${phone}`,
    method: 'GET'
  }),

  // Get specific contact
  get: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/${phone}/${contactId}`,
    method: 'GET'
  }),

  // Get profile picture
  getPicture: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/${phone}/${contactId}/picture`,
    method: 'GET'
  }),

  // Get contact status
  getStatus: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/${phone}/${contactId}/status`,
    method: 'GET'
  }),

  // Check if contact exists
  checkExists: (phone, phoneNumber) => ({
    url: `${API_BASE_URL}/api/contacts/check-exists`,
    method: 'POST',
    body: { phone, phoneNumber }
  }),

  // Block contact
  block: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/action`,
    method: 'POST',
    body: { phone, action: 'block', jid: contactId }
  }),

  // Unblock contact
  unblock: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/action`,
    method: 'POST',
    body: { phone, action: 'unblock', jid: contactId }
  }),

  // Get blocked contacts
  getBlocked: (phone) => ({
    url: `${API_BASE_URL}/api/contacts/action`,
    method: 'POST',
    body: { phone, action: 'blocked' }
  }),

  // Get business profile
  getBusinessProfile: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/${phone}/${contactId}/business`,
    method: 'GET'
  })
};

// ================================================================
// SECTION 3: MESSAGING
// ================================================================
export const MessageEndpoints = {
  // Get messages from chat
  get: (phone, chatId, limit = 50, cursor = null) => ({
    url: `${API_BASE_URL}/api/messages/${phone}/${chatId}?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`,
    method: 'GET'
  }),

  // Send text message
  send: (phone, to, text, mentions = []) => ({
    url: `${API_BASE_URL}/api/messages/send`,
    method: 'POST',
    body: { phone, to, text, mentions }
  }),

  // Reply to message
  reply: (phone, to, text, quotedMessage) => ({
    url: `${API_BASE_URL}/api/messages/reply`,
    method: 'POST',
    body: { phone, to, text, quotedMessage }
  }),

  // Send image (with file)
  sendImageFile: (phone, to, imageFile, caption = '') => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('phone', phone);
    formData.append('to', to);
    formData.append('caption', caption);
    
    return {
      url: `${API_BASE_URL}/api/messages/send-image`,
      method: 'POST',
      body: formData
    };
  },

  // Send image (with URL)
  sendImageUrl: (phone, to, imageUrl, caption = '') => ({
    url: `${API_BASE_URL}/api/messages/send-image`,
    method: 'POST',
    body: { phone, to, imageUrl, caption }
  }),

  // Send video (with file)
  sendVideoFile: (phone, to, videoFile, caption = '', gifPlayback = false) => {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('phone', phone);
    formData.append('to', to);
    formData.append('caption', caption);
    formData.append('gifPlayback', gifPlayback);
    
    return {
      url: `${API_BASE_URL}/api/messages/send-video`,
      method: 'POST',
      body: formData
    };
  },

  // Send video (with URL)
  sendVideoUrl: (phone, to, videoUrl, caption = '', gifPlayback = false) => ({
    url: `${API_BASE_URL}/api/messages/send-video`,
    method: 'POST',
    body: { phone, to, videoUrl, caption, gifPlayback }
  }),

  // Send audio (with file)
  sendAudioFile: (phone, to, audioFile, ptt = false) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('phone', phone);
    formData.append('to', to);
    formData.append('ptt', ptt);
    
    return {
      url: `${API_BASE_URL}/api/messages/send-audio`,
      method: 'POST',
      body: formData
    };
  },

  // Send audio (with URL)
  sendAudioUrl: (phone, to, audioUrl, ptt = false) => ({
    url: `${API_BASE_URL}/api/messages/send-audio`,
    method: 'POST',
    body: { phone, to, audioUrl, ptt }
  }),

  // Send document (with file)
  sendDocumentFile: (phone, to, documentFile, fileName = null, mimetype = null) => {
    const formData = new FormData();
    formData.append('document', documentFile);
    formData.append('phone', phone);
    formData.append('to', to);
    if (fileName) formData.append('fileName', fileName);
    if (mimetype) formData.append('mimetype', mimetype);
    
    return {
      url: `${API_BASE_URL}/api/messages/send-document`,
      method: 'POST',
      body: formData
    };
  },

  // Send document (with URL)
  sendDocumentUrl: (phone, to, documentUrl, fileName, mimetype) => ({
    url: `${API_BASE_URL}/api/messages/send-document`,
    method: 'POST',
    body: { phone, to, documentUrl, fileName, mimetype }
  }),

  // Send location
  sendLocation: (phone, to, latitude, longitude, name = '', address = '') => ({
    url: `${API_BASE_URL}/api/messages/send-location`,
    method: 'POST',
    body: { phone, to, latitude, longitude, name, address }
  }),

  // Send contact
  sendContact: (phone, to, contacts) => ({
    url: `${API_BASE_URL}/api/messages/send-contact`,
    method: 'POST',
    body: { phone, to, contacts }
  }),

  // Send poll
  sendPoll: (phone, to, name, options, selectableCount = 1) => ({
    url: `${API_BASE_URL}/api/messages/send-poll`,
    method: 'POST',
    body: { phone, to, name, options, selectableCount }
  }),

  // Send list message
  sendList: (phone, to, text, buttonText, sections, footer = '', title = '') => ({
    url: `${API_BASE_URL}/api/messages/send-list`,
    method: 'POST',
    body: { phone, to, text, buttonText, sections, footer, title }
  }),

  // Forward message
  forward: (phone, to, message) => ({
    url: `${API_BASE_URL}/api/messages/forward`,
    method: 'POST',
    body: { phone, to, message }
  }),

  // Delete message
  delete: (phone, chatId, messageKey) => ({
    url: `${API_BASE_URL}/api/messages/delete`,
    method: 'POST',
    body: { phone, chatId, messageKey }
  }),

  // React to message
  react: (phone, chatId, messageKey, emoji) => ({
    url: `${API_BASE_URL}/api/messages/react`,
    method: 'POST',
    body: { phone, chatId, messageKey, emoji }
  }),

  // Edit message
  edit: (phone, chatId, messageKey, newText) => ({
    url: `${API_BASE_URL}/api/messages/edit`,
    method: 'POST',
    body: { phone, chatId, messageKey, newText }
  }),

  // Star/Unstar message
  star: (phone, chatId, messageKey, star = true) => ({
    url: `${API_BASE_URL}/api/messages/star`,
    method: 'POST',
    body: { phone, chatId, messageKey, star }
  }),

  // Mark message as read
  markRead: (phone, messageKey) => ({
    url: `${API_BASE_URL}/api/messages/read`,
    method: 'POST',
    body: { phone, messageKey }
  }),

  // Send broadcast
  sendBroadcast: (phone, recipients, message) => ({
    url: `${API_BASE_URL}/api/messages/send-broadcast`,
    method: 'POST',
    body: { phone, recipients, message }
  }),

  // Get starred messages
  getStarred: (phone) => ({
    url: `${API_BASE_URL}/api/starred/${phone}`,
    method: 'GET'
  }),

  // Search messages
  search: (phone, query) => ({
    url: `${API_BASE_URL}/api/search/messages`,
    method: 'POST',
    body: { phone, query }
  })
};

// ================================================================
// SECTION 4: STATUS/STORIES
// ================================================================
export const StatusEndpoints = {
  // Get all status updates
  getAll: (phone) => ({
    url: `${API_BASE_URL}/api/status-updates/${phone}`,
    method: 'GET'
  }),

  // Post text status
  postText: (phone, text, statusJidList = [], backgroundColor = '#000000', font = 0) => ({
    url: `${API_BASE_URL}/api/status/post-text`,
    method: 'POST',
    body: { phone, text, statusJidList, backgroundColor, font }
  }),

  // Post image status (with file)
  postImageFile: (phone, imageFile, caption = '', statusJidList = []) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('phone', phone);
    formData.append('caption', caption);
    formData.append('statusJidList', JSON.stringify(statusJidList));
    
    return {
      url: `${API_BASE_URL}/api/status/post-image`,
      method: 'POST',
      body: formData
    };
  },

  // Post image status (with URL)
  postImageUrl: (phone, imageUrl, caption = '', statusJidList = []) => ({
    url: `${API_BASE_URL}/api/status/post-image`,
    method: 'POST',
    body: { phone, imageUrl, caption, statusJidList }
  }),

  // Post video status (with file)
  postVideoFile: (phone, videoFile, caption = '', statusJidList = []) => {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('phone', phone);
    formData.append('caption', caption);
    formData.append('statusJidList', JSON.stringify(statusJidList));
    
    return {
      url: `${API_BASE_URL}/api/status/post-video`,
      method: 'POST',
      body: formData
    };
  },

  // Post video status (with URL)
  postVideoUrl: (phone, videoUrl, caption = '', statusJidList = []) => ({
    url: `${API_BASE_URL}/api/status/post-video`,
    method: 'POST',
    body: { phone, videoUrl, caption, statusJidList }
  }),

  // Post audio status (with file)
  postAudioFile: (phone, audioFile, statusJidList = []) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('phone', phone);
    formData.append('statusJidList', JSON.stringify(statusJidList));
    
    return {
      url: `${API_BASE_URL}/api/status/post-audio`,
      method: 'POST',
      body: formData
    };
  },

  // Delete status
  delete: (phone, statusKey) => ({
    url: `${API_BASE_URL}/api/status/delete`,
    method: 'POST',
    body: { phone, statusKey }
  }),

  // View status
  view: (phone, statusJid, messageKeys) => ({
    url: `${API_BASE_URL}/api/status/view`,
    method: 'POST',
    body: { phone, statusJid, messageKeys }
  }),

  // Get privacy settings
  getPrivacy: (phone) => ({
    url: `${API_BASE_URL}/api/status/privacy/${phone}`,
    method: 'GET'
  })
};

// ================================================================
// SECTION 5: GROUPS
// ================================================================
export const GroupEndpoints = {
  // Get all groups
  getAll: (phone) => ({
    url: `${API_BASE_URL}/api/groups/${phone}`,
    method: 'GET'
  }),

  // Get group metadata
  getMetadata: (phone, groupId) => ({
    url: `${API_BASE_URL}/api/groups/${phone}/${groupId}/metadata`,
    method: 'GET'
  }),

  // Create group
  create: (phone, name, participants) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'create', name, participants }
  }),

  // Get invite code
  getInviteCode: (phone, groupId) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'getInviteCode', groupId }
  }),

  // Revoke invite code
  revokeInviteCode: (phone, groupId) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'revokeInviteCode', groupId }
  }),

  // Join via invite
  joinViaInvite: (phone, inviteCode) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'acceptInvite', inviteCode }
  }),

  // Leave group
  leave: (phone, groupId) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'leave', groupId }
  }),

  // Update subject
  updateSubject: (phone, groupId, subject) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'updateSubject', groupId, subject }
  }),

  // Update description
  updateDescription: (phone, groupId, description) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'updateDescription', groupId, description }
  }),

  // Add participants
  addParticipants: (phone, groupId, participants) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'add', groupId, participants }
  }),

  // Remove participants
  removeParticipants: (phone, groupId, participants) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'remove', groupId, participants }
  }),

  // Promote participants
  promoteParticipants: (phone, groupId, participants) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'promote', groupId, participants }
  }),

  // Demote participants
  demoteParticipants: (phone, groupId, participants) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'demote', groupId, participants }
  }),

  // Toggle announcement mode
  toggleAnnouncement: (phone, groupId, setting) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'updateSettings', groupId, setting }
  })
};

// ================================================================
// SECTION 6: CHANNELS
// ================================================================
export const ChannelEndpoints = {
  // Get all channels
  getAll: (phone) => ({
    url: `${API_BASE_URL}/api/channels/${phone}`,
    method: 'GET'
  }),

  // Get channel metadata
  getMetadata: (phone, channelJid) => ({
    url: `${API_BASE_URL}/api/channels/metadata/${phone}/${channelJid}`,
    method: 'GET'
  }),

  // Follow channel
  follow: (phone, channelJid) => ({
    url: `${API_BASE_URL}/api/channels/follow`,
    method: 'POST',
    body: { phone, channelJid }
  }),

  // Unfollow channel
  unfollow: (phone, channelJid) => ({
    url: `${API_BASE_URL}/api/channels/unfollow`,
    method: 'POST',
    body: { phone, channelJid }
  }),

  // Mute channel
  mute: (phone, channelJid, duration = null) => ({
    url: `${API_BASE_URL}/api/channels/mute`,
    method: 'POST',
    body: { phone, channelJid, duration }
  }),

  // Get communities
  getCommunities: (phone) => ({
    url: `${API_BASE_URL}/api/channels/communities/${phone}`,
    method: 'GET'
  })
};

// ================================================================
// SECTION 7: CALLS
// ================================================================
export const CallEndpoints = {
  // Get call history
  getHistory: (phone) => ({
    url: `${API_BASE_URL}/api/calls/${phone}`,
    method: 'GET'
  })
};

// ================================================================
// SECTION 8: PRESENCE
// ================================================================
export const PresenceEndpoints = {
  // Update presence
  update: (phone, chatId, presence) => ({
    url: `${API_BASE_URL}/api/presence/action`,
    method: 'POST',
    body: { phone, action: 'update', chatId, presence }
  }),

  // Subscribe to presence
  subscribe: (phone, jid) => ({
    url: `${API_BASE_URL}/api/presence/action`,
    method: 'POST',
    body: { phone, action: 'subscribe', jid }
  })
};

// ================================================================
// SECTION 9: PROFILE
// ================================================================
export const ProfileEndpoints = {
  // Get profile
  get: (phone) => ({
    url: `${API_BASE_URL}/api/profile/${phone}`,
    method: 'GET'
  }),

  // Update name
  updateName: (phone, name) => ({
    url: `${API_BASE_URL}/api/profile/action`,
    method: 'POST',
    body: { phone, action: 'updateName', name }
  }),

  // Update status
  updateStatus: (phone, status) => ({
    url: `${API_BASE_URL}/api/profile/action`,
    method: 'POST',
    body: { phone, action: 'updateStatus', status }
  }),

  // Update picture
  updatePicture: (phone, jid, imageBuffer) => ({
    url: `${API_BASE_URL}/api/profile/action`,
    method: 'POST',
    body: { phone, action: 'updatePicture', jid, imageBuffer }
  }),

  // Remove picture
  removePicture: (phone, jid) => ({
    url: `${API_BASE_URL}/api/profile/action`,
    method: 'POST',
    body: { phone, action: 'removePicture', jid }
  }),

  // Get picture
  getPicture: (phone, jid) => ({
    url: `${API_BASE_URL}/api/profile/action`,
    method: 'POST',
    body: { phone, action: 'getPicture', jid }
  })
};

// ================================================================
// SECTION 10: PRIVACY
// ================================================================
export const PrivacyEndpoints = {
  // Get settings
  getSettings: (phone) => ({
    url: `${API_BASE_URL}/api/privacy/settings/${phone}`,
    method: 'GET'
  }),

  // Update settings
  updateSettings: (phone, setting, value) => ({
    url: `${API_BASE_URL}/api/privacy/settings/update`,
    method: 'POST',
    body: { phone, setting, value }
  }),

  // Get blocked contacts
  getBlocked: (phone) => ({
    url: `${API_BASE_URL}/api/privacy/blocked/${phone}`,
    method: 'GET'
  }),

  // Block user
  block: (phone, jid) => ({
    url: `${API_BASE_URL}/api/privacy/block`,
    method: 'POST',
    body: { phone, jid }
  }),

  // Unblock user
  unblock: (phone, jid) => ({
    url: `${API_BASE_URL}/api/privacy/unblock`,
    method: 'POST',
    body: { phone, jid }
  }),

  // Set disappearing messages
  setDisappearingMessages: (phone, chatId, duration) => ({
    url: `${API_BASE_URL}/api/privacy/disappearing-messages`,
    method: 'POST',
    body: { phone, chatId, duration }
  }),

  // Get business profile
  getBusinessProfile: (phone, jid) => ({
    url: `${API_BASE_URL}/api/privacy/business-profile/${phone}/${jid}`,
    method: 'GET'
  })
};

// ================================================================
// SECTION 11: AI FEATURES
// ================================================================
export const AIEndpoints = {
  // Generate smart reply
  smartReply: (phone, chatId, lastMessage, senderName = null, relationship = null) => ({
    url: `${API_BASE_URL}/api/ai/smart-reply`,
    method: 'POST',
    body: { phone, chatId, lastMessage, senderName, relationship }
  }),

  // Auto reply
  autoReply: (phone, chatId, message, to = null, settings = null) => ({
    url: `${API_BASE_URL}/api/ai/auto-reply`,
    method: 'POST',
    body: { phone, chatId, message, to, settings }
  }),

  // Generate AI response
  generate: (phone, chatId, userMessage, systemPrompt = null, maxTokens = null, includeHistory = false) => ({
    url: `${API_BASE_URL}/api/ai/generate`,
    method: 'POST',
    body: { phone, chatId, userMessage, systemPrompt, maxTokens, includeHistory }
  }),

  // Analyze sentiment
  sentiment: (phone, text) => ({
    url: `${API_BASE_URL}/api/ai/sentiment`,
    method: 'POST',
    body: { phone, text }
  }),

  // Analyze image
  analyzeImage: (phone, base64Image, prompt = null) => ({
    url: `${API_BASE_URL}/api/ai/analyze-image`,
    method: 'POST',
    body: { phone, base64Image, prompt }
  }),

  // Transcribe audio
  transcribe: (phone, audioFilePath) => ({
    url: `${API_BASE_URL}/api/ai/transcribe`,
    method: 'POST',
    body: { phone, audioFilePath }
  }),

  // Summarize conversation
  summarize: (phone, chatId, messageCount = null) => ({
    url: `${API_BASE_URL}/api/ai/summarize`,
    method: 'POST',
    body: { phone, chatId, messageCount }
  }),

  // Translate text
  translate: (phone, text, targetLang) => ({
    url: `${API_BASE_URL}/api/ai/translate`,
    method: 'POST',
    body: { phone, text, targetLang }
  }),

  // Smart compose
  compose: (phone, chatId, context, tone = null) => ({
    url: `${API_BASE_URL}/api/ai/compose`,
    method: 'POST',
    body: { phone, chatId, context, tone }
  }),

  // Improve message
  improve: (phone, text, improvements = null) => ({
    url: `${API_BASE_URL}/api/ai/improve`,
    method: 'POST',
    body: { phone, text, improvements }
  }),

  // Content moderation
  moderate: (phone, text) => ({
    url: `${API_BASE_URL}/api/ai/moderate`,
    method: 'POST',
    body: { phone, text }
  }),

  // Batch analyze
  batchAnalyze: (phone, messages) => ({
    url: `${API_BASE_URL}/api/ai/batch-analyze`,
    method: 'POST',
    body: { phone, messages }
  }),

  // Get chat history
  getHistory: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/ai/history/${phone}/${chatId}`,
    method: 'GET'
  }),

  // Clear chat history
  clearHistory: (phone, chatId = null) => ({
    url: `${API_BASE_URL}/api/ai/history/clear`,
    method: 'POST',
    body: { phone, chatId }
  })
};

// ================================================================
// SECTION 12: SEARCH & STARRED
// ================================================================
export const SearchEndpoints = {
  // Search messages
  searchMessages: (phone, query, limit = 100) => ({
    url: `${API_BASE_URL}/api/search/messages`,
    method: 'POST',
    body: { phone, query, limit }
  }),

  // Search by date
  searchByDate: (phone, startDate, endDate) => ({
    url: `${API_BASE_URL}/api/search/by-date`,
    method: 'POST',
    body: { phone, startDate, endDate }
  }),

  // Search by media type
  searchByMedia: (phone, mediaType) => ({
    url: `${API_BASE_URL}/api/search/by-media`,
    method: 'POST',
    body: { phone, mediaType }
  }),

  // Get unread chats
  getUnread: (phone) => ({
    url: `${API_BASE_URL}/api/search/unread/${phone}`,
    method: 'GET'
  })
};

export const StarredEndpoints = {
  // Get all starred messages
  getAll: (phone) => ({
    url: `${API_BASE_URL}/api/starred/${phone}`,
    method: 'GET'
  }),

  // Get starred by chat
  getByChat: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/starred/${phone}/${chatId}`,
    method: 'GET'
  }),

  // Search starred
  search: (phone, query) => ({
    url: `${API_BASE_URL}/api/starred/search`,
    method: 'POST',
    body: { phone, query }
  }),

  // Unstar all
  unstarAll: (phone) => ({
    url: `${API_BASE_URL}/api/starred/unstar-all`,
    method: 'POST',
    body: { phone }
  })
};

// ================================================================
// SECTION 13: BROADCAST
// ================================================================
export const BroadcastEndpoints = {
  // Get broadcast lists
  getAll: (phone) => ({
    url: `${API_BASE_URL}/api/broadcast/${phone}`,
    method: 'GET'
  }),

  // Send broadcast
  send: (phone, recipients, message) => ({
    url: `${API_BASE_URL}/api/broadcast/send`,
    method: 'POST',
    body: { phone, recipients, message }
  })
};

// ================================================================
// EXPORT ALL
// ================================================================
export default {
  Health: HealthEndpoints,
  Chat: ChatEndpoints,
  Contact: ContactEndpoints,
  Message: MessageEndpoints,
  Status: StatusEndpoints,
  Group: GroupEndpoints,
  Channel: ChannelEndpoints,
  Call: CallEndpoints,
  Presence: PresenceEndpoints,
  Profile: ProfileEndpoints,
  Privacy: PrivacyEndpoints,
  AI: AIEndpoints,
  Search: SearchEndpoints,
  Starred: StarredEndpoints,
  Broadcast: BroadcastEndpoints,
  callAPI
};
