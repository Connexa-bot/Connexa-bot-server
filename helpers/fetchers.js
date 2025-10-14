import { getClient, getStore } from "./whatsapp.js";
import Chat from "../models/Chat.js";
import { isDBConnected } from "../config/database.js";

/**
 * Fetch all chats from MongoDB or in-memory store
 */
export async function fetchChats(phone) {
  const sock = getClient(phone);
  const chats = await sock.store.chats?.all();

  if (!chats || chats.length === 0) {
    return { success: true, chats: [], count: 0 };
  }

  // Convert to more usable format
  const formattedChats = chats.map(chat => ({
    id: chat.id,
    name: chat.name || chat.id.split('@')[0],
    unreadCount: chat.unreadCount || 0,
    lastMessage: chat.lastMessage?.text || '',
    isGroup: chat.id.includes('@g.us'),
    isArchived: chat.archive || false,
    isPinned: chat.pin || false,
    isMuted: chat.mute ? true : false,
  }));

  return { success: true, chats: formattedChats, count: formattedChats.length };
}

/**
 * Fetch all contacts from MongoDB or in-memory store
 */
export async function fetchContacts(phone) {
  if (isDBConnected()) {
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

  const store = getStore(phone);
  if (!store) {
    return [];
  }

  const contacts = [];
  const storeContacts = store.contacts || {};

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

    if (isDBConnected()) {
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
export async function fetchCalls(phone) {
  const store = getStore(phone);

  if (!store) {
    throw new Error(`No active session for ${phone}`);
  }

  // Baileys doesn't directly store call history in the standard store
  // This would need to be tracked separately via events
  return [];
}