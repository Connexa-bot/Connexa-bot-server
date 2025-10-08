// helpers/contactActions.js
import { fetchContacts as fetchContactsFromStore } from './fetchers.js';

/**
 * Get all contacts from the Baileys store
 * @param {object} store - Baileys in-memory store
 * @returns {Array} - Array of contacts
 */
export const getContacts = async (store) => {
  try {
    const contacts = await fetchContactsFromStore(store);
    return contacts;
  } catch (err) {
    console.error('Failed to get contacts:', err);
    return [];
  }
};

/**
 * Block a user
 * @param {object} sock - Baileys socket instance
 * @param {string} jid - JID of user to block
 */
export const blockUser = async (sock, jid) => {
  try {
    await sock.updateBlockStatus(jid, 'block');
  } catch (err) {
    console.error(`Failed to block user ${jid}:`, err);
    throw err;
  }
};

/**
 * Unblock a user
 * @param {object} sock - Baileys socket instance
 * @param {string} jid - JID of user to unblock
 */
export const unblockUser = async (sock, jid) => {
  try {
    await sock.updateBlockStatus(jid, 'unblock');
  } catch (err) {
    console.error(`Failed to unblock user ${jid}:`, err);
    throw err;
  }
};

/**
 * Get blocked users
 * @param {object} sock - Baileys socket instance
 * @returns {Array} - Array of blocked users
 */
export const getBlockedUsers = async (sock) => {
  try {
    const blocked = await sock.fetchBlocklist();
    return blocked;
  } catch (err) {
    console.error('Failed to fetch blocked users:', err);
    return [];
  }
};
