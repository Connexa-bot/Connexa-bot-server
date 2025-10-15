// helpers/presenceActions.js
import { getClient } from "./whatsapp.js";

/**
 * Update presence for a chat
 */
export const updatePresence = async (phone, chatId, presence) => {
  const sock = getClient(phone);
  if (!sock) throw new Error(`No active WhatsApp client for ${phone}`);
  
  try {
    await sock.sendPresenceUpdate(presence, chatId);
    return { success: true, message: `Presence updated to ${presence}` };
  } catch (err) {
    console.error(`Failed to update presence for ${chatId}:`, err);
    throw err;
  }
};

/**
 * Subscribe to presence updates for a specific JID
 */
export const subscribeToPresence = async (phone, jid) => {
  const sock = getClient(phone);
  if (!sock) throw new Error(`No active WhatsApp client for ${phone}`);
  
  try {
    await sock.presenceSubscribe(jid);
    return { success: true, message: `Subscribed to presence updates for ${jid}` };
  } catch (err) {
    console.error(`Failed to subscribe to presence for ${jid}:`, err);
    throw err;
  }
};
