// helpers/channelActions.js
// ===============================
// Channel/Newsletter action helpers
// ===============================

import { getClient } from "./whatsapp.js";

/**
 * Get all channels (newsletters) the user follows
 */
export async function getChannels(phone) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  try {
    // Get newsletter subscriptions
    const newsletters = await client.newsletterMetadata('subscribed').catch(() => []);
    
    const channels = await Promise.all(
      newsletters.map(async (newsletter) => {
        try {
          const metadata = await client.newsletterMetadata(newsletter.id);
          const profilePic = await client.profilePictureUrl(newsletter.id, 'image').catch(() => null);
          
          return {
            id: newsletter.id,
            name: metadata.name || newsletter.name,
            description: metadata.description,
            profilePicUrl: profilePic,
            subscriberCount: metadata.subscribers_count,
            createdAt: metadata.creation_time,
            verified: metadata.verification === 'VERIFIED'
          };
        } catch (err) {
          return {
            id: newsletter.id,
            name: newsletter.name,
            profilePicUrl: null
          };
        }
      })
    );
    
    return { success: true, channels };
  } catch (error) {
    console.error('Channel fetch error:', error);
    return { success: true, channels: [] };
  }
}

/**
 * Follow a channel
 */
export async function followChannel(phone, channelJid) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  try {
    await client.newsletterFollow(channelJid);
    return { 
      success: true, 
      message: 'Successfully followed channel',
      channelJid
    };
  } catch (error) {
    console.error('Error following channel:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to follow channel',
      message: 'Channel follow functionality has limited support in Baileys'
    };
  }
}

/**
 * Unfollow a channel
 */
export async function unfollowChannel(phone, channelJid) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  try {
    await client.newsletterUnfollow(channelJid);
    return { 
      success: true, 
      message: 'Successfully unfollowed channel',
      channelJid
    };
  } catch (error) {
    console.error('Error unfollowing channel:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to unfollow channel',
      message: 'Channel unfollow functionality has limited support in Baileys'
    };
  }
}

/**
 * Get channel metadata
 */
export async function getChannelMetadata(phone, channelJid) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  try {
    const metadata = await client.newsletterMetadata(channelJid);
    const profilePic = await client.profilePictureUrl(channelJid, 'image').catch(() => null);
    
    return { 
      success: true, 
      metadata: {
        id: metadata.id,
        name: metadata.name,
        description: metadata.description,
        subscriberCount: metadata.subscribers_count,
        createdAt: metadata.creation_time,
        verified: metadata.verification === 'VERIFIED',
        profilePicUrl: profilePic
      }
    };
  } catch (error) {
    console.error('Error getting channel metadata:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get channel metadata'
    };
  }
}

/**
 * Get channel messages with pagination
 * @param {string} phone - User's phone number
 * @param {string} channelJid - Channel JID
 * @param {object} options - Pagination options
 * @returns {Promise<object>} Channel messages
 */
export async function getChannelMessages(phone, channelJid, options = {}) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const { limit = 50, cursor = null } = options;

  try {
    const { sessions } = await import('./whatsapp.js');
    const normalizedPhone = phone.replace(/\D/g, '');
    const session = sessions.get(normalizedPhone);
    
    if (!session || !session.store) {
      throw new Error(`No store found for ${phone}`);
    }

    const store = session.store;
    let messages = [];

    const allMessages = store.messages?.[channelJid];
    if (allMessages) {
      const messageArray = Array.from(allMessages.values());
      
      messageArray.sort((a, b) => (b.messageTimestamp || 0) - (a.messageTimestamp || 0));
      
      if (cursor) {
        const cursorIndex = messageArray.findIndex(m => m.key?.id === cursor);
        if (cursorIndex !== -1) {
          messages = messageArray.slice(cursorIndex + 1, cursorIndex + 1 + limit);
        }
      } else {
        messages = messageArray.slice(0, limit);
      }
    }

    const formattedMessages = messages.map(msg => formatChannelMessage(msg));

    const nextCursor = messages.length > 0 
      ? messages[messages.length - 1]?.key?.id 
      : null;

    return {
      success: true,
      channelJid,
      messages: formattedMessages,
      hasMore: messages.length === limit,
      nextCursor,
      count: formattedMessages.length
    };
  } catch (error) {
    console.error('Error fetching channel messages:', error);
    return {
      success: false,
      error: error.message,
      messages: [],
      count: 0
    };
  }
}

function formatChannelMessage(message) {
  if (!message) return null;

  const msg = message.message || {};
  const key = message.key || {};

  return {
    id: key.id,
    timestamp: message.messageTimestamp 
      ? parseInt(message.messageTimestamp) * 1000 
      : Date.now(),
    type: getMessageType(msg),
    content: extractContent(msg),
    reactions: message.reactions || []
  };
}

function getMessageType(msg) {
  if (msg.conversation || msg.extendedTextMessage) return 'text';
  if (msg.imageMessage) return 'image';
  if (msg.videoMessage) return 'video';
  if (msg.audioMessage) return 'audio';
  if (msg.documentMessage) return 'document';
  return 'unknown';
}

function extractContent(msg) {
  if (msg.conversation) return { text: msg.conversation };
  if (msg.extendedTextMessage) return { text: msg.extendedTextMessage.text };
  if (msg.imageMessage) return { 
    caption: msg.imageMessage.caption,
    url: msg.imageMessage.url,
    mimetype: msg.imageMessage.mimetype
  };
  if (msg.videoMessage) return { 
    caption: msg.videoMessage.caption,
    url: msg.videoMessage.url,
    mimetype: msg.videoMessage.mimetype
  };
  return {};
}

/**
 * Mute/unmute channel
 */
export async function muteChannel(phone, channelJid, duration = null) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.chatModify({ mute: duration }, channelJid);
  return { success: true };
}

/**
 * Get community channels
 */
export async function getCommunities(phone) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  try {
    // Fetch community-linked groups
    const { getStore } = await import('./whatsapp.js');
    const store = getStore(phone);
    const chats = store?.chats || {};
    
    const communities = [];
    
    for (const jid of Object.keys(chats)) {
      if (jid.includes('@g.us')) {
        try {
          const metadata = await client.groupMetadata(jid);
          if (metadata.linkedParent) {
            // This is a community-linked group
            const profilePic = await client.profilePictureUrl(jid, 'image').catch(() => null);
            
            communities.push({
              id: jid,
              name: metadata.subject,
              description: metadata.desc,
              profilePicUrl: profilePic,
              parentCommunity: metadata.linkedParent,
              memberCount: metadata.participants?.length || 0,
              createdAt: metadata.creation
            });
          }
        } catch (err) {
          // Skip groups without metadata
        }
      }
    }
    
    return { success: true, communities };
  } catch (error) {
    console.error('Community fetch error:', error);
    return { success: true, communities: [] };
  }
}
