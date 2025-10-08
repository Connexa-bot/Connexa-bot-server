// helpers/contactActions.js
import { fetchContacts as fetchContactsFromStore } from './fetchers.js';

/**
 * Get all contacts from the Baileys store
 * @param {object} store - Baileys in-memory store
 * @returns {Array} - Array of contacts
 */
export const getAllContacts = async (store) => {
  try {
    const contacts = await fetchContactsFromStore(store);
    return contacts;
  } catch (err) {
    console.error('Failed to get contacts:', err);
    return [];
  }
};

/**
 * Block a contact
 * @param {object} sock - Baileys socket instance
 * @param {string} jid - JID of contact to block
 */
export const blockContact = async (sock, jid) => {
  try {
    await sock.updateBlockStatus(jid, 'block');
  } catch (err) {
    console.error(`Failed to block contact ${jid}:`, err);
    throw err;
  }
};

/**
 * Unblock a contact
 * @param {object} sock - Baileys socket instance
 * @param {string} jid - JID of contact to unblock
 */
export const unblockContact = async (sock, jid) => {
  try {
    await sock.updateBlockStatus(jid, 'unblock');
  } catch (err) {
    console.error(`Failed to unblock contact ${jid}:`, err);
    throw err;
  }
};

/**
 * Get blocked contacts
 * @param {object} sock - Baileys socket instance
 * @returns {Array} - Array of blocked contacts
 */
export const getBlockedContacts = async (sock) => {
  try {
    const blocked = await sock.fetchBlocklist();
    return blocked;
  } catch (err) {
    console.error('Failed to fetch blocked contacts:', err);
    return [];
  }
};
