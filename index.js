import express from "express";
import cors from "cors";
import {
  makeWASocket,
  useMultiFileAuthState,
  Browsers,
  jidDecode,
  delay,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
} from "baileys";
import { makeInMemoryStore } from "@rodrigogs/baileys-store";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" })); // For media base64

const PORT = process.env.PORT || 5000;
const AUTH_BASE_DIR = "./auth";
const MEDIA_BASE_DIR = "./media";
const sessions = new Map();
const MAX_QR_ATTEMPTS = 3;
const CONNECTION_TIMEOUT_MS = 60000;

// --- Helpers ---
async function ensureAuthDir(phone) {
  const authDir = path.join(AUTH_BASE_DIR, phone);
  await fs.mkdir(authDir, { recursive: true });
  return authDir;
}
async function ensureMediaDir(phone) {
  const mediaDir = path.join(MEDIA_BASE_DIR, phone);
  await fs.mkdir(mediaDir, { recursive: true });
  return mediaDir;
}
async function clearSession(phone) {
  const session = sessions.get(phone);
  if (session?.intervalId) {
    clearInterval(session.intervalId);
  }
  try {
    const authDir = path.join(AUTH_BASE_DIR, phone);
    await fs.rm(authDir, { recursive: true, force: true });
    sessions.delete(phone);
    console.log(`🗑️ Session cleared for ${phone}`);
  } catch (err) {
    console.error(`⚠️ Error clearing session for ${phone}:`, err.message);
  }
}
async function logoutFromWhatsApp(sock, phone) {
  try {
    await sock.logout();
    console.log(`🔑 Logged out from WhatsApp for ${phone}`);
  } catch (err) {
    console.error(`⚠️ Error logging out for ${phone}:`, err.message);
  }
}

// --- WebSocket support ---
import { WebSocketServer } from "ws";
const server = app.listen(PORT, () => {
  console.log(`🌍 Backend running on http://localhost:${PORT}`);
});
const wss = new WebSocketServer({ server });
let wsClients = [];
wss.on("connection", (ws) => {
  wsClients.push(ws);
  ws.on("close", () => {
    wsClients = wsClients.filter((c) => c !== ws);
  });
});
function broadcast(event, data) {
  wsClients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ event, data }));
    }
  });
}

