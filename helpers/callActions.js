// helpers/callActions.js
// ===============================
// Call action helpers
// ===============================

import { getClient, getStore } from "./whatsapp.js";

/**
 * Get call history
 */
export async function getCallHistory(phone) {
  const store = getStore(phone);
  if (!store) throw new Error(`No active store for ${phone}`);

  try {
    // Extract call messages from store
    const allMessages = Object.values(store.messages).flatMap(m => m.array || []);
    const callMessages = allMessages.filter(msg => msg.message?.call);

    const calls = callMessages.map(msg => {
      const call = msg.message.call;
      const callJid = call.callKey?.remoteJid || msg.key.remoteJid;
      
      return {
        id: msg.key.id,
        from: msg.key.fromMe ? 'me' : callJid,
        to: msg.key.fromMe ? callJid : 'me',
        timestamp: msg.messageTimestamp,
        isVideo: call.isVideo || false,
        isGroup: call.isGroup || false,
        status: call.callKey?.fromMe ? 'outgoing' : 'incoming',
      };
    });

    return { success: true, calls };
  } catch (error) {
    console.error('Call history fetch error:', error);
    return { success: true, calls: [] };
  }
}

/**
 * Make a voice call
 * Note: Baileys doesn't support making calls directly, only receiving call events
 */
export async function makeCall(phone, to, isVideo = false) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  // Baileys doesn't support initiating calls through the API
  // This is a limitation of WhatsApp Web protocol
  return { 
    success: false, 
    message: 'Making calls is not supported via WhatsApp Web API. Calls can only be initiated from official WhatsApp clients.' 
  };
}

/**
 * Answer a call (not supported)
 */
export async function answerCall(phone, callId) {
  return { 
    success: false, 
    message: 'Call handling is not supported via WhatsApp Web API.' 
  };
}

/**
 * Reject a call (not supported)
 */
export async function rejectCall(phone, callId) {
  return { 
    success: false, 
    message: 'Call handling is not supported via WhatsApp Web API.' 
  };
}

/**
 * Listen for incoming calls
 * This should be set up as an event listener in the main WhatsApp connection
 */
export function setupCallListener(sock, callback) {
  sock.ev.on('call', (calls) => {
    for (const call of calls) {
      callback({
        id: call.id,
        from: call.from,
        timestamp: call.date,
        isVideo: call.isVideo,
        isGroup: call.isGroup,
        status: call.status,
      });
    }
  });
}
