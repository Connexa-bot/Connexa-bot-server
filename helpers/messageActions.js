// helpers/messageActions.js
// ===============================
// Message action helpers used by controllers/messages.js
// ===============================

import { getClient } from "./whatsapp.js";

/**
 * Send a text message
 */
export async function sendMessage(phone, to, text) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const msg = await client.sendMessage(to, { text });
  return msg;
}

/**
 * Delete a message
 */
export async function deleteMessage(phone, chatId, messageKey) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.sendMessage(chatId, { delete: messageKey });
  return { success: true };
}

/**
 * Forward a message
 */
export async function forwardMessage(phone, to, message) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.sendMessage(to, { forward: message });
  return { success: true };
}

/**
 * React to a message
 */
export async function reactToMessage(phone, chatId, messageKey, emoji) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.sendMessage(chatId, {
    react: { text: emoji, key: messageKey },
  });
  return { success: true };
}

/**
 * Edit a message
 */
export async function editMessage(phone, chatId, messageKey, newText) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.sendMessage(chatId, { text: newText, edit: messageKey });
  return { success: true };
}
