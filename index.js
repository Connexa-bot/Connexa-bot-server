// ===============================
// 🌐 ConnexaBot Entry Point
// ===============================
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// 🧩 Route Imports
import { createApiRoutes } from "./routes/api.js";
import contactRoutes from "./routes/contacts.js";
import groupRoutes from "./routes/groups.js";
import messageRoutes from "./routes/messages.js";
import presenceRoutes from "./routes/presence.js";
import profileRoutes from "./routes/profile.js";
import aiRoutes from "./routes/ai.js";
import statusRoutes from "./routes/status.js";
import channelRoutes from "./routes/channels.js";
import callRoutes from "./routes/calls.js";
import chatRoutes from "./routes/chats.js";
import privacyRoutes from "./routes/privacy.js";

// 🤖 Bot Helper
import { startBot, clearSession } from "./helpers/whatsapp.js";

// ===============================
// ⚙️ Setup & Configuration
// ===============================
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const AUTH_DIR = process.env.AUTH_DIR || "./auth";

// Auto-detect server URL based on environment (prioritize Replit/Render detection)
let SERVER_URL;
if (process.env.REPLIT_DEV_DOMAIN) {
  SERVER_URL = `https://${process.env.REPLIT_DEV_DOMAIN}`;
} else if (process.env.RENDER) {
  SERVER_URL = `https://connexa-bot-server.onrender.com`;
} else if (process.env.SERVER_URL) {
  SERVER_URL = process.env.SERVER_URL;
} else {
  SERVER_URL = `http://localhost:${PORT}`;
}

// Ensure base directories exist
fs.mkdirSync(AUTH_DIR, { recursive: true });
fs.mkdirSync("./media", { recursive: true });

// ===============================
// 🧠 Middleware
// ===============================
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve static files (media, etc.)
app.use("/media", express.static(path.join(__dirname, "media")));

// ===============================
// ⚡ WebSocket Integration
// ===============================
let wsClients = new Map();

// Broadcast helper for WhatsApp events
function broadcast(event, data) {
  io.emit(event, data);
}

// ===============================
// 🛠️ API Routes
// ===============================
// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    serverUrl: SERVER_URL
  });
});

const apiRoutes = createApiRoutes(broadcast);
app.use("/api", apiRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/presence", presenceRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/privacy", privacyRoutes);

// WebSocket handlers
io.on("connection", (socket) => {
  console.log(`🟢 Client connected: ${socket.id}`);
  wsClients.set(socket.id, socket);

  socket.on("disconnect", () => {
    wsClients.delete(socket.id);
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });

  socket.on("connect-whatsapp", async (phone) => {
    console.log(`📲 Starting connection for ${phone}`);
    try {
      await startBot(phone, broadcast);
      socket.emit("status", { phone, status: "connecting" });
    } catch (err) {
      console.error(`❌ Connection failed for ${phone}:`, err);
      socket.emit("status", { phone, error: err.message });
    }
  });

  socket.on("logout-whatsapp", async (phone) => {
    console.log(`🚪 Logging out ${phone}`);
    await clearSession(phone);
    socket.emit("status", { phone, status: "disconnected" });
  });
});

// ===============================
// 🚀 Start Server
// ===============================
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`✅ ConnexaBot server running on port ${PORT}`);
  console.log(`🌐 API Base: ${SERVER_URL}/api`);
});
