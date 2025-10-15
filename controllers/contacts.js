import { getContacts, blockContact, unblockContact, getBlockedUsers } from "../helpers/contactActions.js";

export const contactActions = {
  get: getContacts,
  block: blockContact,
  unblock: unblockContact,
  blocked: getBlockedUsers,
};
