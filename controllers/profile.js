import {
  updateProfileName,
  updateProfileStatus,
  updateProfilePicture,
  removeProfilePicture,
  getProfilePicture,
} from "../helpers/profileActions.js";

export const profileActions = {
  updateName: updateProfileName,
  updateStatus: updateProfileStatus,
  updatePicture: updateProfilePicture,
  removePicture: removeProfilePicture,
  getPicture: getProfilePicture,
};
