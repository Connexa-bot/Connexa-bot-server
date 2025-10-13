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
    // Placeholder for channel follow functionality
    // Implementation depends on Baileys newsletter support
    return { success: false, message: 'Channel features not fully supported yet' };
  } catch (error) {
    throw new Error(`Failed to follow channel: ${error.message}`);
  }
}

/**
 * Unfollow a channel
 */
export async function unfollowChannel(phone, channelJid) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  try {
    // Placeholder for channel unfollow functionality
    return { success: false, message: 'Channel features not fully supported yet' };
  } catch (error) {
    throw new Error(`Failed to unfollow channel: ${error.message}`);
  }
}

/**
 * Get channel metadata
 */
export async function getChannelMetadata(phone, channelJid) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  try {
    // Placeholder for channel metadata
    return { success: false, message: 'Channel features not fully supported yet' };
  } catch (error) {
    throw new Error(`Failed to get channel metadata: ${error.message}`);
  }
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
