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
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
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
async function startBot(phone) {
  const normalizedPhone = phone.replace(/^\+|\s/g, "");
  if (sessions.has(normalizedPhone)) {
    const session = sessions.get(normalizedPhone);
    if (session.sock?.ws?.readyState !== session.sock?.ws?.CLOSED) {
      await logoutFromWhatsApp(session.sock, normalizedPhone);
      session.sock.ws.close();
    }
    await clearSession(normalizedPhone);
  }

  const authDir = await ensureAuthDir(normalizedPhone);
  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();

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

  let qrAttempts = 0;
  let pairingCodeRequested = false;
  sessions.set(normalizedPhone, {
    sock,
    qrCode: null,
    linkCode: null,
    connected: false,
    error: null,
    qrAttempts
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
          await delay(10000);
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
          await logoutFromWhatsApp(sock, normalizedPhone);
          sock.ws.close();
        }
        await clearSession(normalizedPhone);
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
      const errorMsg = lastDisconnect?.error?.message || "Unknown error";
      session.error = `Connection failed: ${errorMsg} (Code: ${statusCode})`;
      if (sock.ws.readyState !== sock.ws.CLOSED) {
        await logoutFromWhatsApp(sock, normalizedPhone);
        sock.ws.close();
      }
      await clearSession(normalizedPhone);
      broadcast("status", { phone: normalizedPhone, connected: false });
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
async function fetchChats(sock) {
  try {
    const chats = Object.values(sock.chats || {});
    return chats.map(chat => ({
      id: chat.id || chat.jid,
      name: chat.name || jidDecode(chat.jid)?.user || "Unknown",
      unread: chat.unreadCount,
      isGroup: chat.id?.endsWith("@g.us") || false,
    }));
  } catch {
    return [];
  }
}
async function fetchGroups(sock) {
  try {
    const groups = await sock.groupFetchAllParticipating();
    return Object.values(groups).map(group => ({
      id: group.id,
      name: group.subject,
      participants: group.participants.length,
      owner: group.owner
    }));
  } catch {
    return [];
  }
}
async function fetchCommunities(sock) {
  try {
    const communities = await sock.fetchCommunities?.() || [];
    return communities.map(comm => ({
      id: comm.id,
      name: comm.name || "Unnamed Community",
    }));
  } catch {
    return [];
  }
}
async function fetchChannels(sock) {
  try {
    const channels = await sock.getChannels?.() || [];
    return channels.map(chan => ({
      id: chan.id,
      name: chan.name || "Unnamed Channel",
      description: chan.description,
      participants: chan.participants?.length
    }));
  } catch {
    return [];
  }
}
async function fetchStatuses(sock) {
  try {
    const statuses = await sock.fetchStatus?.() || [];
    return statuses.map(status => ({
      id: status.jid,
      content: status.status,
      timestamp: new Date(status.timestamp * 1000).toLocaleString(),
    }));
  } catch {
    return [];
  }
}
async function fetchMessages(sock, chatId) {
  try {
    const history = await sock.fetchMessagesFromWA(chatId, 30);
    return history.map(msg => {
      const mediaType = msg.message?.imageMessage
        ? "image"
        : msg.message?.videoMessage
        ? "video"
        : msg.message?.audioMessage
        ? "audio"
        : msg.message?.documentMessage
        ? "document"
        : msg.message?.stickerMessage
        ? "sticker"
        : undefined;
      return {
        id: msg.key.id,
        from: msg.key.remoteJid,
        to: msg.key.participant || msg.key.remoteJid,
        content: msg.message?.conversation || msg.message?.extendedTextMessage?.text || "",
        timestamp: msg.messageTimestamp ? new Date(msg.messageTimestamp * 1000).toLocaleString() : "",
        isBot: msg.key.fromMe,
        mediaType,
        hasMedia: !!mediaType
      };
    });
  } catch {
    return [];
  }
}
async function downloadMedia(sock, chatId, msgId, type, phone) {
  const history = await sock.fetchMessagesFromWA(chatId, 30);
  const msg = history.find(m => m.key.id === msgId);
  if (!msg) return null;
  const stream = await downloadMediaMessage(msg, "buffer", {});
  if (!stream) return null;
  const mediaDir = await ensureMediaDir(phone);
  const ext = type || "bin";
  const filename = `${msgId}.${ext}`;
  const filePath = path.join(mediaDir, filename);
  await fs.writeFile(filePath, stream);
  return filePath;
}

// --- Group/Community/Channel Management (basic examples) ---
async function addParticipant(sock, groupId, jid) {
  return await sock.groupAdd(groupId, [jid]);
}
async function removeParticipant(sock, groupId, jid) {
  return await sock.groupRemove(groupId, [jid]);
}
async function promoteParticipant(sock, groupId, jid) {
  return await sock.groupMakeAdmin(groupId, [jid]);
}
async function demoteParticipant(sock, groupId, jid) {
  return await sock.groupDemoteAdmin(groupId, [jid]);
}

// --- API Endpoints ---
app.get("/", (req, res) => {
  res.send("🚀 WhatsApp Bot Backend running...");
});

app.post("/connect", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number is required" });
  try {
    await startBot(phone);
    const session = sessions.get(phone.replace(/^\+|\s/g, ""));
    let qrCodeDataUrl = null;
    if (session && session.qrCode) {
      qrCodeDataUrl = await QRCode.toDataURL(session.qrCode);
    }
    res.json({
      qrCodeDataUrl,
      linkCode: session?.linkCode,
      message: session?.error || "Session initiated",
      connected: session?.connected,
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to connect: ${err.message}` });
  }
});

app.get("/status/:phone", async (req, res) => {
  const normalizedPhone = req.params.phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session) return res.json({ connected: false, error: "No session found" });

  let qrCodeDataUrl = null;
  if (!session.connected && session.qrCode) {
    qrCodeDataUrl = await QRCode.toDataURL(session.qrCode);
  }
  res.json({
    connected: session.connected,
    qrCodeDataUrl,
    linkCode: session.linkCode,
    error: session.error,
  });
});

app.get("/chats/:phone", async (req, res) => {
  const normalizedPhone = req.params.phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  const chats = await fetchChats(session.sock);
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
