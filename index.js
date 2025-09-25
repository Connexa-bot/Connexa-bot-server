import express from "express";
import cors from "cors";
import {
  makeWASocket,
  useMultiFileAuthState,
  Browsers,
  jidDecode,
  delay,
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const AUTH_BASE_DIR = "./auth";
const sessions = new Map();
const MAX_QR_ATTEMPTS = 3;
const CONNECTION_TIMEOUT_MS = 60000;

// Models
const userSchema = new mongoose.Schema({
  phone: { type: String, unique: true, required: true },
  connected: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);

const messageSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  from: String,
  to: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
  isBot: { type: Boolean, default: false },
});
const Message = mongoose.model("Message", messageSchema);

// DB Connection
async function connectMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("⚠️ MongoDB connection error:", err.message);
    process.exit(1);
  }
}
connectMongoDB();

// Helpers
async function ensureAuthDir(phone) {
  const authDir = path.join(AUTH_BASE_DIR, phone);
  await fs.mkdir(authDir, { recursive: true });
  return authDir;
}

async function clearSession(phone) {
  try {
    const authDir = path.join(AUTH_BASE_DIR, phone);
    await fs.rm(authDir, { recursive: true, force: true });
    sessions.delete(phone);
    await User.findOneAndUpdate({ phone }, { connected: false });
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

async function startBot(phone) {
  const normalizedPhone = phone.replace(/^\+|\s/g, "");
  // If session exists, clear it first
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

  const sock = makeWASocket({
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

    if (qr && !state.creds.registered) {
      qrAttempts++;
      session.qrCode = qr;
      session.qrAttempts = qrAttempts;

      // Try pairing code only once
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
        setTimeout(() => startBot(normalizedPhone), 10000);
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
      await User.findOneAndUpdate({ phone: normalizedPhone }, { connected: true }, { upsert: true });
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const errorMsg = lastDisconnect?.error?.message || "Unknown error";
      session.error = `Connection failed: ${errorMsg} (Code: ${statusCode})`;
      await User.findOneAndUpdate({ phone: normalizedPhone }, { connected: false });

      if (sock.ws.readyState !== sock.ws.CLOSED) {
        await logoutFromWhatsApp(sock, normalizedPhone);
        sock.ws.close();
      }
      await clearSession(normalizedPhone);
      setTimeout(() => startBot(normalizedPhone), 10000);
    }

    sessions.set(normalizedPhone, session);
  });

  setTimeout(async () => {
    const session = sessions.get(normalizedPhone);
    if (!session.connected) {
      session.error = `Connection failed: Timeout after ${CONNECTION_TIMEOUT_MS / 1000}s`;
      if (sock.ws.readyState !== sock.ws.CLOSED) {
        await logoutFromWhatsApp(sock, normalizedPhone);
        sock.ws.close();
      }
      await clearSession(normalizedPhone);
      setTimeout(() => startBot(normalizedPhone), 10000);
    }
  }, CONNECTION_TIMEOUT_MS);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    const from = msg.key.remoteJid;
    const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text;

    await Message.create({
      phone: normalizedPhone,
      from: from,
      to: msg.key.participant || from,
      content: messageContent,
      isBot: msg.key.fromMe,
    });

    // Command handlers
    if (messageContent === "!groups") {
      await fetchGroups(sock, from);
    } else if (messageContent === "!communities") {
      await fetchCommunities(sock, from);
    } else if (messageContent === "!chats") {
      await fetchChats(sock, from);
    } else if (messageContent === "!statuses") {
      await fetchStatuses(sock, from);
    } else if (messageContent === "!poststatus") {
      await postStatus(sock, `Status update from ${normalizedPhone}! 🚀`);
    }
  });

  return sock;
}

// WhatsApp feature helpers
async function fetchGroups(sock, sendTo = null) {
  try {
    const groups = await sock.groupFetchAllParticipating();
    const groupList = Object.values(groups).map((group) => ({
      id: group.id,
      name: group.subject,
      participants: group.participants.length,
    }));

    const message = `📋 Groups (${groupList.length}):\n${groupList
      .map((g) => `- ${g.name} (${g.id}, ${g.participants} members)`)
      .join("\n")}`;

    if (sendTo) await sock.sendMessage(sendTo, { text: message });
    return groupList;
  } catch (err) {
    return [];
  }
}

async function fetchCommunities(sock, sendTo = null) {
  try {
    const communities = await sock.fetchCommunities?.() || [];
    const communityList = communities.map((comm) => ({
      id: comm.id,
      name: comm.name || "Unnamed Community",
    }));

    const message = communities.length
      ? `🏘️ Communities (${communityList.length}):\n${communityList
          .map((c) => `- ${c.name} (${c.id})`)
          .join("\n")}`
      : "🏘️ No communities found.";

    if (sendTo) await sock.sendMessage(sendTo, { text: message });
    return communityList;
  } catch (err) {
    return [];
  }
}

