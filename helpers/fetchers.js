import { getClient, getStore, sessions } from "./whatsapp.js";
import Chat from "../models/Chat.js";
import { isDBConnected } from "../config/database.js";

/**
 * Fetch all chats from MongoDB or in-memory store with profile pictures
 */
export async function fetchChats(phone) {
  const normalizedPhone = phone.replace(/^\+|\s/g, '');
  const session = sessions.get(normalizedPhone);

  if (!session) {
    console.log(`No session found for ${normalizedPhone}`);
    return [];
  }

  const store = session.store;
  if (!store) {
    console.log(`No store found for ${normalizedPhone}`);
    return [];
  }

  try {
    const chats = store.chats?.all() || [];
    console.log(`Fetched ${chats.length} chats for ${normalizedPhone}`);

    // Format chats with profile pictures and proper names
    const formattedChats = await Promise.all(chats.map(async (chat) => {
      let profilePicUrl = null;
      let displayName = chat.name || chat.id.split('@')[0];

      // Try to get profile picture
      try {
        profilePicUrl = await getClient(phone)?.profilePictureUrl(chat.id, 'image');
      } catch (err) {
        // No profile picture available
      }

      // For individual chats, try to get contact name from store
      if (!chat.id.includes('@g.us') && !chat.id.includes('@newsletter')) {
        const contact = store.contacts?.[chat.id];
        if (contact) {
          displayName = contact.name || contact.notify || contact.verifiedName || displayName;
        }
      }

      return {
        id: chat.id,
        name: displayName,
        unreadCount: chat.unreadCount || 0,
        lastMessage: chat.conversationTimestamp ? {
          text: chat.lastMessage?.text || '',
          timestamp: chat.conversationTimestamp
        } : null,
        isGroup: chat.id.includes('@g.us'),
        isChannel: chat.id.includes('@newsletter'),
        isArchived: chat.archive || false,
        isPinned: chat.pin || false,
        isMuted: chat.mute ? true : false,
        profilePicUrl: profilePicUrl
      };
    }));

    // Sort by conversation timestamp (most recent first)
    formattedChats.sort((a, b) => {
      const timeA = a.lastMessage?.timestamp || 0;
      const timeB = b.lastMessage?.timestamp || 0;
      return timeB - timeA;
    });

    return { success: true, chats: formattedChats, count: formattedChats.length };
  } catch (err) {
    console.error(`Error fetching chats for ${normalizedPhone}:`, err.message);
    return { success: false, chats: [], count: 0, message: err.message };
  }
}

/**
 * Fetch all contacts from MongoDB or in-memory store
 */
