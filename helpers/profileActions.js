// helpers/profileActions.js
import { getClient } from "./whatsapp.js";

export const updateProfileName = async (phone, name) => {
  const sock = getClient(phone);
  if (!sock) throw new Error(`No active WhatsApp client for ${phone}`);
  
  try {
    await sock.updateProfileName(name);
    return { success: true, message: 'Profile name updated successfully' };
  } catch (err) {
    console.error("Failed to update profile name:", err);
    throw err;
  }
};

export const updateProfileStatus = async (phone, status) => {
  const sock = getClient(phone);
  if (!sock) throw new Error(`No active WhatsApp client for ${phone}`);
  
  try {
    await sock.updateProfileStatus(status);
    return { success: true, message: 'Profile status updated successfully' };
  } catch (err) {
    console.error("Failed to update profile status:", err);
    throw err;
  }
};

export const updateProfilePicture = async (phone, jid, imageBuffer) => {
  const sock = getClient(phone);
  if (!sock) throw new Error(`No active WhatsApp client for ${phone}`);
  
  try {
    await sock.updateProfilePicture(jid, imageBuffer);
    return { success: true, message: 'Profile picture updated successfully' };
  } catch (err) {
    console.error("Failed to update profile picture:", err);
    throw err;
  }
};

export const removeProfilePicture = async (phone, jid) => {
  const sock = getClient(phone);
  if (!sock) throw new Error(`No active WhatsApp client for ${phone}`);
  
  try {
    await sock.removeProfilePicture(jid);
    return { success: true, message: 'Profile picture removed successfully' };
  } catch (err) {
    console.error("Failed to remove profile picture:", err);
    throw err;
  }
};

export const getProfilePicture = async (phone, jid) => {
  const sock = getClient(phone);
  if (!sock) throw new Error(`No active WhatsApp client for ${phone}`);
  
  try {
    const url = await sock.profilePictureUrl(jid, "image");
    return { success: true, profilePicUrl: url };
  } catch (err) {
    console.error("Failed to get profile picture:", err);
    return { success: true, profilePicUrl: null, message: 'No profile picture' };
  }
};