// --- WhatsApp Connection ---
async function startBot(phone, isReconnect = false) {
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
  const intervalId = setInterval(() => {
    store.writeToFile(storePath);
  }, 10_000);

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.ubuntu("Chrome"),
    syncFullHistory: false,
    connectTimeoutMs: CONNECTION_TIMEOUT_MS,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
  });

  store.bind(sock.ev);

  let qrAttempts = 0;
  let pairingCodeRequested = false;
  sessions.set(normalizedPhone, {
    sock,
    store,
    qrCode: null,
    linkCode: null,
    connected: false,
    error: null,
    qrAttempts,
    intervalId,
  });

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;
    const session = sessions.get(normalizedPhone);
    if (!session) return;

    if (qr && !state.creds.registered) {
      qrAttempts++;
      session.qrCode = qr;
      session.qrAttempts = qrAttempts;
      if (!pairingCodeRequested) {
        try {
          const code = await sock.requestPairingCode(normalizedPhone);
          session.linkCode = code;
          pairingCodeRequested = true;
        } catch (err) {
          session.error = `Pairing code error: ${err.message}`;
        }
      }
      if (qrAttempts >= MAX_QR_ATTEMPTS) {
        session.error = `Failed to connect: Max QR attempts reached (${MAX_QR_ATTEMPTS})`;
        if (sock.ws.readyState !== sock.ws.CLOSED) {
          sock.ws.close();
        }
        return;
      }
    }

    if (connection === "open") {
      session.connected = true;
      session.qrCode = null;
      session.linkCode = null;
      session.error = null;
      session.qrAttempts = 0;
      pairingCodeRequested = false;
      broadcast("status", { phone: normalizedPhone, connected: true });
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== 401;

      const errorMsg = lastDisconnect?.error?.message || `Connection closed.`;
      session.connected = false;
      session.error = `Connection failed: ${errorMsg} (Code: ${statusCode})`;

      console.log(`Connection closed: ${errorMsg}`);
      broadcast("status", { phone: normalizedPhone, connected: false, error: session.error });

      if (shouldReconnect) {
        console.log("Attempting to reconnect...");
        await delay(5000);
        startBot(normalizedPhone, true);
      } else {
        console.log("Connection closed permanently. Clearing session.");
        await clearSession(normalizedPhone);
      }
      return;
    }

    sessions.set(normalizedPhone, session);
  });

  setTimeout(async () => {
    const session = sessions.get(normalizedPhone);
    if (!session) return;
    if (!session.connected) {
      session.error = `Connection failed: Timeout after ${CONNECTION_TIMEOUT_MS / 1000}s`;
      if (sock.ws.readyState !== sock.ws.CLOSED) {
        await logoutFromWhatsApp(sock, normalizedPhone);
        sock.ws.close();
      }
      await clearSession(normalizedPhone);
      broadcast("status", { phone: normalizedPhone, connected: false });
      return;
    }
  }, CONNECTION_TIMEOUT_MS);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    const from = msg.key.remoteJid;
    const content = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "[non-text]";
    broadcast("new_message", { from, content, msg });
  });

  sock.ev.on("groups.update", (update) => {
    broadcast("groups_update", update);
  });

  sock.ev.on("chats.update", (update) => {
    broadcast("chats_update", update);
  });

  sock.ev.on("contacts.update", (update) => {
    broadcast("contacts_update", update);
  });

  return sock;
}

// --- WhatsApp Data Fetchers ---
const fetchChats = async (store) => {
  try {
    return store.chats.all();
  } catch (err) {
    console.error("Failed to fetch chats:", err);
    return [];
  }
};
const fetchGroups = async (sock) => {
  try {
    const groups = await sock.groupFetchAllParticipating();
    return Object.values(groups);
  } catch (err) {
    console.error("Failed to fetch groups:", err);
    return [];
  }
};
const fetchCommunities = async (sock) => {
  try {
    const communities = await sock.groupFetchAllParticipating();
    return Object.values(communities).filter((c) => c.parent === null);
  } catch (err) {
    console.error("Failed to fetch communities:", err);
    return [];
  }
};
const fetchChannels = async (sock) => {
  try {
    const channels = await sock.getAllNewsletters();
    return channels;
  } catch (err) {
    console.error("Failed to fetch channels:", err);
    return [];
  }
};
const fetchStatuses = async (sock) => {
  try {
    const statuses = await sock.fetchStatus();
    return statuses;
  } catch (err) {
    console.error("Failed to fetch statuses:", err);
    return [];
  }
};
const fetchMessages = async (sock, chatId) => {
  try {
    // Corrected function call based on Baileys documentation
    const messages = await sock.fetchMessageHistory(chatId, { count: 100 });
    return messages;
  } catch (err) {
    console.error(`Failed to fetch messages for ${chatId}:`, err);
    return [];
  }
};
const downloadMedia = async (sock, chatId, msgId, type, phone) => {
  try {
    const msg = await sock.loadMessage(chatId, msgId);
    if (!msg) return null;

    const mediaDir = await ensureMediaDir(phone);
    const mediaType =
      type ||
      (msg.message?.imageMessage
        ? "image"
        : msg.message?.videoMessage
        ? "video"
        : msg.message?.audioMessage
        ? "audio"
        : "document");
    const stream = await downloadMediaMessage(msg, "buffer", {}, {});
    const ext = mediaType === "image" ? "jpeg" : "mp4"; // Basic extension mapping
    const filePath = path.join(mediaDir, `${msgId}.${ext}`);
    await fs.writeFile(filePath, stream);
    return filePath;
  } catch (err) {
    console.error("Failed to download media:", err);
    return null;
  }
};
const addParticipant = async (sock, groupId, jid) => {
  try {
    await sock.groupParticipantsUpdate(groupId, [jid], "add");
  } catch (err) {
    console.error("Failed to add participant:", err);
    throw err;
  }
};
const removeParticipant = async (sock, groupId, jid) => {
  try {
    await sock.groupParticipantsUpdate(groupId, [jid], "remove");
  } catch (err) {
    console.error("Failed to remove participant:", err);
    throw err;
  }
};
const promoteParticipant = async (sock, groupId, jid) => {
  try {
    await sock.groupParticipantsUpdate(groupId, [jid], "promote");
  } catch (err) {
    console.error("Failed to promote participant:", err);
    throw err;
  }
};
const demoteParticipant = async (sock, groupId, jid) => {
  try {
    await sock.groupParticipantsUpdate(groupId, [jid], "demote");
  } catch (err) {
    console.error("Failed to demote participant:", err);
    throw err;
  }
};

