// API.js - Complete WhatsApp Backend API Endpoints Configuration
// Base URL detection for different environments

const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     process.env.VITE_API_URL ||
                     process.env.SERVER_URL || 
                     (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null) ||
                     'http://localhost:3000';

export const API_ENDPOINTS = {

  // ========== SECTION 0: HEALTH & CONNECTION ==========
  HEALTH: () => ({
    url: `${API_BASE_URL}/health`,
    method: 'GET',
    description: 'Check server health and uptime'
  }),

  API_HEALTH: () => ({
    url: `${API_BASE_URL}/api/health`,
    method: 'GET',
    description: 'Check API health and active sessions count'
  }),

  OPENAI_STATUS: () => ({
    url: `${API_BASE_URL}/api/openai/status`,
    method: 'GET',
    description: 'Check OpenAI connection status and configuration'
  }),

  CONNECT: (phone) => ({
    url: `${API_BASE_URL}/api/connect`,
    method: 'POST',
    body: { phone },
    description: 'Connect WhatsApp session and generate QR/link code'
  }),

  GET_STATUS: (phone) => ({
    url: `${API_BASE_URL}/api/status/${phone}`,
    method: 'GET',
    description: 'Check WhatsApp connection status'
  }),

  LOGOUT: (phone) => ({
    url: `${API_BASE_URL}/api/logout`,
    method: 'POST',
    body: { phone },
    description: 'Logout and clear WhatsApp session'
  }),

  CLEAR_STATE: (phoneNumber, fullReset = false) => ({
    url: `${API_BASE_URL}/api/clear-state/${phoneNumber}?fullReset=${fullReset}`,
    method: 'POST',
    description: 'Clear session state'
  }),

  // ========== SECTION 1: CHAT LIST SCREEN ==========
  GET_CHATS: (phone) => ({
    url: `${API_BASE_URL}/api/chats/${phone}`,
    method: 'GET',
    description: 'Get all chats with profile pictures'
  }),

  GET_CHAT_BY_ID: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/${phone}/${chatId}`,
    method: 'GET',
    description: 'Get specific chat by ID'
  }),

  ARCHIVE_CHAT: (phone, chatId, archive = true) => ({
    url: `${API_BASE_URL}/api/chats/archive`,
    method: 'POST',
    body: { phone, chatId, archive },
    description: 'Archive or unarchive a chat'
  }),

  PIN_CHAT: (phone, chatId, pin = true) => ({
    url: `${API_BASE_URL}/api/chats/pin`,
    method: 'POST',
    body: { phone, chatId, pin },
    description: 'Pin or unpin a chat'
  }),

  DELETE_CHAT: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/delete`,
    method: 'POST',
    body: { phone, chatId },
    description: 'Delete a chat'
  }),

  MARK_CHAT_READ: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/mark-read`,
    method: 'POST',
    body: { phone, chatId },
    description: 'Mark chat as read'
  }),

  MARK_CHAT_UNREAD: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/mark-unread`,
    method: 'POST',
    body: { phone, chatId },
    description: 'Mark chat as unread'
  }),

  MUTE_CHAT: (phone, chatId, duration = null) => ({
    url: `${API_BASE_URL}/api/chats/mute`,
    method: 'POST',
    body: { phone, chatId, duration },
    description: 'Mute or unmute a chat (duration in seconds, null to unmute)'
  }),

  CLEAR_CHAT: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/clear`,
    method: 'POST',
    body: { phone, chatId },
    description: 'Clear chat history'
  }),

  GET_ARCHIVED_CHATS: (phone) => ({
    url: `${API_BASE_URL}/api/chats/archived/${phone}`,
    method: 'GET',
    description: 'Get archived chats'
  }),

  SEARCH_CHATS: (phone, query) => ({
    url: `${API_BASE_URL}/api/chats/search/${phone}?query=${encodeURIComponent(query)}`,
    method: 'GET',
    description: 'Search chats by name or content'
  }),

  // ========== SECTION 2: CONTACT PROFILE SCREEN ==========
  GET_CONTACTS: (phone) => ({
    url: `${API_BASE_URL}/api/contacts/${phone}`,
    method: 'GET',
    description: 'Get all contacts'
  }),

  GET_CONTACT: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/${phone}/${contactId}`,
    method: 'GET',
    description: 'Get specific contact details'
  }),

  GET_CONTACT_PICTURE: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/${phone}/${contactId}/picture`,
    method: 'GET',
    description: 'Get contact profile picture'
  }),

  GET_CONTACT_STATUS: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/${phone}/${contactId}/status`,
    method: 'GET',
    description: 'Get contact status/about'
  }),

  CHECK_CONTACT_EXISTS: (phone, phoneNumber) => ({
    url: `${API_BASE_URL}/api/contacts/check-exists`,
    method: 'POST',
    body: { phone, phoneNumber },
    description: 'Check if contact exists on WhatsApp'
  }),

  BLOCK_CONTACT: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/block`,
    method: 'POST',
    body: { phone, contactId },
    description: 'Block a contact'
  }),

  UNBLOCK_CONTACT: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/unblock`,
    method: 'POST',
    body: { phone, contactId },
    description: 'Unblock a contact'
  }),

  GET_BUSINESS_PROFILE: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/${phone}/${contactId}/business-profile`,
    method: 'GET',
    description: 'Get business profile information'
  }),

  // ========== SECTION 3: STATUS/UPDATES SCREEN ==========
  GET_STATUS_UPDATES: (phone) => ({
    url: `${API_BASE_URL}/api/status-updates/${phone}`,
    method: 'GET',
    description: 'Get all status updates'
  }),

  POST_TEXT_STATUS: (phone, text, statusJidList = [], backgroundColor = '#000000', font = 0) => ({
    url: `${API_BASE_URL}/api/status/post-text`,
    method: 'POST',
    body: { phone, text, statusJidList, backgroundColor, font },
    description: 'Post text status update'
  }),

  POST_IMAGE_STATUS: (phone, imageUrl, caption = '', statusJidList = []) => ({
    url: `${API_BASE_URL}/api/status/post-image`,
    method: 'POST',
    body: { phone, imageUrl, caption, statusJidList },
    description: 'Post image status update'
  }),

  POST_VIDEO_STATUS: (phone, videoUrl, caption = '', statusJidList = []) => ({
    url: `${API_BASE_URL}/api/status/post-video`,
    method: 'POST',
    body: { phone, videoUrl, caption, statusJidList },
    description: 'Post video status update'
  }),

  DELETE_STATUS: (phone, statusKey) => ({
    url: `${API_BASE_URL}/api/status/delete`,
    method: 'POST',
    body: { phone, statusKey },
    description: 'Delete a status update'
  }),

  VIEW_STATUS: (phone, statusJid, messageKeys) => ({
    url: `${API_BASE_URL}/api/status/view`,
    method: 'POST',
    body: { phone, statusJid, messageKeys },
    description: 'View someone\'s status'
  }),

  GET_STATUS_PRIVACY: (phone) => ({
    url: `${API_BASE_URL}/api/status/privacy/${phone}`,
    method: 'GET',
    description: 'Get status privacy settings'
  }),

  // ========== SECTION 4: GROUPS SCREEN ==========
  GET_GROUPS: (phone) => ({
    url: `${API_BASE_URL}/api/groups/${phone}`,
    method: 'GET',
    description: 'Get all groups'
  }),

  GET_GROUP_METADATA: (phone, groupId) => ({
    url: `${API_BASE_URL}/api/groups/${phone}/${groupId}/metadata`,
    method: 'GET',
    description: 'Get group metadata and participants'
  }),

  CREATE_GROUP: (phone, name, participants) => ({
    url: `${API_BASE_URL}/api/groups/create`,
    method: 'POST',
    body: { phone, name, participants },
    description: 'Create a new group'
  }),

  GET_GROUP_INVITE_CODE: (phone, groupId) => ({
    url: `${API_BASE_URL}/api/groups/${phone}/${groupId}/invite-code`,
    method: 'GET',
    description: 'Get group invite code'
  }),

  JOIN_GROUP_VIA_INVITE: (phone, inviteCode) => ({
    url: `${API_BASE_URL}/api/groups/join-via-invite`,
    method: 'POST',
    body: { phone, inviteCode },
    description: 'Join group via invite code'
  }),

  LEAVE_GROUP: (phone, groupId) => ({
    url: `${API_BASE_URL}/api/groups/leave`,
    method: 'POST',
    body: { phone, groupId },
    description: 'Leave a group'
  }),

  UPDATE_GROUP_SUBJECT: (phone, groupId, subject) => ({
    url: `${API_BASE_URL}/api/groups/update-subject`,
    method: 'POST',
    body: { phone, groupId, subject },
    description: 'Update group name/subject'
  }),

  UPDATE_GROUP_DESCRIPTION: (phone, groupId, description) => ({
    url: `${API_BASE_URL}/api/groups/update-description`,
    method: 'POST',
    body: { phone, groupId, description },
    description: 'Update group description'
  }),

  ADD_GROUP_PARTICIPANTS: (phone, groupId, participants) => ({
    url: `${API_BASE_URL}/api/groups/add-participants`,
    method: 'POST',
    body: { phone, groupId, participants },
    description: 'Add participants to group'
  }),

  REMOVE_GROUP_PARTICIPANTS: (phone, groupId, participants) => ({
    url: `${API_BASE_URL}/api/groups/remove-participants`,
    method: 'POST',
    body: { phone, groupId, participants },
    description: 'Remove participants from group'
  }),

  PROMOTE_GROUP_PARTICIPANTS: (phone, groupId, participants) => ({
    url: `${API_BASE_URL}/api/groups/promote-participants`,
    method: 'POST',
    body: { phone, groupId, participants },
    description: 'Promote participants to admin'
  }),

  DEMOTE_GROUP_PARTICIPANTS: (phone, groupId, participants) => ({
    url: `${API_BASE_URL}/api/groups/demote-participants`,
    method: 'POST',
    body: { phone, groupId, participants },
    description: 'Demote participants from admin'
  }),

  UPDATE_GROUP_PICTURE: (phone, groupId, imageUrl) => ({
    url: `${API_BASE_URL}/api/groups/update-picture`,
    method: 'POST',
    body: { phone, groupId, imageUrl },
    description: 'Update group picture'
  }),

  TOGGLE_GROUP_ANNOUNCEMENT: (phone, groupId, announce = true) => ({
    url: `${API_BASE_URL}/api/groups/toggle-announcement`,
    method: 'POST',
    body: { phone, groupId, announce },
    description: 'Toggle announcement mode (only admins can send)'
  }),

  // ========== SECTION 5: CHANNELS SCREEN ==========
  GET_CHANNELS: (phone) => ({
    url: `${API_BASE_URL}/api/channels/${phone}`,
    method: 'GET',
    description: 'Get all channels'
  }),

  GET_CHANNEL_INFO: (phone, channelId) => ({
    url: `${API_BASE_URL}/api/channels/${phone}/${channelId}/info`,
    method: 'GET',
    description: 'Get channel information'
  }),

  FOLLOW_CHANNEL: (phone, channelJid) => ({
    url: `${API_BASE_URL}/api/channels/follow`,
    method: 'POST',
    body: { phone, channelJid },
    description: 'Follow a channel'
  }),

  UNFOLLOW_CHANNEL: (phone, channelJid) => ({
    url: `${API_BASE_URL}/api/channels/unfollow`,
    method: 'POST',
    body: { phone, channelJid },
    description: 'Unfollow a channel'
  }),

  MUTE_CHANNEL: (phone, channelJid, duration = null) => ({
    url: `${API_BASE_URL}/api/channels/mute`,
    method: 'POST',
    body: { phone, channelJid, duration },
    description: 'Mute or unmute a channel'
  }),

  // ========== SECTION 6: COMMUNITIES SCREEN ==========
  GET_COMMUNITIES: (phone) => ({
    url: `${API_BASE_URL}/api/communities/${phone}`,
    method: 'GET',
    description: 'Get all communities'
  }),

  // ========== SECTION 7: CHAT VIEW/MESSAGING ==========
  GET_MESSAGES: (phone, chatId, limit = 50) => ({
    url: `${API_BASE_URL}/api/messages/${phone}/${chatId}?limit=${limit}`,
    method: 'GET',
    description: 'Get messages from a chat'
  }),

  SEND_MESSAGE: (phone, to, text, mentions = []) => ({
    url: `${API_BASE_URL}/api/messages/send`,
    method: 'POST',
    body: { phone, to, text, mentions },
    description: 'Send text message (with optional mentions)'
  }),

  REPLY_MESSAGE: (phone, to, text, quotedMessage) => ({
    url: `${API_BASE_URL}/api/messages/reply`,
    method: 'POST',
    body: { phone, to, text, quotedMessage },
    description: 'Reply to a message'
  }),

  SEND_IMAGE: (phone, to, imageUrl, caption = '') => ({
    url: `${API_BASE_URL}/api/messages/send-image`,
    method: 'POST',
    body: { phone, to, imageUrl, caption },
    description: 'Send image message'
  }),

  SEND_VIDEO: (phone, to, videoUrl, caption = '', gifPlayback = false) => ({
    url: `${API_BASE_URL}/api/messages/send-video`,
    method: 'POST',
    body: { phone, to, videoUrl, caption, gifPlayback },
    description: 'Send video message'
  }),

  SEND_AUDIO: (phone, to, audioUrl, ptt = false) => ({
    url: `${API_BASE_URL}/api/messages/send-audio`,
    method: 'POST',
    body: { phone, to, audioUrl, ptt },
    description: 'Send audio message (ptt = push-to-talk/voice note)'
  }),

  SEND_DOCUMENT: (phone, to, documentUrl, fileName, mimetype) => ({
    url: `${API_BASE_URL}/api/messages/send-document`,
    method: 'POST',
    body: { phone, to, documentUrl, fileName, mimetype },
    description: 'Send document message'
  }),

  SEND_LOCATION: (phone, to, latitude, longitude, name = '', address = '') => ({
    url: `${API_BASE_URL}/api/messages/send-location`,
    method: 'POST',
    body: { phone, to, latitude, longitude, name, address },
    description: 'Send location message'
  }),

  SEND_CONTACT: (phone, to, contacts) => ({
    url: `${API_BASE_URL}/api/messages/send-contact`,
    method: 'POST',
    body: { phone, to, contacts },
    description: 'Send contact card(s)'
  }),

  SEND_POLL: (phone, to, name, options, selectableCount = 1) => ({
    url: `${API_BASE_URL}/api/messages/send-poll`,
    method: 'POST',
    body: { phone, to, name, options, selectableCount },
    description: 'Send poll message'
  }),

  SEND_LIST: (phone, to, text, buttonText, sections, footer = '', title = '') => ({
    url: `${API_BASE_URL}/api/messages/send-list`,
    method: 'POST',
    body: { phone, to, text, buttonText, sections, footer, title },
    description: 'Send list message'
  }),

  FORWARD_MESSAGE: (phone, to, message) => ({
    url: `${API_BASE_URL}/api/messages/forward`,
    method: 'POST',
    body: { phone, to, message },
    description: 'Forward a message'
  }),

  DELETE_MESSAGE: (phone, chatId, messageKey) => ({
    url: `${API_BASE_URL}/api/messages/delete`,
    method: 'POST',
    body: { phone, chatId, messageKey },
    description: 'Delete a message'
  }),

  REACT_TO_MESSAGE: (phone, chatId, messageKey, emoji) => ({
    url: `${API_BASE_URL}/api/messages/react`,
    method: 'POST',
    body: { phone, chatId, messageKey, emoji },
    description: 'React to a message with emoji'
  }),

  EDIT_MESSAGE: (phone, chatId, messageKey, newText) => ({
    url: `${API_BASE_URL}/api/messages/edit`,
    method: 'POST',
    body: { phone, chatId, messageKey, newText },
    description: 'Edit a message'
  }),

  STAR_MESSAGE: (phone, chatId, messageKey, star = true) => ({
    url: `${API_BASE_URL}/api/messages/star`,
    method: 'POST',
    body: { phone, chatId, messageKey, star },
    description: 'Star or unstar a message'
  }),

  DOWNLOAD_MEDIA: (phone, messageKey) => ({
    url: `${API_BASE_URL}/api/messages/download`,
    method: 'POST',
    body: { phone, messageKey },
    description: 'Download media from message'
  }),

  SEND_BROADCAST: (phone, recipients, message) => ({
    url: `${API_BASE_URL}/api/messages/send-broadcast`,
    method: 'POST',
    body: { phone, recipients, message },
    description: 'Send broadcast message to multiple recipients'
  }),

  // ========== SECTION 8: CALLS ==========
  GET_CALL_HISTORY: (phone) => ({
    url: `${API_BASE_URL}/api/calls/${phone}`,
    method: 'GET',
    description: 'Get call history'
  }),

  // ========== SECTION 9: PRESENCE & TYPING ==========
  UPDATE_PRESENCE: (phone, chatId, presence) => ({
    url: `${API_BASE_URL}/api/presence/update`,
    method: 'POST',
    body: { phone, chatId, presence },
    description: 'Update presence (composing, recording, available, unavailable)'
  }),

  SUBSCRIBE_PRESENCE: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/presence/subscribe`,
    method: 'POST',
    body: { phone, contactId },
    description: 'Subscribe to contact presence updates'
  }),

  // ========== SECTION 10: PROFILE SETTINGS ==========
  GET_PROFILE: (phone) => ({
    url: `${API_BASE_URL}/api/profile/${phone}`,
    method: 'GET',
    description: 'Get own profile information'
  }),

  UPDATE_PROFILE_NAME: (phone, name) => ({
    url: `${API_BASE_URL}/api/profile/update-name`,
    method: 'POST',
    body: { phone, name },
    description: 'Update profile name'
  }),

  UPDATE_PROFILE_STATUS: (phone, status) => ({
    url: `${API_BASE_URL}/api/profile/update-status`,
    method: 'POST',
    body: { phone, status },
    description: 'Update profile status/about'
  }),

  UPDATE_PROFILE_PICTURE: (phone, imageUrl) => ({
    url: `${API_BASE_URL}/api/profile/update-picture`,
    method: 'POST',
    body: { phone, imageUrl },
    description: 'Update profile picture'
  }),

  REMOVE_PROFILE_PICTURE: (phone) => ({
    url: `${API_BASE_URL}/api/profile/remove-picture`,
    method: 'POST',
    body: { phone },
    description: 'Remove profile picture'
  }),

  // ========== SECTION 11: PRIVACY SETTINGS ==========
  GET_PRIVACY_SETTINGS: (phone) => ({
    url: `${API_BASE_URL}/api/privacy/settings/${phone}`,
    method: 'GET',
    description: 'Get privacy settings'
  }),

  UPDATE_PRIVACY_SETTINGS: (phone, setting, value) => ({
    url: `${API_BASE_URL}/api/privacy/settings/update`,
    method: 'POST',
    body: { phone, setting, value },
    description: 'Update privacy settings'
  }),

  GET_BLOCKED_CONTACTS: (phone) => ({
    url: `${API_BASE_URL}/api/privacy/blocked/${phone}`,
    method: 'GET',
    description: 'Get blocked contacts list'
  }),

  SET_DISAPPEARING_MESSAGES: (phone, chatId, duration) => ({
    url: `${API_BASE_URL}/api/privacy/disappearing-messages`,
    method: 'POST',
    body: { phone, chatId, duration },
    description: 'Set disappearing messages duration'
  }),

  // ========== SECTION 12: STARRED MESSAGES ==========
  GET_STARRED_MESSAGES: (phone) => ({
    url: `${API_BASE_URL}/api/messages/starred/${phone}`,
    method: 'GET',
    description: 'Get all starred messages'
  }),

  // ========== SECTION 13: MEDIA GALLERY ==========
  GET_SHARED_MEDIA: (phone, chatId, type = 'image') => ({
    url: `${API_BASE_URL}/api/media/${phone}/${chatId}?type=${type}`,
    method: 'GET',
    description: 'Get shared media from chat (type: image, video, document, etc.)'
  }),

  // ========== SECTION 15: SEARCH ==========
  SEARCH_MESSAGES: (phone, query) => ({
    url: `${API_BASE_URL}/api/search/messages/${phone}?query=${encodeURIComponent(query)}`,
    method: 'GET',
    description: 'Search messages globally'
  }),

  // ========== SECTION 16: DEVICES & MULTI-DEVICE ==========
  GET_LINKED_DEVICES: (phone) => ({
    url: `${API_BASE_URL}/api/devices/${phone}`,
    method: 'GET',
    description: 'Get all linked devices'
  }),

  UNLINK_DEVICE: (phone, deviceId) => ({
    url: `${API_BASE_URL}/api/devices/unlink`,
    method: 'POST',
    body: { phone, deviceId },
    description: 'Unlink a specific device'
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

// Usage examples:
// const result = await callAPI(API_ENDPOINTS.GET_CHATS('1234567890'));
// const result = await callAPI(API_ENDPOINTS.SEND_MESSAGE('1234567890', '9876543210@s.whatsapp.net', 'Hello!'));

export default API_ENDPOINTS;