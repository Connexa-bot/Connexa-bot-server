import { getContacts, blockUser, unblockUser, getBlockedUsers } from "../helpers/contactActions.js";

export const contactActions = {
  get: getContacts,
  block: blockUser,
  unblock: unblockUser,
  blocked: getBlockedUsers,
};
