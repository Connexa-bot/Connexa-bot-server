import fs from "fs/promises";
import path from "path";
import { AUTH_BASE_DIR, MEDIA_BASE_DIR } from "../config.js";

export async function ensureAuthDir(phone) {
  const authDir = path.join(AUTH_BASE_DIR, phone);
  await fs.mkdir(authDir, { recursive: true });
  return authDir;
}

export async function ensureMediaDir(phone) {
  const mediaDir = path.join(MEDIA_BASE_DIR, phone);
  await fs.mkdir(mediaDir, { recursive: true });
  return mediaDir;
}

export async function clearSession(phone, sessions) {
  const session = sessions.get(phone);
  if (session?.intervalId) clearInterval(session.intervalId);

  try {
    const authDir = path.join(AUTH_BASE_DIR, phone);
    await fs.rm(authDir, { recursive: true, force: true });
    sessions.delete(phone);
    console.log(`🗑️ Session cleared for ${phone}`);
  } catch (err) {
    console.error(`⚠️ Error clearing session for ${phone}:`, err.message);
  }
}
