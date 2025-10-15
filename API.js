
// ===============================
// 🌐 ConnexaBot Complete API Reference
// ===============================
// 100% Coverage of all WhatsApp Backend Endpoints

const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     process.env.VITE_API_URL ||
                     process.env.SERVER_URL || 
                     (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null) ||
                     'http://localhost:3000';

export const API_ENDPOINTS = {
  
  // ========== HEALTH & CONNECTION ==========
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
  
  CLEAR_STATE: (phone, fullReset = false) => ({
    url: `${API_BASE_URL}/api/clear-state/${phone}?fullReset=${fullReset}`,
    method: 'POST',
    description: 'Clear session state (partial or full reset)'
  }),
  
  // ========== CHATS ==========
  GET_CHATS: (phone) => ({
    url: `${API_BASE_URL}/api/chats/${phone}`,
    method: 'GET',
    description: 'Get all chats with profile pictures, names, and last messages (sorted by recent)'
  }),

  GET_CHAT_BY_ID: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/${phone}/${chatId}`,
    method: 'GET',
    description: 'Get specific chat details'
  }),

  GET_ARCHIVED_CHATS: (phone) => ({
    url: `${API_BASE_URL}/api/chats/archived/${phone}`,
    method: 'GET',
    description: 'Get all archived chats'
  }),

  SEARCH_CHATS: (phone, query) => ({
    url: `${API_BASE_URL}/api/chats/search/${phone}?q=${encodeURIComponent(query)}`,
    method: 'GET',
    description: 'Search chats by name or message content'
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

  MUTE_CHAT: (phone, chatId, duration) => ({
    url: `${API_BASE_URL}/api/chats/mute`,
    method: 'POST',
    body: { phone, chatId, duration },
    description: 'Mute chat for specified duration (ms), null to unmute'
  }),

  MARK_CHAT_READ: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/mark-read`,
    method: 'POST',
    body: { phone, chatId },
    description: 'Mark all messages in chat as read'
  }),

  MARK_CHAT_UNREAD: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/mark-unread`,
    method: 'POST',
    body: { phone, chatId },
    description: 'Mark chat as unread'
  }),

  DELETE_CHAT: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/delete`,
    method: 'POST',
    body: { phone, chatId },
    description: 'Delete entire chat'
  }),

  CLEAR_CHAT: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/chats/clear`,
    method: 'POST',
    body: { phone, chatId },
    description: 'Clear chat messages (keeps chat)'
  }),

  GET_CHAT_LABELS: (phone) => ({
    url: `${API_BASE_URL}/api/chats/labels/${phone}`,
    method: 'GET',
    description: 'Get all chat labels'
  }),

  ADD_CHAT_LABEL: (phone, chatId, labelId) => ({
    url: `${API_BASE_URL}/api/chats/label/add`,
    method: 'POST',
    body: { phone, chatId, labelId },
    description: 'Add label to chat'
  }),

  REMOVE_CHAT_LABEL: (phone, chatId, labelId) => ({
    url: `${API_BASE_URL}/api/chats/label/remove`,
    method: 'POST',
    body: { phone, chatId, labelId },
    description: 'Remove label from chat'
  }),
  
  // ========== MESSAGES ==========
  GET_MESSAGES: (phone, chatId, limit = 50) => ({
    url: `${API_BASE_URL}/api/messages/${phone}/${chatId}?limit=${limit}`,
    method: 'GET',
    description: 'Get messages from a specific chat'
  }),

  SEND_MESSAGE: (phone, to, text, mentions = []) => ({
    url: `${API_BASE_URL}/api/messages/send`,
    method: 'POST',
    body: { phone, to, text, mentions },
    description: 'Send text message with optional mentions'
  }),

  REPLY_MESSAGE: (phone, to, text, quotedMessage) => ({
    url: `${API_BASE_URL}/api/messages/reply`,
    method: 'POST',
    body: { phone, to, text, quotedMessage },
    description: 'Reply to a specific message'
  }),

  SEND_IMAGE: (phone, to, imageUrl, caption = '') => ({
    url: `${API_BASE_URL}/api/messages/send-image`,
    method: 'POST',
    body: { phone, to, imageUrl, caption },
    description: 'Send image with optional caption'
  }),

  SEND_VIDEO: (phone, to, videoUrl, caption = '', gifPlayback = false) => ({
    url: `${API_BASE_URL}/api/messages/send-video`,
    method: 'POST',
    body: { phone, to, videoUrl, caption, gifPlayback },
    description: 'Send video with optional caption and GIF mode'
  }),

  SEND_AUDIO: (phone, to, audioUrl, ptt = false) => ({
    url: `${API_BASE_URL}/api/messages/send-audio`,
    method: 'POST',
    body: { phone, to, audioUrl, ptt },
    description: 'Send audio (ptt=true for voice note)'
  }),

  SEND_DOCUMENT: (phone, to, documentUrl, fileName, mimetype) => ({
    url: `${API_BASE_URL}/api/messages/send-document`,
    method: 'POST',
    body: { phone, to, documentUrl, fileName, mimetype },
    description: 'Send document file'
  }),

  SEND_LOCATION: (phone, to, latitude, longitude, name = '', address = '') => ({
    url: `${API_BASE_URL}/api/messages/send-location`,
    method: 'POST',
    body: { phone, to, latitude, longitude, name, address },
    description: 'Send location with coordinates'
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
    description: 'Send poll with options'
  }),

  SEND_LIST: (phone, to, text, buttonText, sections, footer = '', title = '') => ({
    url: `${API_BASE_URL}/api/messages/send-list`,
    method: 'POST',
    body: { phone, to, text, buttonText, sections, footer, title },
    description: 'Send interactive list message'
  }),

  SEND_BUTTONS: (phone, to, text, buttons, footer = '', header = '') => ({
    url: `${API_BASE_URL}/api/messages/send-buttons`,
    method: 'POST',
    body: { phone, to, text, buttons, footer, header },
    description: 'Send button message'
  }),

  SEND_BROADCAST: (phone, recipients, message) => ({
    url: `${API_BASE_URL}/api/messages/send-broadcast`,
    method: 'POST',
    body: { phone, recipients, message },
    description: 'Broadcast message to multiple recipients'
  }),

  DOWNLOAD_MEDIA: (phone, messageKey) => ({
    url: `${API_BASE_URL}/api/messages/download`,
    method: 'POST',
    body: { phone, messageKey },
    description: 'Download media from message'
  }),

  DELETE_MESSAGE: (phone, chatId, messageKey) => ({
    url: `${API_BASE_URL}/api/messages/delete`,
    method: 'POST',
    body: { phone, chatId, messageKey },
    description: 'Delete message for everyone'
  }),

  FORWARD_MESSAGE: (phone, to, message) => ({
    url: `${API_BASE_URL}/api/messages/forward`,
    method: 'POST',
    body: { phone, to, message },
    description: 'Forward message to another chat'
  }),

  REACT_MESSAGE: (phone, chatId, messageKey, emoji) => ({
    url: `${API_BASE_URL}/api/messages/react`,
    method: 'POST',
    body: { phone, chatId, messageKey, emoji },
    description: 'React to message with emoji'
  }),

  EDIT_MESSAGE: (phone, chatId, messageKey, newText) => ({
    url: `${API_BASE_URL}/api/messages/edit`,
    method: 'POST',
    body: { phone, chatId, messageKey, newText },
    description: 'Edit sent message'
  }),

  STAR_MESSAGE: (phone, chatId, messageKey, star = true) => ({
    url: `${API_BASE_URL}/api/messages/star`,
    method: 'POST',
    body: { phone, chatId, messageKey, star },
    description: 'Star or unstar message'
  }),

  MARK_MESSAGE_READ: (phone, messageKey) => ({
    url: `${API_BASE_URL}/api/messages/read`,
    method: 'POST',
    body: { phone, messageKey },
    description: 'Mark specific message as read'
  }),

  GET_STARRED_MESSAGES: (phone) => ({
    url: `${API_BASE_URL}/api/starred/${phone}`,
    method: 'GET',
    description: 'Get all starred messages'
  }),

  // ========== STATUS/STORY ==========
  GET_STATUS_UPDATES: (phone) => ({
    url: `${API_BASE_URL}/api/status-updates/${phone}`,
    method: 'GET',
    description: 'Get all status updates'
  }),

  POST_TEXT_STATUS: (phone, text, statusJidList = [], backgroundColor = '', font = '') => ({
    url: `${API_BASE_URL}/api/status/post-text`,
    method: 'POST',
    body: { phone, text, statusJidList, backgroundColor, font },
    description: 'Post text status/story'
  }),

  POST_IMAGE_STATUS: (phone, imageUrl, caption = '', statusJidList = []) => ({
    url: `${API_BASE_URL}/api/status/post-image`,
    method: 'POST',
    body: { phone, imageUrl, caption, statusJidList },
    description: 'Post image status/story'
  }),

  POST_VIDEO_STATUS: (phone, videoUrl, caption = '', statusJidList = []) => ({
    url: `${API_BASE_URL}/api/status/post-video`,
    method: 'POST',
    body: { phone, videoUrl, caption, statusJidList },
    description: 'Post video status/story'
  }),

  POST_AUDIO_STATUS: (phone, audioUrl, statusJidList = []) => ({
    url: `${API_BASE_URL}/api/status/post-audio`,
    method: 'POST',
    body: { phone, audioUrl, statusJidList },
    description: 'Post audio status/story'
  }),

  DELETE_STATUS: (phone, statusKey) => ({
    url: `${API_BASE_URL}/api/status/delete`,
    method: 'POST',
    body: { phone, statusKey },
    description: 'Delete your status'
  }),

  VIEW_STATUS: (phone, statusJid, messageKeys) => ({
    url: `${API_BASE_URL}/api/status/view`,
    method: 'POST',
    body: { phone, statusJid, messageKeys },
    description: 'Mark status as viewed'
  }),

  GET_STATUS_PRIVACY: (phone) => ({
    url: `${API_BASE_URL}/api/status/privacy/${phone}`,
    method: 'GET',
    description: 'Get status privacy settings'
  }),
  
  // ========== GROUPS ==========
  GET_GROUPS: (phone) => ({
    url: `${API_BASE_URL}/api/groups/${phone}`,
    method: 'GET',
    description: 'Get all groups'
  }),

  CREATE_GROUP: (phone, name, participants) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'create', name, participants },
    description: 'Create new group'
  }),

  ADD_PARTICIPANTS: (phone, groupId, participants) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'add', groupId, participants },
    description: 'Add participants to group'
  }),

  REMOVE_PARTICIPANTS: (phone, groupId, participants) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'remove', groupId, participants },
    description: 'Remove participants from group'
  }),

  PROMOTE_PARTICIPANTS: (phone, groupId, participants) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'promote', groupId, participants },
    description: 'Promote participants to admin'
  }),

  DEMOTE_PARTICIPANTS: (phone, groupId, participants) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'demote', groupId, participants },
    description: 'Demote admins to participants'
  }),

  UPDATE_GROUP_SUBJECT: (phone, groupId, subject) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'updateSubject', groupId, subject },
    description: 'Update group name'
  }),

  UPDATE_GROUP_DESCRIPTION: (phone, groupId, description) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'updateDescription', groupId, description },
    description: 'Update group description'
  }),

  UPDATE_GROUP_SETTINGS: (phone, groupId, setting) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'updateSettings', groupId, setting },
    description: 'Update group settings (announcement/not_announcement)'
  }),

  LEAVE_GROUP: (phone, groupId) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'leave', groupId },
    description: 'Leave a group'
  }),

  GET_GROUP_INVITE_CODE: (phone, groupId) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'getInviteCode', groupId },
    description: 'Get group invite code'
  }),

  REVOKE_GROUP_INVITE: (phone, groupId) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'revokeInviteCode', groupId },
    description: 'Revoke and generate new invite code'
  }),

  ACCEPT_GROUP_INVITE: (phone, inviteCode) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'acceptInvite', inviteCode },
    description: 'Join group using invite code'
  }),

  GET_GROUP_METADATA: (phone, groupId) => ({
    url: `${API_BASE_URL}/api/groups/action`,
    method: 'POST',
    body: { phone, action: 'getMetadata', groupId },
    description: 'Get group metadata'
  }),

  // ========== CONTACTS ==========
  GET_CONTACTS: (phone) => ({
    url: `${API_BASE_URL}/api/contacts/${phone}`,
    method: 'GET',
    description: 'Get all contacts'
  }),

  GET_CONTACT: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/get/${phone}/${contactId}`,
    method: 'GET',
    description: 'Get specific contact'
  }),

  GET_CONTACT_STATUS: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/status/${phone}/${contactId}`,
    method: 'GET',
    description: 'Get contact status/about'
  }),

  GET_PROFILE_PICTURE: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/contacts/picture/${phone}/${contactId}`,
    method: 'GET',
    description: 'Get contact profile picture'
  }),

  CHECK_CONTACT_EXISTS: (phone, phoneNumber) => ({
    url: `${API_BASE_URL}/api/contacts/check/${phone}/${phoneNumber}`,
    method: 'GET',
    description: 'Check if contact exists on WhatsApp'
  }),

  BLOCK_CONTACT: (phone, jid) => ({
    url: `${API_BASE_URL}/api/contacts/action`,
    method: 'POST',
    body: { phone, action: 'block', jid },
    description: 'Block a contact'
  }),

  UNBLOCK_CONTACT: (phone, jid) => ({
    url: `${API_BASE_URL}/api/contacts/action`,
    method: 'POST',
    body: { phone, action: 'unblock', jid },
    description: 'Unblock a contact'
  }),

  GET_BLOCKED_CONTACTS: (phone) => ({
    url: `${API_BASE_URL}/api/contacts/action`,
    method: 'POST',
    body: { phone, action: 'blocked' },
    description: 'Get blocked contacts list'
  }),

  // ========== PRESENCE ==========
  UPDATE_PRESENCE: (phone, chatId, presence) => ({
    url: `${API_BASE_URL}/api/presence/update`,
    method: 'POST',
    body: { phone, chatId, presence },
    description: 'Update presence (composing, recording, available, unavailable, paused)'
  }),

  SUBSCRIBE_PRESENCE: (phone, contactId) => ({
    url: `${API_BASE_URL}/api/presence/subscribe`,
    method: 'POST',
    body: { phone, contactId },
    description: 'Subscribe to presence updates'
  }),

  // ========== PROFILE ==========
  GET_PROFILE: (phone) => ({
    url: `${API_BASE_URL}/api/profile/${phone}`,
    method: 'GET',
    description: 'Get profile information'
  }),

  UPDATE_PROFILE_NAME: (phone, name) => ({
    url: `${API_BASE_URL}/api/profile/action`,
    method: 'POST',
    body: { phone, action: 'updateName', name },
    description: 'Update profile name'
  }),

  UPDATE_PROFILE_STATUS: (phone, status) => ({
    url: `${API_BASE_URL}/api/profile/action`,
    method: 'POST',
    body: { phone, action: 'updateStatus', status },
    description: 'Update profile status/about'
  }),

  UPDATE_PROFILE_PICTURE: (phone, jid, imageBuffer) => ({
    url: `${API_BASE_URL}/api/profile/action`,
    method: 'POST',
    body: { phone, action: 'updatePicture', jid, imageBuffer },
    description: 'Update profile picture'
  }),

  REMOVE_PROFILE_PICTURE: (phone, jid) => ({
    url: `${API_BASE_URL}/api/profile/action`,
    method: 'POST',
    body: { phone, action: 'removePicture', jid },
    description: 'Remove profile picture'
  }),

  GET_PROFILE_PICTURE_URL: (phone, jid) => ({
    url: `${API_BASE_URL}/api/profile/action`,
    method: 'POST',
    body: { phone, action: 'getPicture', jid },
    description: 'Get profile picture URL'
  }),

  // ========== AI AUTOMATION ==========
  AI_SMART_REPLY: (phone, chatId, lastMessage, senderName = 'User', relationship = 'friend') => ({
    url: `${API_BASE_URL}/api/ai/smart-reply`,
    method: 'POST',
    body: { phone, chatId, lastMessage, senderName, relationship },
    description: 'Generate smart reply suggestions using AI'
  }),

  AI_AUTO_REPLY: (phone, chatId, to, message, settings = {}) => ({
    url: `${API_BASE_URL}/api/ai/auto-reply`,
    method: 'POST',
    body: { phone, chatId, to, message, settings },
    description: 'Auto-reply with AI-generated response'
  }),

  AI_GENERATE: (phone, chatId, userMessage, systemPrompt = '', maxTokens = 500, includeHistory = true) => ({
    url: `${API_BASE_URL}/api/ai/generate`,
    method: 'POST',
    body: { phone, chatId, userMessage, systemPrompt, maxTokens, includeHistory },
    description: 'Generate AI response with conversation context'
  }),

  AI_SENTIMENT: (phone, text) => ({
    url: `${API_BASE_URL}/api/ai/sentiment`,
    method: 'POST',
    body: { phone, text },
    description: 'Analyze text sentiment'
  }),

  AI_ANALYZE_IMAGE: (phone, base64Image, prompt = '') => ({
    url: `${API_BASE_URL}/api/ai/analyze-image`,
    method: 'POST',
    body: { phone, base64Image, prompt },
    description: 'Analyze image with AI vision'
  }),

  AI_TRANSCRIBE: (phone, audioFilePath) => ({
    url: `${API_BASE_URL}/api/ai/transcribe`,
    method: 'POST',
    body: { phone, audioFilePath },
    description: 'Transcribe audio to text'
  }),

  AI_SUMMARIZE: (phone, chatId, messageCount = 20) => ({
    url: `${API_BASE_URL}/api/ai/summarize`,
    method: 'POST',
    body: { phone, chatId, messageCount },
    description: 'Summarize conversation'
  }),

  AI_TRANSLATE: (phone, text, targetLang) => ({
    url: `${API_BASE_URL}/api/ai/translate`,
    method: 'POST',
    body: { phone, text, targetLang },
    description: 'Translate text to target language'
  }),

  AI_COMPOSE: (phone, chatId, context, tone = 'friendly') => ({
    url: `${API_BASE_URL}/api/ai/compose`,
    method: 'POST',
    body: { phone, chatId, context, tone },
    description: 'Compose message with AI'
  }),

  AI_IMPROVE: (phone, text, improvements = ['grammar', 'clarity', 'tone']) => ({
    url: `${API_BASE_URL}/api/ai/improve`,
    method: 'POST',
    body: { phone, text, improvements },
    description: 'Improve message quality'
  }),

  AI_MODERATE: (phone, text) => ({
    url: `${API_BASE_URL}/api/ai/moderate`,
    method: 'POST',
    body: { phone, text },
    description: 'Check content safety/moderation'
  }),

  AI_BATCH_ANALYZE: (phone, messages) => ({
    url: `${API_BASE_URL}/api/ai/batch-analyze`,
    method: 'POST',
    body: { phone, messages },
    description: 'Analyze multiple messages in batch'
  }),

  AI_GET_HISTORY: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/ai/history/${phone}/${chatId}`,
    method: 'GET',
    description: 'Get AI chat history'
  }),

  AI_CLEAR_HISTORY: (phone, chatId = null) => ({
    url: `${API_BASE_URL}/api/ai/history/clear`,
    method: 'POST',
    body: { phone, chatId },
    description: 'Clear AI chat history'
  }),

  // ========== CHANNELS ==========
  GET_CHANNELS: (phone) => ({
    url: `${API_BASE_URL}/api/channels/${phone}`,
    method: 'GET',
    description: 'Get all channels'
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

  GET_CHANNEL_METADATA: (phone, channelJid) => ({
    url: `${API_BASE_URL}/api/channels/metadata/${phone}/${channelJid}`,
    method: 'GET',
    description: 'Get channel metadata'
  }),

  MUTE_CHANNEL: (phone, channelJid, duration) => ({
    url: `${API_BASE_URL}/api/channels/mute`,
    method: 'POST',
    body: { phone, channelJid, duration },
    description: 'Mute channel notifications'
  }),

  GET_COMMUNITIES: (phone) => ({
    url: `${API_BASE_URL}/api/channels/communities/${phone}`,
    method: 'GET',
    description: 'Get all communities'
  }),

  // ========== CALLS ==========
  GET_CALLS: (phone) => ({
    url: `${API_BASE_URL}/api/calls/${phone}`,
    method: 'GET',
    description: 'Get call history'
  }),

  // ========== PRIVACY & SECURITY ==========
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

  GET_BLOCKED_USERS: (phone) => ({
    url: `${API_BASE_URL}/api/privacy/blocked/${phone}`,
    method: 'GET',
    description: 'Get blocked contacts list'
  }),

  BLOCK_USER: (phone, jid) => ({
    url: `${API_BASE_URL}/api/privacy/block`,
    method: 'POST',
    body: { phone, jid },
    description: 'Block a contact'
  }),

  UNBLOCK_USER: (phone, jid) => ({
    url: `${API_BASE_URL}/api/privacy/unblock`,
    method: 'POST',
    body: { phone, jid },
    description: 'Unblock a contact'
  }),

  SET_DISAPPEARING_MESSAGES: (phone, chatId, duration) => ({
    url: `${API_BASE_URL}/api/privacy/disappearing-messages`,
    method: 'POST',
    body: { phone, chatId, duration },
    description: 'Set disappearing messages timer'
  }),

  GET_BUSINESS_PROFILE: (phone, jid) => ({
    url: `${API_BASE_URL}/api/privacy/business-profile/${phone}/${jid}`,
    method: 'GET',
    description: 'Get business profile information'
  }),

  // ========== SEARCH ==========
  SEARCH_MESSAGES: (phone, query, chatId = null) => ({
    url: `${API_BASE_URL}/api/search/messages/${phone}?q=${encodeURIComponent(query)}${chatId ? `&chatId=${chatId}` : ''}`,
    method: 'GET',
    description: 'Search messages globally or in specific chat'
  }),

  SEARCH_CONTACTS: (phone, query) => ({
    url: `${API_BASE_URL}/api/search/contacts/${phone}?q=${encodeURIComponent(query)}`,
    method: 'GET',
    description: 'Search contacts'
  }),

  // ========== BROADCAST ==========
  CREATE_BROADCAST_LIST: (phone, name, recipients) => ({
    url: `${API_BASE_URL}/api/broadcast/create`,
    method: 'POST',
    body: { phone, name, recipients },
    description: 'Create broadcast list'
  }),

  GET_BROADCAST_LISTS: (phone) => ({
    url: `${API_BASE_URL}/api/broadcast/${phone}`,
    method: 'GET',
    description: 'Get all broadcast lists'
  }),

  SEND_TO_BROADCAST: (phone, broadcastId, message) => ({
    url: `${API_BASE_URL}/api/broadcast/send`,
    method: 'POST',
    body: { phone, broadcastId, message },
    description: 'Send message to broadcast list'
  }),

  // ========== ADVANCED SEARCH ==========
  SEARCH_MESSAGES_GLOBAL: (phone, query, limit = 100) => ({
    url: `${API_BASE_URL}/api/search/messages`,
    method: 'POST',
    body: { phone, query, limit },
    description: 'Search messages globally across all chats'
  }),

  SEARCH_BY_DATE: (phone, startDate, endDate) => ({
    url: `${API_BASE_URL}/api/search/by-date`,
    method: 'POST',
    body: { phone, startDate, endDate },
    description: 'Search messages by date range'
  }),

  SEARCH_BY_MEDIA_TYPE: (phone, mediaType) => ({
    url: `${API_BASE_URL}/api/search/by-media`,
    method: 'POST',
    body: { phone, mediaType },
    description: 'Search messages by media type (image, video, audio, document)'
  }),

  GET_UNREAD_CHATS: (phone) => ({
    url: `${API_BASE_URL}/api/search/unread/${phone}`,
    method: 'GET',
    description: 'Get all unread chats with counts'
  }),

  // ========== STARRED MESSAGES ==========
  GET_ALL_STARRED: (phone) => ({
    url: `${API_BASE_URL}/api/starred/${phone}`,
    method: 'GET',
    description: 'Get all starred messages across chats'
  }),

  GET_STARRED_BY_CHAT: (phone, chatId) => ({
    url: `${API_BASE_URL}/api/starred/${phone}/${chatId}`,
    method: 'GET',
    description: 'Get starred messages from specific chat'
  }),

  SEARCH_STARRED: (phone, query) => ({
    url: `${API_BASE_URL}/api/starred/search`,
    method: 'POST',
    body: { phone, query },
    description: 'Search within starred messages'
  }),

  UNSTAR_ALL: (phone) => ({
    url: `${API_BASE_URL}/api/starred/unstar-all`,
    method: 'POST',
    body: { phone },
    description: 'Remove star from all messages'
  }),

  // ========== DEVICES & MULTI-DEVICE ==========
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

export default API_ENDPOINTS;
