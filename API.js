
// ================================================================
// ConnexaBot WhatsApp API - Frontend Configuration
// Complete API endpoints organized by sections
// ================================================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     process.env.VITE_API_URL ||
                     process.env.SERVER_URL || 
                     (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null) ||
                     'http://localhost:3000';

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

  // OpenAI connection status
  openaiStatus: () => ({
    url: `${API_BASE_URL}/api/openai/status`,
    method: 'GET'
  }),

  // Connect WhatsApp (generates QR/link code)
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

  // Logout and clear session
  logout: (phone) => ({
    url: `${API_BASE_URL}/api/logout`,
    method: 'POST',
    body: { phone }
  }),

  // Clear session state
  clearState: (phoneNumber, fullReset = false) => ({
    url: `${API_BASE_URL}/api/clear-state/${phoneNumber}?fullReset=${fullReset}`,
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

  // Get chat labels (Business feature)
  getLabels: (phone) => ({
    url: `${API_BASE_URL}/api/chats/labels/${phone}`,
    method: 'GET'
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
    url: `${API_BASE_URL}/api/contacts/block`,
    method: 'POST',
    body: { phone, contactId }
  }),

  // Unblock contact
  unblock: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/unblock`,
    method: 'POST',
    body: { phone, contactId }
  }),

  // Get business profile
  getBusinessProfile: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/${phone}/${contactId}/business-profile`,
    method: 'GET'
  })
};

