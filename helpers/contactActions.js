// helpers/contactActions.js
import { fetchContacts as fetchContactsFromStore } from './fetchers.js';
import { getClient } from './whatsapp.js';

/**
 * Get all contacts from the Baileys store
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
 * Get specific contact
 */
export const getContact = async (phone, contactId) => {
  const sock = getClient(phone);
  try {
    const contact = await sock.onWhatsApp(contactId);
    return { success: true, contact };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Get profile picture
 */
export const getProfilePicture = async (phone, contactId) => {
  const sock = getClient(phone);
  try {
    const profilePicUrl = await sock.profilePictureUrl(contactId, 'image');
    return { success: true, profilePicUrl };
  } catch (err) {
    return { success: true, profilePicUrl: null, message: 'No profile picture' };
  }
};

/**
 * Get contact status/about
 */
export const getStatus = async (phone, contactId) => {
  const sock = getClient(phone);
  try {
    const status = await sock.fetchStatus(contactId);
    return { success: true, status };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Check if contact exists on WhatsApp
 */
export const checkIfContactExists = async (phone, phoneNumber) => {
  const sock = getClient(phone);
  try {
    const [result] = await sock.onWhatsApp(phoneNumber);
    return { success: true, exists: !!result, jid: result?.jid };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Block a contact
 */
export const blockContact = async (phone, contactId) => {
  const sock = getClient(phone);
  try {
    await sock.updateBlockStatus(contactId, 'block');
    return { success: true, message: 'Contact blocked' };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Unblock a contact
 */
export const unblockContact = async (phone, contactId) => {
  const sock = getClient(phone);
  try {
    await sock.updateBlockStatus(contactId, 'unblock');
    return { success: true, message: 'Contact unblocked' };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Get business profile
 */
export const getBusinessProfile = async (phone, contactId) => {
  const sock = getClient(phone);
  try {
    const profile = await sock.getBusinessProfile(contactId);
    return { success: true, profile };
  } catch (err) {
    return { success: false, error: err.message, message: 'Not a business account' };
  }
};

/**
 * Get blocked users
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
