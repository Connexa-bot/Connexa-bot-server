import {
  createGroup,
  addParticipant,
  removeParticipant,
  promoteParticipant,
  demoteParticipant,
  updateGroupSubject,
  updateGroupDescription,
  updateGroupSettings,
  leaveGroup,
  getGroupInviteCode,
  revokeGroupInviteCode,
  acceptGroupInvite,
  getGroupMetadata,
} from "../helpers/groupActions.js"; // group actions

import { fetchGroups } from "../helpers/fetchers.js";

export async function listGroups(session) {
  return await fetchGroups(session.sock);
}

export const groupActions = {
  create: createGroup,
  add: addParticipant,
  remove: removeParticipant,
  promote: promoteParticipant,
  demote: demoteParticipant,
  updateSubject: updateGroupSubject,
  updateDescription: updateGroupDescription,
  updateSettings: updateGroupSettings,
  leave: leaveGroup,
  getInviteCode: getGroupInviteCode,
  revokeInviteCode: revokeGroupInviteCode,
  acceptInvite: acceptGroupInvite,
  getMetadata: getGroupMetadata,
};