async function fetchChats(sock, sendTo = null) {
  try {
    const chats = (await sock.onWhatsApp())
      .filter((chat) => chat.exists)
      .map((chat) => ({
        id: chat.jid,
        name: chat.name || jidDecode(chat.jid)?.user || "Unknown",
      }));

    const message = `💬 Chats (${chats.length}):\n${chats
      .map((c) => `- ${c.name} (${c.id})`)
      .join("\n")}`;

    if (sendTo) await sock.sendMessage(sendTo, { text: message });
    return chats;
  } catch (err) {
    return [];
  }
}

async function fetchStatuses(sock, sendTo = null) {
  try {
    const statuses = await sock.fetchStatus?.() || [];
    const statusList = statuses.map((status) => ({
      id: status.jid,
      content: status.status,
      timestamp: new Date(status.timestamp * 1000).toLocaleString(),
    }));

    const message = statusList.length
      ? `📢 Statuses (${statusList.length}):\n${statusList
          .map((s) => `- ${s.id}: ${s.content} (${s.timestamp})`)
          .join("\n")}`
      : "📢 No statuses found.";

    if (sendTo) await sock.sendMessage(sendTo, { text: message });
    return statusList;
  } catch (err) {
    return [];
  }
}

async function postStatus(sock, text) {
  try {
    await sock.sendMessage(sock.user.id, { text }, { status: true });
    return true;
  } catch (err) {
    return false;
  }
}

async function fetchMessages(sock) {
  try {
    const chats = await sock.onWhatsApp();
    const messages = [];
    for (const chat of chats.filter((c) => c.exists)) {
      const msgHistory = await sock.fetchMessagesFromWA(chat.jid, 20);
      msgHistory.forEach((msg) => {
        if (msg.message) {
          messages.push({
            id: msg.key.id,
            from: msg.key.remoteJid,
            content: msg.message.conversation || msg.message.extendedTextMessage?.text || "",
            timestamp: new Date(msg.messageTimestamp * 1000).toLocaleString(),
            isBot: msg.key.fromMe,
          });
        }
      });
    }
    return messages;
  } catch (err) {
    return [];
  }
}

// API routes

app.get("/", (req, res) => {
  res.send("🚀 ConnexaBot Backend running...");
});

// User endpoints
app.get("/users/:phone", async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    res.json(user || { phone: req.params.phone, connected: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/users/:phone", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { phone: req.params.phone },
      { connected: req.body.connected },
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connection & status
app.post("/connect", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number is required" });
  try {
    await startBot(phone);
    const session = sessions.get(phone.replace(/^\+|\s/g, ""));
    let qrCodeDataUrl = null;
    if (session.qrCode) {
      qrCodeDataUrl = await QRCode.toDataURL(session.qrCode);
    }
    res.json({
      qrCodeDataUrl,
      linkCode: session.linkCode,
      message: session.error || "Session initiated",
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

// Messaging
app.get("/messages/:phone", async (req, res) => {
  try {
    const messages = await Message.find({ phone: req.params.phone }).sort({ timestamp: -1 }).limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/messages/:phone", async (req, res) => {
  try {
    const message = await Message.create({ phone: req.params.phone, ...req.body });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WhatsApp features (chats, groups, communities, statuses)
const featureRoutes = [
  { path: "chats", fetcher: fetchChats },
  { path: "groups", fetcher: fetchGroups },
  { path: "communities", fetcher: fetchCommunities },
  { path: "statuses", fetcher: fetchStatuses },
];
featureRoutes.forEach(({ path, fetcher }) => {
  app.get(`/${path}/:phone`, async (req, res) => {
    const normalizedPhone = req.params.phone.replace(/^\+|\s/g, "");
    const session = sessions.get(normalizedPhone);
    if (!session || !session.connected) {
      return res.status(400).json({ error: "Not connected" });
    }
    const data = await fetcher(session.sock);
    res.json({ [path]: data });
  });
});

app.post("/poststatus", async (req, res) => {
  const normalizedPhone = req.body.phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  const success = await postStatus(session.sock, req.body.text);
  res.json({ success, message: success ? "Status posted successfully" : "Failed to post status" });
});

// Send message
app.post("/send-message", async (req, res) => {
  const { phone, to, message } = req.body;
  const normalizedPhone = phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  try {
    await session.sock.sendMessage(to, { text: message });
    res.json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    res.status(500).json({ error: `Failed to send message: ${err.message}` });
  }
});

// Logout
app.post("/logout", async (req, res) => {
  const normalizedPhone = req.body.phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (session && session.sock.ws.readyState !== session.sock.ws.CLOSED) {
    await logoutFromWhatsApp(session.sock, normalizedPhone);
  }
  await clearSession(normalizedPhone);
  res.json({ message: "Session cleared. Please reconnect." });
});

app.listen(PORT, () => {
  console.log(`🌍 Server running on http://localhost:${PORT}`);
});
