/**
 * CONNEXA-BOT API ENDPOINTS
 * 
 * Base URL (Development): http://localhost:5000
 * Base URL (Production/Replit): Auto-detected from environment
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     process.env.SERVER_URL || 
                     'http://localhost:5000';

export const API_ENDPOINTS = {
  
  // ========== HEALTH & STATUS ==========
  
  /**
   * Health Check
   * GET /health
   * Returns: { status: string, uptime: number, timestamp: string, serverUrl: string }
   */
  HEALTH: () => ({
    url: `${API_BASE_URL}/health`,
    method: 'GET'
  }),

  /**
   * API Health Check
   * GET /api/health
   * Returns: { status: string, uptime: number, timestamp: string, activeSessions: number }
   */
  API_HEALTH: () => ({
    url: `${API_BASE_URL}/api/health`,
    method: 'GET'
  }),
  
  // ========== CONNECTION ENDPOINTS ==========
  
  /**
   * Connect WhatsApp Session
   * POST /api/connect
   * Body: { phone: string }
   * Returns: { qrCode?: string, linkCode?: string, message: string, connected: boolean }
   */
  CONNECT: (phone) => ({
    url: `${API_BASE_URL}/api/connect`,
    method: 'POST',
    body: { phone }
  }),
  
  /**
   * Check Connection Status
   * GET /api/status/:phone
   * Returns: { connected: boolean, status: string, authenticated: boolean, ready: boolean, 
   *            qrCode?: string, linkCode?: string, user?: object, phone: string, error?: string }
   */
  GET_STATUS: (phone) => ({
    url: `${API_BASE_URL}/api/status/${phone}`,
    method: 'GET'
  }),
  
  /**
   * Logout Session
   * POST /api/logout
   * Body: { phone: string }
   * Returns: { message: string }
   */
  LOGOUT: (phone) => ({
    url: `${API_BASE_URL}/api/logout`,
    method: 'POST',
    body: { phone }
  }),
  
  /**
   * Clear Session State
   * POST /api/clear-state/:phoneNumber?fullReset=false
   * Query: fullReset (boolean) - true for complete reset, false for partial
   * Returns: { success: boolean, message: string }
   */
  CLEAR_STATE: (phone, fullReset = false) => ({
    url: `${API_BASE_URL}/api/clear-state/${phone}?fullReset=${fullReset}`,
    method: 'POST'
  }),
  
  // ========== DATA ENDPOINTS ==========
  
  /**
   * Get All Chats
   * GET /api/chats/:phone
   * Returns: { success: boolean, chats: array, count: number, timestamp: string }
   */
  GET_CHATS: (phone) => ({
    url: `${API_BASE_URL}/api/chats/${phone}`,
    method: 'GET'
  }),
  
  /**
   * Get Messages from Specific Chat
   * GET /api/messages/:phone/:chatId?limit=50
   * Query: limit (number) - max messages to fetch
   * Returns: { success: boolean, data: { messages: array } }
   */
  GET_MESSAGES: (phone, chatId, limit = 50) => ({
    url: `${API_BASE_URL}/api/messages/${phone}/${chatId}?limit=${limit}`,
    method: 'GET'
  }),
  
  /**
   * Get Call History
   * GET /api/calls/:phone
   * Returns: { success: boolean, data: { calls: array } }
   */
  GET_CALLS: (phone) => ({
    url: `${API_BASE_URL}/api/calls/${phone}`,
    method: 'GET'
  }),
  
  /**
   * Get Status Updates
   * GET /api/status-updates/:phone
   * Returns: { success: boolean, statusUpdates: array, count: number }
   */
  GET_STATUS_UPDATES: (phone) => ({
    url: `${API_BASE_URL}/api/status-updates/${phone}`,
    method: 'GET'
  }),
  
  /**
   * Get Channels
   * GET /api/channels/:phone
   * Returns: { success: boolean, data: { channels: array } }
   */
  GET_CHANNELS: (phone) => ({
    url: `${API_BASE_URL}/api/channels/${phone}`,
    method: 'GET'
  }),
  
  /**
   * Get Communities
   * GET /api/communities/:phone
   * Returns: { success: boolean, data: { communities: array } }
   */
  GET_COMMUNITIES: (phone) => ({
    url: `${API_BASE_URL}/api/communities/${phone}`,
    method: 'GET'
  }),
  
  /**
   * Get Profile
   * GET /api/profile/:phone
   * Returns: { success: boolean, data: { name: string, phone: string, status: string, picture: string } }
   */
  GET_PROFILE: (phone) => ({
    url: `${API_BASE_URL}/api/profile/${phone}`,
    method: 'GET'
  }),
  
  /**
   * Get Contacts
   * GET /api/contacts/:phone
   * Returns: { success: boolean, contacts: array }
   */
  GET_CONTACTS: (phone) => ({
    url: `${API_BASE_URL}/api/contacts/${phone}`,
    method: 'GET'
  }),
  
  /**
   * Get Groups
   * GET /api/groups/:phone
   * Returns: { success: boolean, groups: array }
   */
  GET_GROUPS: (phone) => ({
    url: `${API_BASE_URL}/api/groups/${phone}`,
    method: 'GET'
  }),
  
  // ========== ACTION ENDPOINTS ==========
  
  /**
   * Send Text Message
   * POST /api/messages/send
   * Body: { phone: string, to: string, message: string }
   * Returns: { success: boolean, messageId?: string }
   */
  SEND_MESSAGE: (phone, to, message) => ({
    url: `${API_BASE_URL}/api/messages/send`,
    method: 'POST',
    body: { phone, to, message }
  }),
  
  /**
   * Download Message Media
   * POST /api/messages/download
   * Body: { phone: string, messageKey: object }
   * Returns: { success: boolean, filePath?: string }
   */
  DOWNLOAD_MEDIA: (phone, messageKey) => ({
    url: `${API_BASE_URL}/api/messages/download`,
    method: 'POST',
    body: { phone, messageKey }
  }),
  
  /**
   * Message Action (delete, forward, star, react, edit)
   * POST /api/messages/action
   * Body: { phone: string, action: string, messageKey: object, data?: object }
   * Returns: { success: boolean }
   */
  MESSAGE_ACTION: (phone, action, messageKey, data = {}) => ({
    url: `${API_BASE_URL}/api/messages/action`,
    method: 'POST',
    body: { phone, action, messageKey, data }
  }),
  
  /**
   * Post Status Update
   * POST /api/status/post
   * Body: { phone: string, type: string, content: string, contacts?: array }
   * Returns: { success: boolean }
   */
  POST_STATUS: (phone, type, content, contacts = []) => ({
    url: `${API_BASE_URL}/api/status/post`,
    method: 'POST',
    body: { phone, type, content, contacts }
  }),
  
  /**
   * Create Group
   * POST /api/groups/create
   * Body: { phone: string, name: string, participants: array }
   * Returns: { success: boolean, groupId?: string }
   */
  CREATE_GROUP: (phone, name, participants) => ({
    url: `${API_BASE_URL}/api/groups/create`,
    method: 'POST',
    body: { phone, name, participants }
  }),
  
  /**
   * Update Profile
   * POST /api/profile/update
   * Body: { phone: string, name?: string, status?: string, picture?: string }
   * Returns: { success: boolean }
   */
  UPDATE_PROFILE: (phone, updates) => ({
    url: `${API_BASE_URL}/api/profile/update`,
    method: 'POST',
    body: { phone, ...updates }
  }),
  
  /**
   * Update Presence (online/offline/typing/recording)
   * POST /api/presence/update
   * Body: { phone: string, chatId: string, state: string }
   * Returns: { success: boolean }
   */
  UPDATE_PRESENCE: (phone, chatId, state) => ({
    url: `${API_BASE_URL}/api/presence/update`,
    method: 'POST',
    body: { phone, chatId, state }
  }),
  
  // ========== AI ENDPOINTS ==========
  
  /**
   * Generate Smart Reply Suggestions
   * POST /api/ai/smart-reply
   * Body: { phone: string, context: string }
   * Returns: { success: boolean, suggestions: array }
   */
  AI_SMART_REPLY: (phone, context) => ({
    url: `${API_BASE_URL}/api/ai/smart-reply`,
    method: 'POST',
    body: { phone, context }
  }),
  
  /**
   * Translate Message
   * POST /api/ai/translate
   * Body: { phone: string, text: string, targetLang: string }
   * Returns: { success: boolean, translation: string }
   */
  AI_TRANSLATE: (phone, text, targetLang) => ({
    url: `${API_BASE_URL}/api/ai/translate`,
    method: 'POST',
    body: { phone, text, targetLang }
  }),
  
  /**
   * Summarize Conversation
   * POST /api/ai/summarize
   * Body: { phone: string, chatId: string, messageCount?: number }
   * Returns: { success: boolean, summary: string }
   */
  AI_SUMMARIZE: (phone, chatId, messageCount = 50) => ({
    url: `${API_BASE_URL}/api/ai/summarize`,
    method: 'POST',
    body: { phone, chatId, messageCount }
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

// Example usage:
// import { API_ENDPOINTS, callAPI } from './API';
// 
// // Connect to WhatsApp
// const result = await callAPI(API_ENDPOINTS.CONNECT('2349154347487'));
// 
// // Get chats
// const chats = await callAPI(API_ENDPOINTS.GET_CHATS('2349154347487'));
// 
// // Send message
// const sent = await callAPI(API_ENDPOINTS.SEND_MESSAGE('2349154347487', '2348012345678@s.whatsapp.net', 'Hello!'));

export default API_ENDPOINTS;
