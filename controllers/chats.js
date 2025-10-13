import { fetchChats } from "../helpers/fetchers.js";

export async function getChats(phone) {
  return await fetchChats(phone);
}
