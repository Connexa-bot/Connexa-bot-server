// controllers/chatActions.js
// ===============================
// Chat action helpers used by chats.js
// ===============================

import { getClient } from "../helpers/whatsapp.js";

/**
 * Send a message to a chat
 */
export async function sendMessage(phone, chatId, message) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.sendMessage(chatId, message);
  return { success: true, chatId, message };
}

/**
 * Delete a message from a chat
 */
export async function deleteMessage(phone, chatId, messageId) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const chat = await client.getChatById(chatId);
  await chat.deleteMessage(messageId, false);
  return { success: true, messageId };
}

/**
 * Mark a chat as read
 */
export async function markChatRead(phone, chatId) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const chat = await client.getChatById(chatId);
  await chat.sendSeen();
  return { success: true, chatId };
}

/**
 * Pin or unpin a chat
 */
export async function togglePinChat(phone, chatId, pin = true) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const chat = await client.getChatById(chatId);
  await chat.pin(pin);
  return { success: true, chatId, pinned: pin };
}
