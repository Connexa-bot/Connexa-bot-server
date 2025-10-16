// helpers/communityActions.js
// ===============================
// Community management features
// ===============================

import { getClient } from "./whatsapp.js";
import { sessions } from "./whatsapp.js";

/**
 * Get all communities user is part of
 * @param {string} phone - User's phone number
 * @returns {Promise<object>} Communities list
 */
export async function getCommunities(phone) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const normalizedPhone = phone.replace(/\D/g, '');
  const session = sessions.get(normalizedPhone);
  if (!session || !session.store) throw new Error(`No store found for ${phone}`);

  try {
    const store = session.store;
    const chats = store.chats?.all() || [];
    const communities = [];

    for (const chat of chats) {
      if (chat.id?.includes('@g.us')) {
        try {
          const metadata = await client.groupMetadata(chat.id);
          
          if (metadata.linkedParent) {
            const profilePic = await client.profilePictureUrl(metadata.linkedParent, 'image').catch(() => null);
            
            const existingCommunity = communities.find(c => c.id === metadata.linkedParent);
            
            if (!existingCommunity) {
              communities.push({
                id: metadata.linkedParent,
                name: metadata.subject || 'Unknown Community',
                description: metadata.desc || '',
                profilePicUrl: profilePic,
                linkedGroups: [chat.id],
                createdAt: metadata.creation || null
              });
            } else {
              existingCommunity.linkedGroups.push(chat.id);
            }
          }
        } catch (err) {
          console.error(`Error fetching metadata for ${chat.id}:`, err.message);
        }
      }
    }

    return {
      success: true,
      communities,
      count: communities.length
    };
  } catch (error) {
    console.error('Error fetching communities:', error);
    return {
      success: true,
      communities: [],
      count: 0,
      message: 'Communities feature has limited support'
    };
  }
}

/**
 * Get community metadata
 * @param {string} phone - User's phone number
 * @param {string} communityJid - Community JID
 * @returns {Promise<object>} Community metadata
 */
export async function getCommunityMetadata(phone, communityJid) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  try {
    const metadata = await client.groupMetadata(communityJid);
    const profilePic = await client.profilePictureUrl(communityJid, 'image').catch(() => null);

    return {
      success: true,
      metadata: {
        id: metadata.id,
        subject: metadata.subject,
        subjectOwner: metadata.subjectOwner,
        subjectTime: metadata.subjectTime,
        creation: metadata.creation,
        owner: metadata.owner,
        desc: metadata.desc || '',
        descOwner: metadata.descOwner,
        descId: metadata.descId,
        restrict: metadata.restrict,
        announce: metadata.announce,
        isCommunity: metadata.isCommunity || false,
        isCommunityAnnounce: metadata.isCommunityAnnounce || false,
        participants: metadata.participants || [],
        profilePicUrl: profilePic
      }
    };
  } catch (error) {
    console.error('Error fetching community metadata:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch community metadata'
    };
  }
}

/**
 * Get linked groups in a community
 * @param {string} phone - User's phone number
 * @param {string} communityJid - Community JID
 * @returns {Promise<object>} Linked groups
 */
export async function getLinkedGroups(phone, communityJid) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const normalizedPhone = phone.replace(/\D/g, '');
  const session = sessions.get(normalizedPhone);
  if (!session || !session.store) throw new Error(`No store found for ${phone}`);

  try {
    const store = session.store;
    const chats = store.chats?.all() || [];
    const linkedGroups = [];

    for (const chat of chats) {
      if (chat.id?.includes('@g.us')) {
        try {
          const metadata = await client.groupMetadata(chat.id);
          
          if (metadata.linkedParent === communityJid) {
            const profilePic = await client.profilePictureUrl(chat.id, 'image').catch(() => null);
            
            linkedGroups.push({
              id: chat.id,
              name: metadata.subject,
              description: metadata.desc || '',
              profilePicUrl: profilePic,
              memberCount: metadata.participants?.length || 0,
              isAnnounce: metadata.announce || false,
              isRestrict: metadata.restrict || false,
              createdAt: metadata.creation
            });
          }
        } catch (err) {
          console.error(`Error fetching metadata for ${chat.id}:`, err.message);
        }
      }
    }

    return {
      success: true,
      communityJid,
      linkedGroups,
      count: linkedGroups.length
    };
  } catch (error) {
    console.error('Error fetching linked groups:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch linked groups'
    };
  }
}
