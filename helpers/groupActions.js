// helpers/groupActions.js
// ===============================
// Group action helpers used by controllers/groups.js
// ===============================

import { getClient } from "./whatsapp.js";

/**
 * Create a new group
 */
export async function createGroup(phone, name, participants) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  const group = await client.groupCreate(name, participants);
  return group;
}

/**
 * Add participants to a group
 */
export async function addParticipants(phone, groupId, jids) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.groupParticipantsUpdate(groupId, Array.isArray(jids) ? jids : [jids], "add");
  return { success: true, groupId };
}

/**
 * Remove participants from a group
 */
export async function removeParticipants(phone, groupId, jids) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.groupParticipantsUpdate(groupId, Array.isArray(jids) ? jids : [jids], "remove");
  return { success: true, groupId };
}

/**
 * Promote participants
 */
export async function promoteParticipants(phone, groupId, jids) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.groupParticipantsUpdate(groupId, Array.isArray(jids) ? jids : [jids], "promote");
  return { success: true, groupId };
}

/**
 * Demote participants
 */
export async function demoteParticipants(phone, groupId, jids) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.groupParticipantsUpdate(groupId, Array.isArray(jids) ? jids : [jids], "demote");
  return { success: true, groupId };
}

/**
 * Update group subject
 */
export async function updateGroupSubject(phone, groupId, subject) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.groupUpdateSubject(groupId, subject);
  return { success: true, groupId };
}

/**
 * Update group description
 */
export async function updateGroupDescription(phone, groupId, description) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.groupUpdateDescription(groupId, description);
  return { success: true, groupId };
}

/**
 * Leave a group
 */
export async function leaveGroup(phone, groupId) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.groupLeave(groupId);
  return { success: true, groupId };
}
