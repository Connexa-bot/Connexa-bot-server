import { getClient } from "./whatsapp.js";

// Archive a chat
export async function archiveChat(phone, chatId) {
  const sock = getClient(phone);
  await sock.chatModify({ archive: true }, chatId);
}

// Mute a chat
export async function muteChat(phone, chatId, duration) {
  const sock = getClient(phone);
  await sock.chatModify({ mute: duration }, chatId);
}

// Pin a chat
export async function pinChat(phone, chatId, pinned = true) {
  const sock = getClient(phone);
  await sock.chatModify({ pin: pinned }, chatId);
}

// Mark chat as read
export async function markChatRead(phone, chatId) {
  const sock = getClient(phone);
  await sock.chatModify({ markRead: true }, chatId);
}

// Mark chat as unread
export async function markChatUnread(phone, chatId) {
  const sock = getClient(phone);
  await sock.chatModify({ markRead: false }, chatId);
}

// Delete chat
export async function deleteChat(phone, chatId) {
  const sock = getClient(phone);
  await sock.chatModify({ clear: { messages: [{ id: "all" }] } }, chatId);
}

// Clear chat messages
export async function clearChat(phone, chatId) {
  const sock = getClient(phone);
  await sock.chatModify({ clear: { messages: [] } }, chatId);
  return { success: true };
}

// Star a chat
export async function starChat(phone, chatId, star = true) {
  const sock = getClient(phone);
  await sock.chatModify({ star }, chatId);
  return { success: true };
}

// Unarchive a chat
export async function unarchiveChat(phone, chatId) {
  const sock = getClient(phone);
  await sock.chatModify({ archive: false }, chatId);
  return { success: true };
}

// Unmute a chat
export async function unmuteChat(phone, chatId) {
  const sock = getClient(phone);
  await sock.chatModify({ mute: null }, chatId);
  return { success: true };
}

// Get chat labels (business feature)
export async function getChatLabels(phone) {
  const sock = getClient(phone);
  try {
    const labels = await sock.getLabels();
    return { success: true, labels };
  } catch (error) {
    return { success: false, message: 'Labels not supported or not a business account' };
  }
}

// Add label to chat (business feature)
export async function addChatLabel(phone, chatId, labelId) {
  const sock = getClient(phone);
  try {
    await sock.addChatLabel(chatId, labelId);
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Labels not supported or not a business account' };
  }
}

// Remove label from chat (business feature)
export async function removeChatLabel(phone, chatId, labelId) {
  const sock = getClient(phone);
  try {
    await sock.removeChatLabel(chatId, labelId);
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Labels not supported or not a business account' };
  }
}

// Set disappearing messages for a chat
export async function setDisappearingMessages(phone, chatId, duration) {
  const sock = getClient(phone);
  try {
    await sock.sendMessage(chatId, {
      disappearingMessagesInChat: duration
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to set disappearing messages:', error);
    throw error;
  }
}

// Get privacy settings
export async function getPrivacySettings(phone) {
  const sock = getClient(phone);
  try {
    const privacy = await sock.fetchPrivacySettings();
    return { success: true, privacy };
  } catch (error) {
    console.error('Failed to fetch privacy settings:', error);
    throw error;
  }
}

// Update privacy settings
export async function updatePrivacySettings(phone, setting, value) {
  const sock = getClient(phone);
  try {
    // Validate setting and value
    const validSettings = ['readreceipts', 'profile', 'status', 'online', 'last', 'groupadd', 'calladd'];
    const validValues = ['all', 'contacts', 'contact_blacklist', 'none'];
    
    if (!validSettings.includes(setting)) {
      throw new Error(`Invalid setting. Must be one of: ${validSettings.join(', ')}`);
    }
    if (!validValues.includes(value)) {
      throw new Error(`Invalid value. Must be one of: ${validValues.join(', ')}`);
    }
    
    // Use query method for privacy settings
    await sock.query({
      tag: 'iq',
      attrs: {
        to: '@s.whatsapp.net',
        type: 'set',
        xmlns: 'privacy'
      },
      content: [{
        tag: 'privacy',
        attrs: {},
        content: [{
          tag: 'category',
          attrs: { name: setting, value }
        }]
      }]
    });
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update privacy settings:', error);
    throw error;
  }
}

// Get business profile
export async function getBusinessProfile(phone, jid) {
  const sock = getClient(phone);
  try {
    const profile = await sock.getBusinessProfile(jid);
    return { success: true, profile };
  } catch (error) {
    console.error('Failed to fetch business profile:', error);
    return { success: false, message: 'Not a business account or profile unavailable' };
  }
}
