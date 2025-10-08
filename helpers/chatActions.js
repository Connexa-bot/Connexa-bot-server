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
