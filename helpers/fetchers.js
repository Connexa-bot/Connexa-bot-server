import { getClient, getStore } from "./whatsapp.js";
import Chat from "../models/Chat.js";
import { isDBConnected } from "../config/database.js";

/**
 * Fetch all chats from MongoDB or in-memory store
 */
export async function fetchChats(phone) {
  const client = getClient(phone);
  
  if (!client) {
    throw new Error(`No active session for ${phone}`);
  }

  if (isDBConnected()) {
    try {
      const dbChats = await Chat.find({ phone }).sort({ lastMessageTimestamp: -1 }).lean();
      if (dbChats && dbChats.length > 0) {
        return dbChats.map(chat => ({
          id: chat.chatId,
          name: chat.name || chat.chatId.split('@')[0],
          profilePicUrl: chat.profilePicUrl,
          unreadCount: chat.unreadCount || 0,
          lastMessageTimestamp: chat.lastMessageTimestamp || 0,
          lastMessage: chat.lastMessage || {},
          isGroup: chat.isGroup || false,
          isArchived: chat.isArchived || false,
          isPinned: chat.isPinned || false,
          isMuted: chat.isMuted || false,
        }));
      }
    } catch (err) {
      console.error('Error fetching chats from DB:', err);
    }
  }

  const store = getStore(phone);
  if (!store) {
    return [];
  }

  const chats = [];
  const storeChats = store.chats?.all() || [];

  for (const chat of storeChats) {
    try {
      if (!chat || !chat.id || chat.id === 'status@broadcast') continue;
      
      const isGroup = chat.id?.endsWith('@g.us') || false;
      let name = chat.name || chat.id?.split('@')[0] || 'Unknown';
      
      if (!isGroup && store.contacts) {
        const contact = store.contacts[chat.id];
        if (contact) {
          name = contact.name || contact.notify || contact.verifiedName || name;
        }
      }

      let profilePicUrl = null;
      try {
        profilePicUrl = await client.profilePictureUrl(chat.id, 'image').catch(() => null);
      } catch (err) {
        // Ignore profile pic errors
      }

      const chatData = {
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
      };

      chats.push(chatData);

      if (isDBConnected()) {
        try {
          await Chat.findOneAndUpdate(
            { phone, chatId: chat.id },
            {
              phone,
              chatId: chat.id,
              name,
              profilePicUrl,
              unreadCount: chatData.unreadCount,
              lastMessageTimestamp: chatData.lastMessageTimestamp,
              lastMessage: chatData.lastMessage,
              isGroup: chatData.isGroup,
              isArchived: chatData.isArchived,
              isPinned: chatData.isPinned,
              isMuted: chatData.isMuted,
              updatedAt: new Date()
            },
            { upsert: true, new: true }
          );
        } catch (dbErr) {
          console.error('Error saving chat to DB:', dbErr);
        }
      }
    } catch (chatErr) {
      console.error('Error processing chat:', chatErr);
      continue;
    }
  }

  return chats;
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
