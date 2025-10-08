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
 * Add a participant to a group
 */
export async function addParticipant(phone, groupId, jids) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.groupParticipantsUpdate(groupId, Array.isArray(jids) ? jids : [jids], "add");
  return { success: true, groupId };
}

/**
 * Remove a participant from a group
 */
export async function removeParticipant(phone, groupId, jids) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.groupParticipantsUpdate(groupId, Array.isArray(jids) ? jids : [jids], "remove");
  return { success: true, groupId };
}

/**
 * Promote a participant
 */
export async function promoteParticipant(phone, groupId, jids) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.groupParticipantsUpdate(groupId, Array.isArray(jids) ? jids : [jids], "promote");
  return { success: true, groupId };
}

/**
 * Demote a participant
 */
export async function demoteParticipant(phone, groupId, jids) {
  const client = getClient(phone);
  if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

  await client.groupParticipantsUpdate(groupId, Array.isArray(jids) ? jids : [jids], "demote");
  return { success: true, groupId };
}

/**
 * Update group settings
 */
export async function updateGroupSettings(phone, groupId, settings) {
    const client = getClient(phone);
    if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

    await client.groupSettingUpdate(groupId, settings);
    return { success: true, groupId };
}

/**
 * Get group invite code
 */
export async function getGroupInviteCode(phone, groupId) {
    const client = getClient(phone);
    if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

    const code = await client.groupInviteCode(groupId);
    return { success: true, code };
}

/**
 * Revoke group invite code
 */
export async function revokeGroupInviteCode(phone, groupId) {
    const client = getClient(phone);
    if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

    await client.groupRevokeInvite(groupId);
    return { success: true };
}

/**
 * Accept group invite
 */
export async function acceptGroupInvite(phone, code) {
    const client = getClient(phone);
    if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

    await client.groupAcceptInvite(code);
    return { success: true };
}

/**
 * Get group metadata
 */
export async function getGroupMetadata(phone, groupId) {
    const client = getClient(phone);
    if (!client) throw new Error(`No active WhatsApp client for ${phone}`);

    const metadata = await client.groupMetadata(groupId);
    return { success: true, metadata };
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
