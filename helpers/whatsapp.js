import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  delay,
  downloadMediaMessage,
} from "baileys";
import fs from "fs/promises";
import path from "path";
import { makeInMemoryStore } from "@rodrigogs/baileys-store";
import dotenv from "dotenv";

dotenv.config();

// ===============================
// ⚙️ Environment Variables
// ===============================
const AUTH_BASE_DIR = process.env.AUTH_DIR || "./auth";
const MEDIA_BASE_DIR = process.env.MEDIA_DIR || "./media";
const MAX_QR_ATTEMPTS = parseInt(process.env.MAX_QR_ATTEMPTS || "3");
const CONNECTION_TIMEOUT_MS = parseInt(process.env.MAX_QR_WAIT || "60000");

// Session map to keep track of active sockets
export const sessions = new Map();

// ===============================
// 🧩 Helpers
// ===============================
export async function ensureAuthDir(phone) {
  const dir = path.join(AUTH_BASE_DIR, phone);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function ensureMediaDir(phone) {
  const dir = path.join(MEDIA_BASE_DIR, phone);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function clearSession(phone) {
  const session = sessions.get(phone);
  if (session?.intervalId) clearInterval(session.intervalId);
  try {
    const dir = path.join(AUTH_BASE_DIR, phone);
    await fs.rm(dir, { recursive: true, force: true });
    sessions.delete(phone);
    console.log(`🗑️ Session cleared for ${phone}`);
  } catch (err) {
    console.error(`⚠️ Error clearing session for ${phone}: ${err.message}`);
  }
}

export async function logoutFromWhatsApp(sock, phone) {
  try {
    await sock.logout();
    console.log(`🔑 Logged out for ${phone}`);
  } catch (err) {
    console.error(`⚠️ Logout failed for ${phone}: ${err.message}`);
  }
}

// ===============================
// 🤖 Core Bot Initialization
// ===============================
export async function startBot(phone, broadcast) {
  const normalizedPhone = phone.replace(/^\+|\s/g, "");
  const authDir = await ensureAuthDir(normalizedPhone);
  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();

  const store = makeInMemoryStore({});
  const storePath = path.join(authDir, "store.json");
  try {
    store.readFromFile(storePath);
  } catch {
    console.log("No store file found, creating a new one.");
  }

  const intervalId = setInterval(() => store.writeToFile(storePath), 10000);

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.ubuntu("Chrome"),
    syncFullHistory: false,
    connectTimeoutMs: CONNECTION_TIMEOUT_MS,
    keepAliveIntervalMs: 30000,
    defaultQueryTimeoutMs: 60000,
    retryRequestDelayMs: 250,
    markOnlineOnConnect: true,
    emitOwnEvents: false,
  });

  store.bind(sock.ev);
  sessions.set(normalizedPhone, {
    sock,
    store,
    connected: false,
    qrCode: null,
    linkCode: null,
    error: null,
    intervalId,
    qrAttempts: 0,
  });

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;
    const session = sessions.get(normalizedPhone);
    if (!session) return;

    // Handle QR codes
    if (qr && !state.creds.registered) {
      session.qrAttempts++;
      session.qrCode = qr;
      
      // Also request pairing code (link code) if not already requested
      if (!session.linkCode && session.qrAttempts === 1) {
        try {
          const code = await sock.requestPairingCode(normalizedPhone);
          session.linkCode = code;
          console.log(`🔗 Pairing code for ${normalizedPhone}: ${code}`);
          broadcast("linkCode", { phone: normalizedPhone, code });
        } catch (err) {
          console.error(`⚠️ Failed to get pairing code: ${err.message}`);
        }
      }
      
      if (session.qrAttempts >= MAX_QR_ATTEMPTS) {
        session.error = `❌ Max QR attempts reached (${MAX_QR_ATTEMPTS})`;
        sock.ws?.close();
        return;
      }
      broadcast("qr", { phone: normalizedPhone, qr });
    }

    // Connected
    if (connection === "open") {
      session.connected = true;
      session.error = null;
      session.qrCode = null;
      broadcast("status", { phone: normalizedPhone, connected: true });
    }

    // Closed
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown';
      const shouldReconnect = code !== 401 && code !== 403;
      session.connected = false;
      session.error = `Connection closed (code: ${code}, reason: ${reason})`;
      console.log(`❌ Connection closed for ${normalizedPhone}: ${session.error}`);
      broadcast("status", { phone: normalizedPhone, connected: false, error: session.error });

      if (shouldReconnect) {
        console.log(`🔁 Reconnecting ${normalizedPhone} in 5 seconds...`);
        await delay(5000);
        startBot(normalizedPhone, broadcast);
      } else {
        console.log(`🚫 Not reconnecting ${normalizedPhone} (logout required)`);
        await clearSession(normalizedPhone);
      }
    }

    sessions.set(normalizedPhone, session);
  });

  // Timeout auto-disconnect
  setTimeout(async () => {
    const session = sessions.get(normalizedPhone);
    if (session && !session.connected) {
      session.error = "⏳ Connection timeout";
      sock.ws?.close();
      await clearSession(normalizedPhone);
      broadcast("status", { phone: normalizedPhone, connected: false });
    }
  }, CONNECTION_TIMEOUT_MS);

  sock.ev.on("creds.update", saveCreds);
  return sock;
}

// ===============================
// 📩 Media Downloader
// ===============================
export async function downloadMedia(sock, msg, phone) {
  try {
    const mediaDir = await ensureMediaDir(phone);
    const stream = await downloadMediaMessage(msg, "buffer", {}, {});
    const ext = msg.message?.imageMessage
      ? "jpeg"
      : msg.message?.videoMessage
      ? "mp4"
      : msg.message?.audioMessage
      ? "mp3"
      : "bin";

    const filePath = path.join(mediaDir, `${msg.key.id}.${ext}`);
    await fs.writeFile(filePath, stream);
    return filePath;
  } catch (err) {
    console.error(`Failed to download media for ${phone}:`, err);
    return null;
  }
}

// ===============================
// 🟢 Helper to get the socket for a phone
// ===============================
export function getClient(phone) {
  const normalized = phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalized);
  if (!session) throw new Error(`No active session for ${phone}`);
  return session.sock;
}

// ===============================
// 🟢 Helper to get the store for a phone
// ===============================
export function getStore(phone) {
  const normalized = phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalized);
  if (!session) return null;
  return session.store;
}
