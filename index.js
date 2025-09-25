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

// Mongoose Schemas
const userSchema = new mongoose.Schema({
  phone: { type: String, unique: true, required: true },
  connected: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Connect to MongoDB
async function connectMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("⚠️ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

connectMongoDB();

// Ensure Auth Directory
async function ensureAuthDir(phone) {
  const authDir = path.join(AUTH_BASE_DIR, phone);
  await fs.mkdir(authDir, { recursive: true });
  return authDir;
}

// Clear Session
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

// Logout from WhatsApp
async function logoutFromWhatsApp(sock, phone) {
  try {
    await sock.logout();
    console.log(`🔑 Logged out from WhatsApp for ${phone}`);
  } catch (err) {
    console.error(`⚠️ Error logging out for ${phone}:`, err.message);
  }
}

// Start Bot
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
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.ubuntu("Chrome"),
    syncFullHistory: false,
  });

  let qrAttempts = 0;
  sessions.set(normalizedPhone, {
    sock,
    qrCode: null,
    linkCode: null,
    connected: false,
    error: null,
    qrAttempts,
  });

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;
    const session = sessions.get(normalizedPhone);

    if (!session) return;

    if (qr && !state.creds.registered) {
      qrAttempts++;
      try {
        session.qrCode = qr;
        const qrCodeDataUrl = await QRCode.toDataURL(qr);
        session.qrCodeDataUrl = qrCodeDataUrl;  // Store as base64 format for frontend
      } catch (err) {
        console.error('Error generating QR code:', err.message);
      }

      // Request pairing code if not already requested
      if (!session.pairingCodeRequested && qrAttempts < MAX_QR_ATTEMPTS) {
        try {
          await delay(10000); // Wait before requesting pairing code
          session.linkCode = await sock.requestPairingCode(normalizedPhone);
          session.pairingCodeRequested = true;
        } catch (err) {
          session.error = `Pairing code error: ${err.message}`;
        }
      } else if (qrAttempts >= MAX_QR_ATTEMPTS) {
        session.error = `Failed to connect: Max QR attempts reached (${MAX_QR_ATTEMPTS})`;
        await clearSession(normalizedPhone);
        return;
      }
    }

    if (connection === "open") {
      session.connected = true;
      session.qrCode = null;
      session.linkCode = null;
      session.error = null;
      console.log(`📱 Connection established for ${normalizedPhone}`);
      await User.findOneAndUpdate({ phone: normalizedPhone }, { connected: true }, { upsert: true });
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const errorMsg = lastDisconnect?.error?.message || "Unknown error";
      session.error = `Connection failed: ${errorMsg} (Code: ${statusCode})`;
      await User.findOneAndUpdate({ phone: normalizedPhone }, { connected: false });
      await clearSession(normalizedPhone);
      console.log(`${normalizedPhone} disconnected with error.`);
    }

    // Keep session updated
    sessions.set(normalizedPhone, session);
  });

  sock.ev.on("creds.update", saveCreds);
  return sock;
}

// API Routes
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

app.post("/connect", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number is required" });
  
  try {
    await startBot(phone);
    const session = sessions.get(phone.replace(/^\+|\s/g, ""));
    res.json({
      qrCodeDataUrl: session?.qrCodeDataUrl,
      linkCode: session?.linkCode,
      message: session?.error || "Session initiated",
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to connect: ${err.message}` });
  }
});

app.get("/status/:phone", async (req, res) => {
  const normalizedPhone = req.params.phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  
  if (!session) return res.json({ connected: false, error: "No session found" });
  
  res.json({ connected: session.connected, qrCodeDataUrl: session.qrCode, linkCode: session.linkCode, error: session.error });
});

// Other endpoints (e.g., messages, logout, etc.) should follow the same structure with attention to error handling and session state management...

app.listen(PORT, () => {
  console.log(`🌍 Server running on http://localhost:${PORT}`);
});
