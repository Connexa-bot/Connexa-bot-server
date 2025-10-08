// helpers/presenceActions.js

/**
 * Update presence for a chat
 * @param {object} sock - Baileys socket instance
 * @param {string} chatId - JID of the chat
 * @param {string} presence - Presence status ('available', 'unavailable', 'composing', 'recording', 'paused')
 */
export const updatePresence = async (sock, chatId, presence) => {
  try {
    await sock.sendPresenceUpdate(presence, chatId);
  } catch (err) {
    console.error(`Failed to update presence for ${chatId}:`, err);
    throw err;
  }
};

/**
 * Subscribe to presence updates for a specific JID
 * @param {object} sock - Baileys socket instance
 * @param {string} jid - JID to subscribe presence updates
 */
export const subscribeToPresence = async (sock, jid) => {
  try {
    await sock.presenceSubscribe(jid);
  } catch (err) {
    console.error(`Failed to subscribe to presence for ${jid}:`, err);
    throw err;
  }
};
