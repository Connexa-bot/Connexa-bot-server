import { fetchChats } from "../helpers/fetchers.js"; // we'll create fetchers.js for reusable fetch functions
import { archiveChat, muteChat, pinChat, markChatRead, markChatUnread, deleteChat } from "./chatActions.js"; // chat actions

export async function getChats(session) {
  return await fetchChats(session.store, session.sock);
}

export async function archive(session, chatId, archive = true) {
  await archiveChat(session.sock, chatId, archive);
}

export async function mute(session, chatId, duration) {
  await muteChat(session.sock, chatId, duration);
}

export async function pin(session, chatId, pin = true) {
  await pinChat(session.sock, chatId, pin);
}

export async function markRead(session, chatId) {
  await markChatRead(session.sock, chatId);
}

export async function markUnread(session, chatId) {
  await markChatUnread(session.sock, chatId);
}

export async function deleteSingleChat(session, chatId) {
  await deleteChat(session.sock, chatId);
}