export async function fetchContacts(store, sock) {
  if (!store) {
    return [];
  }

  const contacts = [];
  const storeContacts = store.contacts || {};
  const phone = sock?.user?.id?.split('@')[0] || sock?.user?.id;

  // Try DB first if connected
  if (isDBConnected() && phone) {
    try {
      const { default: Contact } = await import("../models/Contact.js");
      const dbContacts = await Contact.find({ phone }).lean();
      if (dbContacts && dbContacts.length > 0) {
        return dbContacts.map(c => ({
          jid: c.jid,
          name: c.name || c.jid.split('@')[0],
          notify: c.notify || '',
          verifiedName: c.verifiedName || '',
          imgUrl: c.imgUrl || null,
        }));
      }
    } catch (err) {
      console.error('Error fetching contacts from DB:', err);
    }
  }

  for (const [jid, contact] of Object.entries(storeContacts)) {
    if (!jid.endsWith('@s.whatsapp.net')) continue;

    const contactData = {
      jid,
      name: contact.name || contact.notify || contact.verifiedName || jid.split('@')[0],
      notify: contact.notify || '',
      verifiedName: contact.verifiedName || '',
      imgUrl: contact.imgUrl || null,
    };

    contacts.push(contactData);

    if (isDBConnected() && phone) {
      try {
        const { default: Contact } = await import("../models/Contact.js");
        await Contact.findOneAndUpdate(
          { phone, jid },
          { phone, ...contactData, updatedAt: new Date() },
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.error('Error saving contact to DB:', dbErr);
      }
    }
  }

  return contacts;
}

/**
 * Fetch all groups
 */
export async function fetchGroups(phone) {
  const client = getClient(phone);

  if (!client) {
    throw new Error(`No active WhatsApp client for ${phone}`);
  }

  const groups = await client.groupFetchAllParticipating();

  return Object.values(groups).map(group => ({
    id: group.id,
    subject: group.subject,
    size: group.participants?.length || 0,
    creation: group.creation,
    owner: group.owner,
    desc: group.desc || '',
    participants: group.participants || [],
  }));
}

/**
 * Fetch status updates
 */
export async function fetchStatusUpdates(phone) {
  const store = getStore(phone);

  if (!store) {
    throw new Error(`No active session for ${phone}`);
  }

  const statusUpdates = [];
  const messages = store.messages || {};

  // Look for status broadcast messages
  const statusMessages = messages['status@broadcast'] || [];

  for (const msg of statusMessages) {
    if (msg.key && msg.message) {
      statusUpdates.push({
        key: msg.key,
        message: msg.message,
        messageTimestamp: msg.messageTimestamp,
        pushName: msg.pushName,
      });
    }
  }

  return statusUpdates;
}

/**
 * Fetch channels
 */
export async function fetchChannels(phone) {
  const store = getStore(phone);
  const client = getClient(phone);

  if (!store || !client) {
    throw new Error(`No active session for ${phone}`);
  }

  const channels = [];
  const storeChats = store.chats?.all() || [];

  for (const chat of storeChats) {
    // Channels end with @newsletter
    if (chat.id.endsWith('@newsletter')) {
      channels.push({
        id: chat.id,
        name: chat.name || chat.id.split('@')[0],
        unreadCount: chat.unreadCount || 0,
      });
    }
  }

  return channels;
}

/**
 * Fetch communities (linked channels)
 */
export async function fetchCommunities(phone) {
  const store = getStore(phone);

  if (!store) {
    throw new Error(`No active session for ${phone}`);
  }

  const communities = [];
  const storeChats = store.chats?.all() || [];

  for (const chat of storeChats) {
    // Communities are special group types
    if (chat.id.endsWith('@g.us') && chat.isParentGroup) {
      communities.push({
        id: chat.id,
        name: chat.name || chat.subject,
        linkedGroups: chat.linkedParent || [],
      });
    }
  }

  return communities;
}

/**
 * Fetch call history
 */
export async function fetchCalls(store) {
  if (!store) {
    return [];
  }

  // Baileys doesn't directly store call history in the standard store
  // This would need to be tracked separately via events
  // Check if store has call logs
  const calls = store.calls || [];

  return Array.isArray(calls) ? calls : [];
}

/**
 * Fetch messages from a chat
 */
export async function fetchMessages(store, chatId, limit = 50) {
  if (!store) {
    return [];
  }

  const messages = await store.loadMessages(chatId, limit);
  return Array.isArray(messages) ? messages : [];
}

/**
 * Fetch profile info
 */
export async function fetchProfile(sock, jid) {
  if (!sock) {
    throw new Error('No active socket');
  }

  try {
    // Get status
    let status = '';
    try {
      const statusData = await sock.fetchStatus(jid);
      status = statusData?.status || '';
    } catch (err) {
      console.log('Could not fetch status:', err.message);
    }

    // Get profile picture
    let profilePicUrl = null;
    try {
      profilePicUrl = await sock.profilePictureUrl(jid, 'image');
    } catch (err) {
      console.log('Could not fetch profile picture:', err.message);
    }

    return {
      status,
      profilePicUrl
    };
  } catch (err) {
    throw new Error(`Failed to fetch profile: ${err.message}`);
  }
}