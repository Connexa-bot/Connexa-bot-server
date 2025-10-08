// helpers/fetchers.js
// ===============================
// Centralized WhatsApp data fetch utilities
// ===============================

import { getClient } from "./whatsapp.js";

// ✅ Fetch all chats for a given phone
export async function fetchChats(phone) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client found for ${phone}`);

  const chats = await client.fetchChats();
  return chats.map(c => ({
    id: c.id._serialized,
    name: c.name || c.formattedName,
    unreadCount: c.unreadCount,
    timestamp: c.timestamp,
  }));
}

// ✅ Fetch all messages for a chat
export async function fetchMessages(phone, chatId, limit = 50) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client found for ${phone}`);

  const chat = await client.getChatById(chatId);
  const messages = await chat.fetchMessages({ limit });
  return messages.map(m => ({
    id: m.id.id,
    body: m.body,
    fromMe: m.fromMe,
    timestamp: m.timestamp,
    type: m.type,
  }));
}

// ✅ Fetch contacts
export async function fetchContacts(phone) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client found for ${phone}`);

  const contacts = await client.getContacts();
  return contacts.map(c => ({
    id: c.id._serialized,
    name: c.name || c.pushname,
    number: c.id.user,
  }));
}

// ✅ Fetch groups
export async function fetchGroups(phone) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client found for ${phone}`);

  const groups = await client.getChats();
  return groups
    .filter(g => g.isGroup)
    .map(g => ({
      id: g.id._serialized,
      name: g.name,
      participantsCount: g.participants?.length || 0,
    }));
}