// --- API Endpoints ---
app.get("/", (req, res) => {
  res.send("🚀 WhatsApp Bot Backend running...");
});

// --- UPDATED /connect ---
app.post("/connect", async (req, res) => {
  const { phone } = req.body;
  const normalizedPhone = phone.replace(/^\+|\s/g, "");
  if (!phone) return res.status(400).json({ error: "Phone number is required" });

  try {
    if (sessions.has(normalizedPhone)) {
      await clearSession(normalizedPhone);
    }

    // Start the bot, but don't wait for the function to finish,
    // as the codes are generated via async events.
    startBot(normalizedPhone).catch((err) => {
      console.error(`Error starting bot for ${normalizedPhone}:`, err);
    });

    // Poll for the session data until codes are available or we time out.
    let attempts = 0;
    const maxAttempts = 30; // Wait for 30 seconds max
    const interval = setInterval(() => {
      const session = sessions.get(normalizedPhone);
      attempts++;

      // If we have data, or an error, or we're connected, or we've tried too many times
      if (
        session &&
        (session.qrCode ||
          session.linkCode ||
          session.connected ||
          session.error ||
          attempts > maxAttempts)
      ) {
        clearInterval(interval);
        if (attempts > maxAttempts && !session.connected && !session.error) {
          session.error = "Connection timed out. Please try again.";
        }
        res.json({
          qrCode: session?.qrCode || null,
          linkCode: session?.linkCode || null,
          message: session?.error || "Session initiated",
          connected: session?.connected || false,
        });
      }
    }, 1000);
  } catch (err) {
    res.status(500).json({ error: `Failed to connect: ${err.message}` });
  }
});

// --- UPDATED /status/:phone ---
app.get("/status/:phone", async (req, res) => {
  const normalizedPhone = req.params.phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session) return res.json({ connected: false, error: "No session found" });

  res.json({
    connected: session.connected,
    qrCode: !session.connected ? session.qrCode : null,
    linkCode: session.linkCode,
    error: session.error,
  });
});

// --- keep all other endpoints unchanged ---
app.get("/chats/:phone", async (req, res) => {
  const normalizedPhone = req.params.phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  const chats = await fetchChats(session.store);
  res.json({ chats });
});

app.get("/groups/:phone", async (req, res) => {
  const normalizedPhone = req.params.phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  const groups = await fetchGroups(session.sock);
  res.json({ groups });
});

app.get("/communities/:phone", async (req, res) => {
  const normalizedPhone = req.params.phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  const communities = await fetchCommunities(session.sock);
  res.json({ communities });
});

app.get("/channels/:phone", async (req, res) => {
  const normalizedPhone = req.params.phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  const channels = await fetchChannels(session.sock);
  res.json({ channels });
});

app.get("/statuses/:phone", async (req, res) => {
  const normalizedPhone = req.params.phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  const statuses = await fetchStatuses(session.sock);
  res.json({ statuses });
});

