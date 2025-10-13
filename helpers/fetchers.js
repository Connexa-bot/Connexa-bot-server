// ===============================
// 🚀 Baileys Data Fetchers
// ===============================
import { jidNormalizedUser } from "baileys";

/**
 * Fetches and formats all chats from the store.
 * @param {object} store - The Baileys data store.
 * @param {object} sock - The Baileys socket instance.
 * @returns {Array} - An array of formatted chat objects.
 */
export const fetchChats = async (store, sock = null) => {
  try {
    const chats = store.chats || {};
    const chatList = [];

    for (const jid of Object.keys(chats)) {
      const chat = chats[jid];
      const isGroup = jid.includes('@g.us');

      let name = chat.name || jid;
      let profilePicUrl = null;

      // Get contact name and profile picture
      if (sock) {
        try {
          // Fetch profile picture
          profilePicUrl = await sock.profilePictureUrl(jid, 'image').catch(() => null);

          // Get better name from contacts or group metadata
          if (isGroup) {
            try {
              const metadata = await sock.groupMetadata(jid);
              name = metadata.subject;
            } catch (e) {
              // Use existing name
            }
          } else {
            const contact = store.contacts?.[jid];
            name = contact?.name || contact?.notify || contact?.verifiedName || jid.split('@')[0];
          }
        } catch (err) {
          // Use default values
        }
      }

      chatList.push({
        id: jid,
        name,
        profilePicUrl,
        unreadCount: chat.unreadCount || 0,
        lastMessageTimestamp: chat.conversationTimestamp || 0,
        lastMessage: chat.lastMessage || {},
        isGroup,
        isArchived: chat.archived || false,
        isPinned: chat.pinned || false,
        isMuted: chat.mute || false
      });
    }

    return chatList.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
  } catch (err) {
    console.error('Failed to fetch chats:', err);
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
 * @param {object} sock - The Baileys socket instance.
 * @returns {Array} - An array of formatted contact objects.
 */
export const fetchContacts = async (store, sock = null) => {
  try {
    const contacts = store.contacts || {};
    const contactList = [];

    for (const jid of Object.keys(contacts)) {
      if (!jid.includes('@s.whatsapp.net')) continue;

      const contact = {
        jid,
        name: contacts[jid]?.name || contacts[jid]?.notify || jid.split('@')[0],
        notify: contacts[jid]?.notify,
        verifiedName: contacts[jid]?.verifiedName,
        imgUrl: null
      };

      // Fetch profile picture if sock is available
      if (sock) {
        try {
          const profilePicUrl = await sock.profilePictureUrl(jid, 'image');
          contact.imgUrl = profilePicUrl;
        } catch (err) {
          // Profile picture not available
          contact.imgUrl = null;
        }
      }

      contactList.push(contact);
    }

    return contactList;
  } catch (err) {
    console.error('Failed to fetch contacts:', err);
    return [];
  }
};