// ===============================
// 🚀 Baileys Data Fetchers
// ===============================
import { jidNormalizedUser } from "baileys";

/**
 * Fetches and formats all chats from the store.
 * @param {object} store - The Baileys data store.
 * @returns {Array} - An array of formatted chat objects.
 */
export const fetchChats = async (store) => {
  try {
    const chats = store.chats.all();
    
    return chats.map(chat => {
      // Get the last message from this chat
      const chatMessages = store.messages[chat.id];
      const lastMsg = chatMessages?.array?.slice(-1)[0];
      
      return {
        id: chat.id,
        name: chat.name || chat.id,
        unreadCount: chat.unreadCount || 0,
        lastMessageTimestamp: chat.conversationTimestamp,
        lastMessage: lastMsg ? {
          text: lastMsg.message?.conversation || 
                lastMsg.message?.extendedTextMessage?.text || 
                lastMsg.message?.imageMessage?.caption ||
                lastMsg.message?.videoMessage?.caption ||
                '[Media]',
          timestamp: lastMsg.messageTimestamp,
          fromMe: lastMsg.key?.fromMe || false
        } : null,
        isGroup: chat.id.endsWith('@g.us'),
        isArchived: chat.archived || false,
        isPinned: chat.pinned || false,
        isMuted: chat.mute ? chat.mute > Date.now() : false,
      };
    }).sort((a, b) => {
      // Sort by last message timestamp, most recent first
      const timeA = a.lastMessageTimestamp || 0;
      const timeB = b.lastMessageTimestamp || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
};

/**
 * Fetches and formats messages for a specific chat.
 * @param {object} store - The Baileys data store.
 * @param {string} chatId - The ID of the chat.
 * @param {number} limit - The maximum number of messages to fetch.
 * @returns {Array} - An array of formatted message objects.
 */
export const fetchMessages = async (store, chatId, limit = 50) => {
  const messages = store.messages[chatId]?.array || [];
  return messages.slice(-limit).map(msg => ({
    id: msg.key.id,
    fromMe: msg.key.fromMe,
    text: msg.message?.conversation || msg.message?.extendedTextMessage?.text,
    timestamp: msg.messageTimestamp,
  }));
};

/**
 * Fetches and formats all calls from the store.
 * @param {object} store - The Baileys data store.
 * @returns {Array} - An array of formatted call objects.
 */
export const fetchCalls = async (store) => {
    const allMessages = Object.values(store.messages).flatMap(m => m.array);
    const callMessages = allMessages.filter(msg => msg.message?.call);

    return callMessages.map(msg => {
        const call = msg.message.call;
        // The call JID can be in different places depending on the call type
        const callJid = call.callKey?.remoteJid || msg.key.remoteJid;
        return {
            id: msg.key.id,
            from: jidNormalizedUser(msg.key.fromMe ? sock.user.id : callJid),
            timestamp: msg.messageTimestamp,
            duration: call.duration,
            isVideo: call.isVideo,
            isGroup: call.isGroup,
            status: call.isMissed ? 'missed' : 'answered',
        };
    });
};


/**
 * Fetches and formats all status updates from the store.
 * @param {object} store - The Baileys data store.
 * @returns {Array} - An array of formatted status update objects.
 */
export const fetchStatusUpdates = async (store) => {
  const statuses = store.contacts.all().filter(c => c.status);
  return statuses.map(contact => ({
    id: contact.id,
    name: contact.name || contact.id,
    status: contact.status,
  }));
};

/**
 * Fetches the profile information for a user.
 * @param {object} sock - The Baileys socket instance.
 * @param {string} jid - The JID of the user.
 * @returns {object} - The user's profile information.
 */
export const fetchProfile = async (sock, jid) => {
  try {
    const profilePicUrl = await sock.profilePictureUrl(jid, 'image');
    const status = await sock.fetchStatus(jid);
    return { profilePicUrl, status: status?.status };
  } catch (error) {
    console.error(`Failed to fetch profile for ${jid}:`, error);
    return { profilePicUrl: null, status: null };
  }
};

/**
 * Fetches and formats all groups from the socket.
 * @param {object} sock - The Baileys socket instance.
 * @returns {Array} - An array of formatted group objects.
 */
export const fetchGroups = async (sock) => {
  const groups = await sock.groupFetchAllParticipating();
  return Object.values(groups).map(group => ({
    id: group.id,
    subject: group.subject,
    size: group.size,
    creation: group.creation,
    owner: group.owner,
  }));
};

/**
 * Fetches and formats all contacts from the store.
 * @param {object} store - The Baileys data store.
 * @returns {Array} - An array of formatted contact objects.
 */
export const fetchContacts = async (store) => {
    const contacts = store.contacts.all();
    return contacts.map(contact => ({
        id: contact.id,
        name: contact.name || contact.id,
        notify: contact.notify,
        verifiedName: contact.verifiedName,
    }));
};