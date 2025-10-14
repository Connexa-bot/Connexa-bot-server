import { fetchChats } from "../helpers/fetchers.js";

export async function getChats(phone) {
  try {
    const result = await fetchChats(phone);
    return result;
  } catch (error) {
    return { success: false, chats: [], count: 0, error: error.message };
  }
}
