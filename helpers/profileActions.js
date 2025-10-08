// helpers/profileActions.js
export const updateProfileName = async (sock, name) => {
  try {
    await sock.updateProfileName(name);
  } catch (err) {
    console.error("Failed to update profile name:", err);
    throw err;
  }
};

export const updateProfileStatus = async (sock, status) => {
  try {
    await sock.updateProfileStatus(status);
  } catch (err) {
    console.error("Failed to update profile status:", err);
    throw err;
  }
};

export const updateProfilePicture = async (sock, jid, imageBuffer) => {
  try {
    await sock.updateProfilePicture(jid, imageBuffer);
  } catch (err) {
    console.error("Failed to update profile picture:", err);
    throw err;
  }
};

export const removeProfilePicture = async (sock, jid) => {
  try {
    await sock.removeProfilePicture(jid);
  } catch (err) {
    console.error("Failed to remove profile picture:", err);
    throw err;
  }
};

export const getProfilePicture = async (sock, jid) => {
  try {
    const url = await sock.profilePictureUrl(jid, "image");
    return url;
  } catch (err) {
    console.error("Failed to get profile picture:", err);
    return null;
  }
};
