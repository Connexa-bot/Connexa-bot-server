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
 * Mark a chat as unread
 */
export async function markChatUnread(phone, chatId) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const chat = await client.getChatById(chatId);
  await chat.markUnread();
  return { success: true, chatId };
}

/**
 * Archive a chat
 */
export async function archiveChat(phone, chatId, archive = true) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const chat = await client.getChatById(chatId);
  await chat.archive(archive);
  return { success: true, chatId, archived: archive };
}

/**
 * Mute a chat
 */
export async function muteChat(phone, chatId, duration) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const chat = await client.getChatById(chatId);
  await chat.mute(duration);
  return { success: true, chatId, duration };
}

/**
 * Delete a chat
 */
export async function deleteChat(phone, chatId) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const chat = await client.getChatById(chatId);
  await chat.delete();
  return { success: true, chatId };
}

/**
 * Pin or unpin a chat
 */
export async function pinChat(phone, chatId, pin = true) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const chat = await client.getChatById(chatId);
  await chat.pin(pin);
  return { success: true, chatId, pinned: pin };
}
