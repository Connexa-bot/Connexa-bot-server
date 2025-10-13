
import { getClient, getStore } from "./whatsapp.js";

/**
 * Fetch all chats from store
 */
export async function fetchChats(phone) {
  const store = getStore(phone);
  const client = getClient(phone);
  
  if (!store || !client) {
    throw new Error(`No active session for ${phone}`);
  }

  const chats = [];
  const storeChats = store.chats?.all() || [];

  for (const chat of storeChats) {
    // Skip invalid or system chats
    if (!chat.id || chat.id === 'status@broadcast') continue;
    
    // Determine if it's a group
    const isGroup = chat.id.endsWith('@g.us');
    
    // Get chat name
    let name = chat.name || chat.id.split('@')[0];
    
    // For individual chats, try to get contact name
    if (!isGroup) {
      const contact = store.contacts?.[chat.id];
      if (contact) {
        name = contact.name || contact.notify || contact.verifiedName || name;
      }
    }

    // Get profile picture
    let profilePicUrl = null;
    try {
      profilePicUrl = await client.profilePictureUrl(chat.id, 'image').catch(() => null);
    } catch (err) {
      // Ignore errors
    }

    chats.push({
      id: chat.id,
      name,
      profilePicUrl,
      unreadCount: chat.unreadCount || 0,
      lastMessageTimestamp: chat.conversationTimestamp || 0,
      lastMessage: chat.lastMessage || {},
      isGroup,
      isArchived: chat.archived || false,
      isPinned: chat.pinned || false,
      isMuted: chat.mute ? chat.mute > Date.now() : false,
    });
  }

  return chats;
}

/**
 * Fetch all contacts
 */
export async function fetchContacts(phone) {
  const store = getStore(phone);
  
  if (!store) {
    throw new Error(`No active session for ${phone}`);
  }

  const contacts = [];
  const storeContacts = store.contacts || {};

  for (const [jid, contact] of Object.entries(storeContacts)) {
    // Only include personal contacts (not groups or broadcast)
    if (!jid.endsWith('@s.whatsapp.net')) continue;
    
    contacts.push({
      jid,
      name: contact.name || contact.notify || contact.verifiedName || jid.split('@')[0],
      notify: contact.notify || '',
      verifiedName: contact.verifiedName || '',
      imgUrl: contact.imgUrl || null,
    });
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
export async function fetchCalls(phone) {
  const store = getStore(phone);
  
  if (!store) {
    throw new Error(`No active session for ${phone}`);
  }

  // Baileys doesn't directly store call history in the standard store
  // This would need to be tracked separately via events
  return [];
}
