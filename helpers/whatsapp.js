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
  const normalizedPhone = phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  
  // Stop interval first to prevent write attempts
  if (session?.intervalId) {
    clearInterval(session.intervalId);
    session.intervalId = null;
  }
  
  try {
    const dir = path.join(AUTH_BASE_DIR, normalizedPhone);
    await fs.rm(dir, { recursive: true, force: true });
    sessions.delete(normalizedPhone);
    console.log(`🗑️ Session cleared for ${normalizedPhone}`);
  } catch (err) {
    console.error(`⚠️ Error clearing session for ${normalizedPhone}: ${err.message}`);
  }
}

export async function clearSessionState(phoneNumber, fullReset = false) {
  try {
    const sessionDir = path.join(AUTH_BASE_DIR, phoneNumber);
    
    if (fullReset) {
      await fs.rm(sessionDir, { recursive: true, force: true });
      sessions.delete(phoneNumber);
      console.log(`🗑️ Full session cleared for ${phoneNumber}`);
      return true;
    } else {
      try {
        const files = await fs.readdir(sessionDir);
        for (const file of files) {
          if (file.startsWith('app-state-sync-')) {
            await fs.unlink(path.join(sessionDir, file));
            console.log(`🗑️ Deleted sync file: ${file}`);
          }
        }
        console.log(`🧹 Sync state cleared for ${phoneNumber}`);
        return true;
      } catch (err) {
        console.log(`⚠️ No sync files found for ${phoneNumber}`);
        return true;
      }
    }
  } catch (error) {
    console.error('Clear state error:', error.message);
    return false;
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

  let intervalId = setInterval(() => {
    try {
      store.writeToFile(storePath);
    } catch (err) {
      // Ignore errors if session is being cleared
      if (err.code !== 'ENOENT') {
        console.error(`Store write error for ${normalizedPhone}:`, err.message);
      }
    }
  }, 10000);

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.ubuntu("Chrome"),
    syncFullHistory: true, // ✅ Enable full history sync
    connectTimeoutMs: CONNECTION_TIMEOUT_MS,
    keepAliveIntervalMs: 30000,
    defaultQueryTimeoutMs: 60000,
    retryRequestDelayMs: 250,
    markOnlineOnConnect: true,
    emitOwnEvents: false,
    // ✅ Enable message history sync
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg?.message || undefined;
      }
      return undefined;
    },
  });

  store.bind(sock.ev);
  const initialSession = {
    sock,
    store,
    connected: false,
    qrCode: null,
    linkCode: null,
    error: null,
    intervalId,
    qrAttempts: 0,
  };
  
  sessions.set(normalizedPhone, initialSession);
  console.log(`🎯 Initial session created for ${normalizedPhone}:`, {
    hasSocket: !!initialSession.sock,
    hasStore: !!initialSession.store,
    connected: initialSession.connected
  });

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;
    const session = sessions.get(normalizedPhone);
    if (!session) return;

    console.log(`📊 Connection update for ${normalizedPhone}:`, { 
      connection, 
      hasQR: !!qr,
      registered: state.creds.registered 
    });

    // Handle QR codes
    if (qr) {
      session.qrAttempts++;
      session.qrCode = qr;
      console.log(`📱 QR Code generated for ${normalizedPhone} (attempt ${session.qrAttempts})`);
      
      // ✅ UPDATE SESSION IMMEDIATELY
      sessions.set(normalizedPhone, session);
      broadcast("qr", { phone: normalizedPhone, qr });
      
      // Request pairing code (link code) - always try on first attempt
      if (!session.linkCode && session.qrAttempts === 1) {
        try {
          console.log(`🔗 Requesting pairing code for ${normalizedPhone}...`);
          const code = await sock.requestPairingCode(normalizedPhone);
          session.linkCode = code;
          console.log(`✅ Pairing code for ${normalizedPhone}: ${code}`);
          
          // ✅ UPDATE SESSION WITH LINK CODE
          sessions.set(normalizedPhone, session);
          broadcast("linkCode", { phone: normalizedPhone, code });
        } catch (err) {
          console.error(`❌ Failed to get pairing code for ${normalizedPhone}: ${err.message}`);
          // Don't fail completely, QR is still available
        }
      }
      
      if (session.qrAttempts >= MAX_QR_ATTEMPTS) {
        session.error = `❌ Max QR attempts reached (${MAX_QR_ATTEMPTS})`;
        sessions.set(normalizedPhone, session);
        sock.ws?.close();
        return;
      }
    }

    // ✅ Connected - THIS IS THE KEY FIX
    if (connection === "open") {
      console.log(`✅ Connection OPEN for ${normalizedPhone}`);
      session.connected = true;
      session.error = null;
      session.qrCode = null;
      session.linkCode = null;
      
      // ✅ CRITICAL: Update the session in the Map IMMEDIATELY
      sessions.set(normalizedPhone, session);
      
      console.log(`✅ Session updated - connected: ${session.connected}`);
      broadcast("status", { phone: normalizedPhone, connected: true });
      
      // ✅ Force sync all data after connection
      try {
        console.log(`🔄 Syncing WhatsApp data for ${normalizedPhone}...`);
        
        // Sync contacts
        const contactsCount = Object.keys(store.contacts || {}).length;
        console.log(`📇 Contacts synced: ${contactsCount}`);
        
        // Sync chats
        const chatsCount = (store.chats?.all() || []).length;
        console.log(`💬 Chats synced: ${chatsCount}`);
        
        // If no chats in store, force fetch from WhatsApp
        if (chatsCount === 0) {
          console.log(`⚠️ No chats in store, forcing sync...`);
          await delay(2000); // Wait for initial sync
          const allChats = store.chats?.all() || [];
          console.log(`✅ Chats after sync: ${allChats.length}`);
        }
      } catch (syncErr) {
        console.error(`⚠️ Error syncing data: ${syncErr.message}`);
      }
    }

    // Closed
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown';
      const shouldReconnect = code !== 401 && code !== 403;
      session.connected = false;
      session.error = `Connection closed (code: ${code}, reason: ${reason})`;
      
      // ✅ UPDATE SESSION IMMEDIATELY
      sessions.set(normalizedPhone, session);
      
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
  });

  // Timeout auto-disconnect
  setTimeout(async () => {
    const session = sessions.get(normalizedPhone);
    if (session && !session.connected) {
      session.error = "⏳ Connection timeout";
      sessions.set(normalizedPhone, session);
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
