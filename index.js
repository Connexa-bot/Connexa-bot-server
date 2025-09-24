import express from "express";
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
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const AUTH_BASE_DIR = "./auth";
const sessions = new Map();

// MongoDB Models
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

// Connect to MongoDB
async function connectMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("⚠️ MongoDB connection error:", err.message);
    process.exit(1); // Exit if MongoDB fails for production
  }
}

// Call on startup
connectMongoDB();

app.use(express.json());

async function ensureAuthDir(phone) {
  const authDir = path.join(AUTH_BASE_DIR, phone);
  await fs.mkdir(authDir, { recursive: true });
  return authDir;
}

async function clearSession(phone) {
  try {
    const authDir = path.join(AUTH_BASE_DIR, phone);
    await fs.rm(authDir, { recursive: true, force: true });
    console.log(`🗑️ Session cleared for ${phone}`);
    sessions.delete(phone);
    await User.findOneAndUpdate({ phone }, { connected: false }); // Update MongoDB
  } catch (err) {
    console.error(`⚠️ Error clearing session for ${phone}:`, err.message);
  }
}

async function startBot(phone) {
  const normalizedPhone = phone.replace(/^\+|\s/g, "");
  if (sessions.has(normalizedPhone)) {
    console.log(`ℹ️ Session exists for ${normalizedPhone}, closing and clearing...`);
    const session = sessions.get(normalizedPhone);
    if (session.sock.ws.readyState !== session.sock.ws.CLOSED) {
      console.log(`🔗 Closing WebSocket for ${normalizedPhone}`);
      session.sock.ws.close();
    }
    await clearSession(normalizedPhone);
  }

  const authDir = await ensureAuthDir(normalizedPhone);
  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // Disable terminal QR for production
    browser: Browsers.ubuntu("Chrome"),
    syncFullHistory: false,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
  });

  sessions.set(normalizedPhone, { sock, qrCode: null, linkCode: null, connected: false, error: null });

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;
    const session = sessions.get(normalizedPhone);

    if (qr && !state.creds.registered) {
      console.log(`📌 QR code updated for ${normalizedPhone}`);
      session.qrCode = qr;
      try {
        console.log(`Waiting 10s before requesting pairing code...`);
        await delay(10000);
        const code = await sock.requestPairingCode(normalizedPhone);
        console.log(`🔑 Pairing Code generated for ${normalizedPhone}: ${code}`);
        session.linkCode = code;
      } catch (err) {
        console.error(`⚠️ Could not get pairing code for ${normalizedPhone}:`, err.message);
        session.error = `Pairing code error: ${err.message}`;
      }
    }

    if (connection === "open") {
      console.log(`✅ Connected to WhatsApp for ${normalizedPhone}`);
      session.connected = true;
      session.qrCode = null;
      session.linkCode = null;
      session.error = null;
      // Update MongoDB
      await User.findOneAndUpdate({ phone: normalizedPhone }, { connected: true }, { upsert: true });
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const errorMsg = lastDisconnect?.error?.message || "Unknown error";
      console.log(`❌ Connection closed for ${normalizedPhone}, status code: ${statusCode}, error: ${errorMsg}`);
      session.error = `Connection failed: ${errorMsg} (Code: ${statusCode})`;
      // Update MongoDB
      await User.findOneAndUpdate({ phone: normalizedPhone }, { connected: false });

      console.log(`🔄 Closing WebSocket and clearing session for ${normalizedPhone}...`);
      if (sock.ws.readyState !== sock.ws.CLOSED) {
        sock.ws.close();
      }
      await clearSession(normalizedPhone);
      console.log(`🔄 Restarting bot for ${normalizedPhone} in 10s...`);
      setTimeout(() => startBot(normalizedPhone), 10000);
    }

    sessions.set(normalizedPhone, session);
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text;

    // Save message to MongoDB
    await Message.create({
      phone: normalizedPhone,
      from: from,
      to: msg.key.participant || from,
      content: messageContent,
      isBot: msg.key.fromMe,
    });

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

    console.log(message);
    if (sendTo) await sock.sendMessage(sendTo, { text: message });
    return groupList;
  } catch (err) {
    console.error("⚠️ Error fetching groups:", err.message);
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

    console.log(message);
    if (sendTo) await sock.sendMessage(sendTo, { text: message });
    return communityList;
  } catch (err) {
    console.error("⚠️ Error fetching communities:", err.message);
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

    console.log(message);
    if (sendTo) await sock.sendMessage(sendTo, { text: message });
    return chats;
  } catch (err) {
    console.error("⚠️ Error fetching chats:", err.message);
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

    console.log(message);
    if (sendTo) await sock.sendMessage(sendTo, { text: message });
    return statusList;
  } catch (err) {
    console.error("⚠️ Error fetching statuses:", err.message);
    return [];
  }
}