app.get("/messages/:phone/:chatId", async (req, res) => {
  const normalizedPhone = req.params.phone.replace(/^\+|\s/g, "");
  const chatId = req.params.chatId;
  const session = sessions.get(normalizedPhone);
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  const messages = await fetchMessages(session.sock, chatId);
  res.json({ messages });
});

// --- Media download ---
app.get("/media/:phone/:chatId/:msgId/:type?", async (req, res) => {
  const { phone, chatId, msgId, type } = req.params;
  const normalizedPhone = phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  try {
    const filePath = await downloadMedia(session.sock, chatId, msgId, type, normalizedPhone);
    if (!filePath) return res.status(404).json({ error: "Media not found" });
    res.sendFile(path.resolve(filePath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Send message (text/media/status) ---
app.post("/send-message", async (req, res) => {
  const { phone, to, message, type, base64, mimetype, caption } = req.body;
  const normalizedPhone = phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  try {
    let sendOpts = {};
    if (type === "image" && base64) {
      sendOpts = { image: Buffer.from(base64, "base64"), mimetype: mimetype || "image/jpeg", caption: caption || "" };
    } else if (type === "video" && base64) {
      sendOpts = { video: Buffer.from(base64, "base64"), mimetype: mimetype || "video/mp4", caption: caption || "" };
    } else if (type === "audio" && base64) {
      sendOpts = { audio: Buffer.from(base64, "base64"), mimetype: mimetype || "audio/mp3" };
    } else if (type === "document" && base64) {
      sendOpts = { document: Buffer.from(base64, "base64"), mimetype: mimetype || "application/pdf", fileName: caption || "file" };
    } else {
      sendOpts = { text: message };
    }
    await session.sock.sendMessage(to, sendOpts);
    res.json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    res.status(500).json({ error: `Failed to send message: ${err.message}` });
  }
});

app.post("/poststatus", async (req, res) => {
  const { phone, text, base64, type, mimetype } = req.body;
  const normalizedPhone = phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  try {
    let opts = {};
    if (base64 && type === "image") {
      opts = { image: Buffer.from(base64, "base64"), mimetype: mimetype || "image/jpeg", caption: text || "" };
    } else if (base64 && type === "video") {
      opts = { video: Buffer.from(base64, "base64"), mimetype: mimetype || "video/mp4", caption: text || "" };
    } else {
      opts = { text: text || "" };
    }
    await session.sock.sendMessage(session.sock.user.id, opts, { status: true });
    res.json({ success: true, message: "Status posted successfully" });
  } catch (err) {
    res.status(500).json({ error: `Failed to post status: ${err.message}` });
  }
});

// --- Group/Community/Channel admin actions ---
app.post("/group/add", async (req, res) => {
  const { phone, groupId, jid } = req.body;
  const session = sessions.get(phone.replace(/^\+|\s/g, ""));
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  try {
    await addParticipant(session.sock, groupId, jid);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/group/remove", async (req, res) => {
  const { phone, groupId, jid } = req.body;
  const session = sessions.get(phone.replace(/^\+|\s/g, ""));
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  try {
    await removeParticipant(session.sock, groupId, jid);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/group/promote", async (req, res) => {
  const { phone, groupId, jid } = req.body;
  const session = sessions.get(phone.replace(/^\+|\s/g, ""));
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  try {
    await promoteParticipant(session.sock, groupId, jid);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/group/demote", async (req, res) => {
  const { phone, groupId, jid } = req.body;
  const session = sessions.get(phone.replace(/^\+|\s/g, ""));
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  try {
    await demoteParticipant(session.sock, groupId, jid);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/logout", async (req, res) => {
  const { phone } = req.body;
  const normalizedPhone = phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (session && session.sock.ws.readyState !== session.sock.ws.CLOSED) {
    await logoutFromWhatsApp(session.sock, normalizedPhone);
  }
  await clearSession(normalizedPhone);
  res.json({ message: "Session cleared. Please reconnect." });
});
