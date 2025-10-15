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

  const sock = session.sock;
  
  if (!sock) {
    console.log(`No socket found for ${normalizedPhone}`);
    return [];
  }

  try {
    // Use Baileys method to fetch chats
    console.log(`📋 Fetching chats for ${normalizedPhone}...`);
    
    // Get chats using store.chats if available, otherwise use contacts
    let allChats = [];
    
    // Try to get chats from the store
    if (session.store?.chats) {
      const storeChats = session.store.chats;
      if (typeof storeChats.all === 'function') {
        allChats = storeChats.all();
      } else if (typeof storeChats === 'object') {
        allChats = Object.values(storeChats);
      }
    }
    
    // If no chats from store, construct from contacts
    if (allChats.length === 0 && session.store?.contacts) {
      console.log(`📋 No chats in store, constructing from contacts...`);
      const contacts = session.store.contacts;
      const contactChats = Object.entries(contacts)
        .filter(([jid]) => jid.endsWith('@s.whatsapp.net') && jid !== '0@s.whatsapp.net')
        .map(([jid, contact]) => ({
          id: jid,
          name: contact.name || contact.notify || contact.verifiedName || jid.split('@')[0],
          conversationTimestamp: Date.now(),
          unreadCount: 0
        }));
      allChats = contactChats;
    }

    console.log(`📋 Found ${allChats.length} raw chats for ${normalizedPhone}`);

    if (!allChats || allChats.length === 0) {
      console.log(`⚠️ No chats found for ${normalizedPhone}`);
      return [];
    }

    // Format chats with profile pictures and proper names
    const formattedChats = await Promise.all(allChats.map(async (chat) => {
      let profilePicUrl = null;
      let displayName = chat.name || chat.id?.split('@')[0] || 'Unknown';
      let lastMessageText = '';

      // Try to get profile picture
      try {
        profilePicUrl = await sock.profilePictureUrl(chat.id, 'image').catch(() => null);
      } catch (err) {
        // No profile picture available
      }

      // For individual chats, try to get contact name from store
      if (!chat.id?.includes('@g.us') && !chat.id?.includes('@newsletter')) {
        const contact = session.store?.contacts?.[chat.id];
        if (contact) {
          displayName = contact.name || contact.notify || contact.verifiedName || displayName;
        }
      }

      // Extract last message text if available
      if (chat.lastMessage || chat.messages) {
        const lastMsg = chat.lastMessage || chat.messages?.[0];
        if (lastMsg) {
          if (typeof lastMsg === 'string') {
            lastMessageText = lastMsg;
          } else if (lastMsg.message?.conversation) {
            lastMessageText = lastMsg.message.conversation;
          } else if (lastMsg.message?.extendedTextMessage?.text) {
            lastMessageText = lastMsg.message.extendedTextMessage.text;
          } else if (lastMsg.conversation) {
            lastMessageText = lastMsg.conversation;
          } else if (lastMsg.extendedTextMessage?.text) {
            lastMessageText = lastMsg.extendedTextMessage.text;
          }
        }
      }

      return {
        id: chat.id,
        name: displayName,
        unreadCount: chat.unreadCount || 0,
        lastMessage: chat.conversationTimestamp || chat.timestamp ? {
          text: lastMessageText,
          timestamp: chat.conversationTimestamp || chat.timestamp
        } : null,
        isGroup: chat.id?.includes('@g.us') || false,
        isChannel: chat.id?.includes('@newsletter') || false,
        isArchived: chat.archive || false,
        isPinned: chat.pin || chat.pinned || false,
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

    console.log(`✅ Returning ${formattedChats.length} formatted chats`);
    
    return formattedChats;
  } catch (err) {
    console.error(`❌ Error fetching chats for ${normalizedPhone}:`, err.message);
    return [];
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
  const normalizedPhone = phone.replace(/^\+|\s/g, '');
  const session = sessions.get(normalizedPhone);

  if (!session || !session.sock) {
    throw new Error(`No active WhatsApp client for ${phone}`);
  }

  try {
    const groups = await session.sock.groupFetchAllParticipating();

    return Object.values(groups).map(group => ({
      id: group.id,
      subject: group.subject,
      size: group.participants?.length || 0,
      creation: group.creation,
      owner: group.owner,
      desc: group.desc || '',
      participants: group.participants || [],
    }));
  } catch (error) {
    console.error(`Error fetching groups for ${phone}:`, error.message);
    return [];
  }
}

/**
 * Fetch status updates
 */
export async function fetchStatusUpdates(phone) {
  const normalizedPhone = phone.replace(/^\+|\s/g, '');
  const session = sessions.get(normalizedPhone);

  if (!session) {
    throw new Error(`No active session for ${phone}`);
  }

  const statusUpdates = [];
  
  try {
    // Check if store has status messages
    if (session.store?.messages) {
      const messages = session.store.messages;
      
      // Look for status broadcast messages
      const statusJid = 'status@broadcast';
      if (messages[statusJid]) {
        const statusMessages = Array.isArray(messages[statusJid]) 
          ? messages[statusJid] 
          : Object.values(messages[statusJid]);

        for (const msg of statusMessages) {
          if (msg?.key && msg?.message) {
            statusUpdates.push({
              key: msg.key,
              message: msg.message,
              messageTimestamp: msg.messageTimestamp,
              pushName: msg.pushName || msg.participant?.split('@')[0],
            });
          }
        }
      }
    }

    // Also check chats for status
    if (session.store?.chats) {
      const chats = typeof session.store.chats.all === 'function' 
        ? session.store.chats.all() 
        : Object.values(session.store.chats);
      
      const statusChat = chats.find(chat => chat.id === 'status@broadcast');
      if (statusChat?.messages) {
        const msgs = Array.isArray(statusChat.messages) 
          ? statusChat.messages 
          : Object.values(statusChat.messages);
        
        for (const msg of msgs) {
          if (msg?.key && msg?.message && !statusUpdates.find(s => s.key.id === msg.key.id)) {
            statusUpdates.push({
              key: msg.key,
              message: msg.message,
              messageTimestamp: msg.messageTimestamp,
              pushName: msg.pushName || msg.participant?.split('@')[0],
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching status updates for ${phone}:`, error.message);
  }

  return statusUpdates;
}

/**
 * Fetch channels
 */
export async function fetchChannels(phone) {
  const normalizedPhone = phone.replace(/^\+|\s/g, '');
  const session = sessions.get(normalizedPhone);

  if (!session) {
    throw new Error(`No active session for ${phone}`);
  }

  const channels = [];
  
  try {
    if (session.store?.chats) {
      const storeChats = typeof session.store.chats.all === 'function' 
        ? session.store.chats.all() 
        : Object.values(session.store.chats);

      for (const chat of storeChats) {
        // Channels end with @newsletter
        if (chat.id?.endsWith('@newsletter')) {
          channels.push({
            id: chat.id,
            name: chat.name || chat.subject || chat.id.split('@')[0],
            unreadCount: chat.unreadCount || 0,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching channels for ${phone}:`, error.message);
  }

  return channels;
}

/**
 * Fetch communities (linked channels)
 */
export async function fetchCommunities(phone) {
  const normalizedPhone = phone.replace(/^\+|\s/g, '');
  const session = sessions.get(normalizedPhone);

  if (!session) {
    throw new Error(`No active session for ${phone}`);
  }

  const communities = [];
  
  try {
    if (session.store?.chats) {
      const storeChats = typeof session.store.chats.all === 'function' 
        ? session.store.chats.all() 
        : Object.values(session.store.chats);

      for (const chat of storeChats) {
        // Communities are special group types with parent group flag
        if (chat.id?.endsWith('@g.us') && (chat.isParentGroup || chat.parentGroup)) {
          communities.push({
            id: chat.id,
            name: chat.name || chat.subject,
            linkedGroups: chat.linkedParent || chat.subGroups || [],
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching communities for ${phone}:`, error.message);
  }

  return communities;
}

/**
 * Fetch call history
 */
export async function fetchCalls(phone) {
  // Baileys doesn't directly store call history in the standard store
  // Call history needs to be tracked via call events and stored separately
  // For now, return empty array - this should be implemented with event listeners
  
  console.log(`ℹ️ Call history not available in Baileys store - needs event-based tracking for ${phone}`);
  return [];
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