async function postStatus(sock, text) {
  try {
    await sock.sendMessage(sock.user.id, { text }, { status: true });
    console.log("📢 Status posted:", text);
    return true;
  } catch (err) {
    console.error("⚠️ Error posting status:", err.message);
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
    console.error("⚠️ Error fetching messages:", err.message);
    return [];
  }
}

// MongoDB Endpoints
app.get("/users/:phone", async (req, res) => {
  const { phone } = req.params;
  try {
    const user = await User.findOne({ phone });
    res.json(user || { phone, connected: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/users/:phone", async (req, res) => {
  const { phone } = req.params;
  const { connected } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { phone },
      { connected },
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/messages/:phone", async (req, res) => {
  const { phone } = req.params;
  try {
    const messages = await Message.find({ phone }).sort({ timestamp: -1 }).limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/messages/:phone", async (req, res) => {
  const { phone } = req.params;
  const messageData = req.body;
  try {
    const message = await Message.create({ phone, ...messageData });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/connect", async (req, res) => {
  const { phone, mode } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number is required" });

  try {
    await startBot(phone);
    const session = sessions.get(phone.replace(/^\+|\s/g, ""));
    let qrCodeDataUrl = null;
    if (session.qrCode) {
      qrCodeDataUrl = await QRCode.toDataURL(session.qrCode);
    }
    console.log(`Sending connect response for ${phone}:`, {
      qrCodeDataUrl: !!qrCodeDataUrl,
      linkCode: session.linkCode,
      message: session.error || "Session initiated",
    });
    res.json({
      qrCodeDataUrl,
      linkCode: session.linkCode,
      message: session.error || "Session initiated",
    });
  } catch (err) {
    console.error(`⚠️ Connect error for ${phone}:`, err.message);
    res.status(500).json({ error: `Failed to connect: ${err.message}` });
  }
});

app.get("/status/:phone", async (req, res) => {
  const { phone } = req.params;
  const normalizedPhone = phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session) return res.json({ connected: false, error: "No session found" });

  let qrCodeDataUrl = null;
  if (!session.connected && session.qrCode) {
    qrCodeDataUrl = await QRCode.toDataURL(session.qrCode);
  }

  console.log(`Sending status for ${phone}:`, {
    connected: session.connected,
    qrCodeDataUrl: !!qrCodeDataUrl,
    linkCode: session.linkCode,
    error: session.error,
  });
  res.json({
    connected: session.connected,
    qrCodeDataUrl,
    linkCode: session.linkCode,
    error: session.error,
  });
});

app.get("/chats/:phone", async (req, res) => {
  const { phone } = req.params;
  const normalizedPhone = phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session || !session.connected) return res.status(400).json({ error: "Not connected" });
  const chats = await fetchChats(session.sock);
  res.json({ chats });
});

app.get("/groups/:phone", async (req, res) => {
  const { phone } = req.params;
  const normalizedPhone = phone.replace(/^\+|\s
