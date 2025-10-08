import { downloadMedia } from "../helpers/whatsapp.js";
import { deleteMessage, forwardMessage, starMessage, reactToMessage, editMessage } from "../helpers/messageActions.js";

export async function fetchMedia(session, chatId, msgId, type, phone) {
  return await downloadMedia(session.sock, chatId, msgId, type, phone);
}

export const messageActions = {
  delete: deleteMessage,
  forward: forwardMessage,
  star: starMessage,
  react: reactToMessage,
  edit: editMessage,
};