// ================================================================
// SECTION 3: MESSAGING
// ================================================================
export const MessageEndpoints = {
  // Get messages from chat
  get: (phone, chatId, limit = 50) => ({
    url: `${API_BASE_URL}/api/messages/${phone}/${chatId}?limit=${limit}`,
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

  // Send image
  sendImage: (phone, to, imageUrl, caption = '') => ({
    url: `${API_BASE_URL}/api/messages/send-image`,
    method: 'POST',
    body: { phone, to, imageUrl, caption }
  }),

  // Send video
  sendVideo: (phone, to, videoUrl, caption = '', gifPlayback = false) => ({
    url: `${API_BASE_URL}/api/messages/send-video`,
    method: 'POST',
    body: { phone, to, videoUrl, caption, gifPlayback }
  }),

  // Send audio
  sendAudio: (phone, to, audioUrl, ptt = false) => ({
    url: `${API_BASE_URL}/api/messages/send-audio`,
    method: 'POST',
    body: { phone, to, audioUrl, ptt }
  }),

  // Send document
  sendDocument: (phone, to, documentUrl, fileName, mimetype) => ({
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

  // Download media
  downloadMedia: (phone, messageKey) => ({
    url: `${API_BASE_URL}/api/messages/download`,
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
    url: `${API_BASE_URL}/api/messages/starred/${phone}`,
    method: 'GET'
  }),

  // Get shared media
  getSharedMedia: (phone, chatId, type = 'image') => ({
    url: `${API_BASE_URL}/api/media/${phone}/${chatId}?type=${type}`,
    method: 'GET'
  }),

  // Search messages
  search: (phone, query) => ({
    url: `${API_BASE_URL}/api/search/messages/${phone}?query=${encodeURIComponent(query)}`,
    method: 'GET'
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

  // Post image status
  postImage: (phone, imageUrl, caption = '', statusJidList = []) => ({
    url: `${API_BASE_URL}/api/status/post-image`,
    method: 'POST',
    body: { phone, imageUrl, caption, statusJidList }
  }),

  // Post video status
  postVideo: (phone, videoUrl, caption = '', statusJidList = []) => ({
    url: `${API_BASE_URL}/api/status/post-video`,
    method: 'POST',
    body: { phone, videoUrl, caption, statusJidList }
  }),

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
    url: `${API_BASE_URL}/api/groups/create`,
    method: 'POST',
    body: { phone, name, participants }
  }),

  // Get invite code
  getInviteCode: (phone, groupId) => ({
    url: `${API_BASE_URL}/api/groups/${phone}/${groupId}/invite-code`,
    method: 'GET'
  }),

  // Join via invite
  joinViaInvite: (phone, inviteCode) => ({
    url: `${API_BASE_URL}/api/groups/join-via-invite`,
    method: 'POST',
    body: { phone, inviteCode }
  }),

  // Leave group
  leave: (phone, groupId) => ({
    url: `${API_BASE_URL}/api/groups/leave`,
    method: 'POST',
    body: { phone, groupId }
  }),

  // Update subject
  updateSubject: (phone, groupId, subject) => ({
    url: `${API_BASE_URL}/api/groups/update-subject`,
    method: 'POST',
    body: { phone, groupId, subject }
  }),

  // Update description
  updateDescription: (phone, groupId, description) => ({
    url: `${API_BASE_URL}/api/groups/update-description`,
    method: 'POST',
    body: { phone, groupId, description }
  }),

  // Add participants
  addParticipants: (phone, groupId, participants) => ({
    url: `${API_BASE_URL}/api/groups/add-participants`,
    method: 'POST',
    body: { phone, groupId, participants }
  }),

  // Remove participants
  removeParticipants: (phone, groupId, participants) => ({
    url: `${API_BASE_URL}/api/groups/remove-participants`,
    method: 'POST',
    body: { phone, groupId, participants }
  }),

  // Promote participants
  promoteParticipants: (phone, groupId, participants) => ({
    url: `${API_BASE_URL}/api/groups/promote-participants`,
    method: 'POST',
    body: { phone, groupId, participants }
  }),

  // Demote participants
  demoteParticipants: (phone, groupId, participants) => ({
    url: `${API_BASE_URL}/api/groups/demote-participants`,
    method: 'POST',
    body: { phone, groupId, participants }
  }),

  // Update picture
  updatePicture: (phone, groupId, imageUrl) => ({
    url: `${API_BASE_URL}/api/groups/update-picture`,
    method: 'POST',
    body: { phone, groupId, imageUrl }
  }),

  // Toggle announcement
  toggleAnnouncement: (phone, groupId, announce = true) => ({
    url: `${API_BASE_URL}/api/groups/toggle-announcement`,
    method: 'POST',
    body: { phone, groupId, announce }
  })
};

// ================================================================
// SECTION 6: CHANNELS & COMMUNITIES
// ================================================================
export const ChannelEndpoints = {
  // Get all channels
  getAll: (phone) => ({
    url: `${API_BASE_URL}/api/channels/${phone}`,
    method: 'GET'
  }),

  // Get channel info
  getInfo: (phone, channelId) => ({
    url: `${API_BASE_URL}/api/channels/${phone}/${channelId}/info`,
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
    url: `${API_BASE_URL}/api/communities/${phone}`,
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
    url: `${API_BASE_URL}/api/presence/update`,
    method: 'POST',
    body: { phone, chatId, presence }
  }),

  // Subscribe to presence
  subscribe: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/presence/subscribe`,
    method: 'POST',
    body: { phone, contactId }
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
    url: `${API_BASE_URL}/api/profile/update-name`,
    method: 'POST',
    body: { phone, name }
  }),

  // Update status
  updateStatus: (phone, status) => ({
    url: `${API_BASE_URL}/api/profile/update-status`,
    method: 'POST',
    body: { phone, status }
  }),

  // Update picture
  updatePicture: (phone, imageUrl) => ({
    url: `${API_BASE_URL}/api/profile/update-picture`,
    method: 'POST',
    body: { phone, imageUrl }
  }),

  // Remove picture
  removePicture: (phone) => ({
    url: `${API_BASE_URL}/api/profile/remove-picture`,
    method: 'POST',
    body: { phone }
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

  // Set disappearing messages
  setDisappearingMessages: (phone, chatId, duration) => ({
    url: `${API_BASE_URL}/api/privacy/disappearing-messages`,
    method: 'POST',
    body: { phone, chatId, duration }
  })
};

// ================================================================
// SECTION 11: DEVICES
// ================================================================
export const DeviceEndpoints = {
  // Get linked devices
  getLinked: (phone) => ({
    url: `${API_BASE_URL}/api/devices/${phone}`,
    method: 'GET'
  }),

  // Unlink device
  unlink: (phone, deviceId) => ({
    url: `${API_BASE_URL}/api/devices/unlink`,
    method: 'POST',
    body: { phone, deviceId }
  })
};

// ================================================================
// SECTION 12: AI FEATURES (Requires OpenAI API Key)
// ================================================================
export const AIEndpoints = {
  // Generate smart reply
  smartReply: (phone, chatId, lastMessage, senderName) => ({
    url: `${API_BASE_URL}/api/ai/smart-reply`,
    method: 'POST',
    body: { phone, chatId, lastMessage, senderName }
  }),

  // Analyze sentiment
  sentiment: (phone, text) => ({
    url: `${API_BASE_URL}/api/ai/sentiment`,
    method: 'POST',
    body: { phone, text }
  }),

  // Translate text
  translate: (phone, text, targetLang) => ({
    url: `${API_BASE_URL}/api/ai/translate`,
    method: 'POST',
    body: { phone, text, targetLang }
  }),

  // Improve message
  improve: (phone, text, improvements) => ({
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

  // Smart compose
  compose: (phone, chatId, context, tone) => ({
    url: `${API_BASE_URL}/api/ai/compose`,
    method: 'POST',
    body: { phone, chatId, context, tone }
  }),

  // Generate AI response
  generate: (phone, chatId, userMessage, includeHistory = false) => ({
    url: `${API_BASE_URL}/api/ai/generate`,
    method: 'POST',
    body: { phone, chatId, userMessage, includeHistory }
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
  clearHistory: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/ai/history/clear`,
    method: 'POST',
    body: { phone, chatId }
  })
};

// ================================================================
// HELPER FUNCTION
// ================================================================
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

// ================================================================
// EXPORT ALL ENDPOINTS
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
  Device: DeviceEndpoints,
  AI: AIEndpoints,
  callAPI
};
