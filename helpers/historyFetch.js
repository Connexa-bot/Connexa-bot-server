// helpers/historyFetch.js
// ===============================
// Message history fetching with pagination
// ===============================

import { getClient } from "./whatsapp.js";
import { sessions } from "./whatsapp.js";

/**
 * Get chat history with pagination
 * @param {string} phone - User's phone number
 * @param {string} chatId - Chat/Group/Channel JID
 * @param {object} options - Pagination options
 * @returns {Promise<object>} Messages with pagination info
 */
export async function getChatHistory(phone, chatId, options = {}) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const session = sessions.get(phone.replace(/\D/g, ''));
  if (!session || !session.store) throw new Error(`No store found for ${phone}`);

  const {
    limit = 50,
    cursor = null,
    direction = 'before',
    includeMedia = true
  } = options;

  try {
    let messages = [];
    const store = session.store;

    if (cursor) {
      messages = await client.fetchMessagesFromWA(
        chatId,
        limit,
        cursor
      );
    } else {
      const allMessages = store.messages?.[chatId];
      if (allMessages) {
        const messageArray = Array.from(allMessages.values());
        messages = messageArray
          .sort((a, b) => (b.messageTimestamp || 0) - (a.messageTimestamp || 0))
          .slice(0, limit);
      }
    }

    const formattedMessages = messages.map(msg => formatMessage(msg));

    const nextCursor = messages.length > 0 
      ? messages[messages.length - 1]?.key 
      : null;

    return {
      success: true,
      messages: formattedMessages,
      hasMore: messages.length === limit,
      nextCursor,
      count: formattedMessages.length
    };
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
}

/**
 * Format Baileys message to frontend DTO
 * @param {object} message - Baileys proto message
 * @returns {object} Formatted message
 */
export function formatMessage(message) {
  if (!message) return null;

  const msg = message.message || {};
  const key = message.key || {};

  const formatted = {
    id: key.id,
    chatId: key.remoteJid,
    fromMe: key.fromMe || false,
    participant: message.participant || key.participant,
    timestamp: message.messageTimestamp 
      ? parseInt(message.messageTimestamp) * 1000 
      : Date.now(),
    status: message.status || 'sent',
    type: getMessageType(msg),
    content: extractMessageContent(msg),
    hasMedia: hasMediaContent(msg),
    quoted: message.message?.extendedTextMessage?.contextInfo?.quotedMessage 
      ? formatMessage({
          message: message.message.extendedTextMessage.contextInfo.quotedMessage,
          key: message.message.extendedTextMessage.contextInfo.participant 
            ? { id: message.message.extendedTextMessage.contextInfo.stanzaId }
            : {}
        })
      : null,
    mentions: extractMentions(msg),
    reactions: message.reactions || [],
    starred: message.starred || false,
    forwarded: !!msg.extendedTextMessage?.contextInfo?.isForwarded,
    broadcast: !!msg.extendedTextMessage?.contextInfo?.isBroadcast
  };

  return formatted;
}

/**
 * Get message type
 */
function getMessageType(msg) {
  if (msg.conversation || msg.extendedTextMessage) return 'text';
  if (msg.imageMessage) return 'image';
  if (msg.videoMessage) return 'video';
  if (msg.audioMessage) return msg.audioMessage.ptt ? 'voice' : 'audio';
  if (msg.documentMessage) return 'document';
  if (msg.stickerMessage) return 'sticker';
  if (msg.locationMessage) return 'location';
  if (msg.liveLocationMessage) return 'liveLocation';
  if (msg.contactMessage) return 'contact';
  if (msg.contactsArrayMessage) return 'contacts';
  if (msg.pollCreationMessage) return 'poll';
  if (msg.pollUpdateMessage) return 'pollUpdate';
  if (msg.reactionMessage) return 'reaction';
  if (msg.listMessage) return 'list';
  if (msg.buttonsMessage) return 'buttons';
  if (msg.templateMessage) return 'template';
  if (msg.productMessage) return 'product';
  if (msg.orderMessage) return 'order';
  if (msg.invoiceMessage) return 'invoice';
  return 'unknown';
}

/**
 * Extract message content
 */
function extractMessageContent(msg) {
  if (msg.conversation) return { text: msg.conversation };
  if (msg.extendedTextMessage) return { 
    text: msg.extendedTextMessage.text,
    matchedText: msg.extendedTextMessage.matchedText,
    canonicalUrl: msg.extendedTextMessage.canonicalUrl,
    description: msg.extendedTextMessage.description,
    title: msg.extendedTextMessage.title
  };
  if (msg.imageMessage) return {
    caption: msg.imageMessage.caption,
    url: msg.imageMessage.url,
    mimetype: msg.imageMessage.mimetype,
    fileSha256: msg.imageMessage.fileSha256,
    fileLength: msg.imageMessage.fileLength,
    height: msg.imageMessage.height,
    width: msg.imageMessage.width
  };
  if (msg.videoMessage) return {
    caption: msg.videoMessage.caption,
    url: msg.videoMessage.url,
    mimetype: msg.videoMessage.mimetype,
    fileSha256: msg.videoMessage.fileSha256,
    fileLength: msg.videoMessage.fileLength,
    seconds: msg.videoMessage.seconds,
    gifPlayback: msg.videoMessage.gifPlayback
  };
  if (msg.audioMessage) return {
    url: msg.audioMessage.url,
    mimetype: msg.audioMessage.mimetype,
    fileSha256: msg.audioMessage.fileSha256,
    fileLength: msg.audioMessage.fileLength,
    seconds: msg.audioMessage.seconds,
    ptt: msg.audioMessage.ptt
  };
  if (msg.documentMessage) return {
    fileName: msg.documentMessage.fileName,
    url: msg.documentMessage.url,
    mimetype: msg.documentMessage.mimetype,
    fileSha256: msg.documentMessage.fileSha256,
    fileLength: msg.documentMessage.fileLength,
    caption: msg.documentMessage.caption
  };
  if (msg.locationMessage) return {
    latitude: msg.locationMessage.degreesLatitude,
    longitude: msg.locationMessage.degreesLongitude,
    name: msg.locationMessage.name,
    address: msg.locationMessage.address
  };
  if (msg.contactMessage) return {
    displayName: msg.contactMessage.displayName,
    vcard: msg.contactMessage.vcard
  };
  if (msg.pollCreationMessage) return {
    name: msg.pollCreationMessage.name,
    options: msg.pollCreationMessage.options,
    selectableCount: msg.pollCreationMessage.selectableOptionsCount
  };
  if (msg.reactionMessage) return {
    text: msg.reactionMessage.text,
    key: msg.reactionMessage.key
  };
  return {};
}

/**
 * Check if message has media
 */
function hasMediaContent(msg) {
  return !!(
    msg.imageMessage ||
    msg.videoMessage ||
    msg.audioMessage ||
    msg.documentMessage ||
    msg.stickerMessage
  );
}

/**
 * Extract mentions from message
 */
function extractMentions(msg) {
  if (msg.extendedTextMessage?.contextInfo?.mentionedJid) {
    return msg.extendedTextMessage.contextInfo.mentionedJid;
  }
  return [];
}
