import express from "express";
import { sessions, startBot, logoutFromWhatsApp, clearSession } from "../helpers/whatsapp.js"; // main sessions map & helpers

import * as chatCtrl from "../controllers/chats.js";
import * as groupCtrl from "../controllers/groups.js";
import * as msgCtrl from "../controllers/messages.js";
import * as profileCtrl from "../controllers/profile.js";
import * as contactCtrl from "../controllers/contacts.js";
import * as presenceCtrl from "../controllers/presence.js";

export function createApiRoutes(broadcast) {
  const router = express.Router();

  router.get("/", (req, res) => res.send("🚀 WhatsApp Bot Backend running..."));

  // ============= CONNECTION =============
  router.post("/connect", async (req, res) => {
    const { phone } = req.body;
    const normalizedPhone = phone?.replace(/^\+|\s/g, "");
    if (!phone) return res.status(400).json({ error: "Phone number is required" });

    try {
      if (sessions.has(normalizedPhone)) await clearSession(normalizedPhone, sessions);
      
      startBot(normalizedPhone, broadcast).catch(console.error);

    let attempts = 0;
    const maxAttempts = 30;

    const checkSession = () => new Promise((resolve) => {
      const interval = setInterval(() => {
        const session = sessions.get(normalizedPhone);
        attempts++;
        if (session && (session.qrCode || session.linkCode || session.connected || session.error || attempts > maxAttempts)) {
          clearInterval(interval);
          if (attempts > maxAttempts && !session.connected && !session.error) session.error = "Connection timed out. Please try again.";
          resolve({ qrCode: session?.qrCode || null, linkCode: session?.linkCode || null, message: session?.error || "Session initiated", connected: session?.connected || false });
        }
      }, 1000);
    });

    const result = await checkSession();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: `Failed to connect: ${err.message}` });
  }
});

router.get("/status/:phone", async (req, res) => {
  const normalizedPhone = req.params.phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session) return res.json({ connected: false, error: "No session found" });

  res.json({ connected: session.connected, qrCode: !session.connected ? session.qrCode : null, linkCode: session.linkCode, error: session.error });
});

router.post("/logout", async (req, res) => {
  const { phone } = req.body;
  const normalizedPhone = phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (session && session.sock.ws?.readyState !== 3) await logoutFromWhatsApp(session.sock, normalizedPhone);
  await clearSession(normalizedPhone, sessions);
  res.json({ message: "Session cleared. Please reconnect." });
});

// ============= CHATS =============
router.get("/chats/:phone", async (req, res) => {
  const session = sessions.get(req.params.phone.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });
  const chats = await chatCtrl.getChats(session);
  res.json({ success: true, data: { chats } });
});

// ============= MESSAGES =============
router.get("/messages/:phone/:chatId", async (req, res) => {
  const { phone, chatId } = req.params;
  const { limit } = req.query;
  const session = sessions.get(phone.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });
  
  try {
    const { fetchMessages } = await import("../helpers/fetchers.js");
    const messages = await fetchMessages(session.store, chatId, parseInt(limit) || 50);
    res.json({ success: true, data: { messages } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============= CALLS =============
router.get("/calls/:phone", async (req, res) => {
  const session = sessions.get(req.params.phone.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });
  
  try {
    const { fetchCalls } = await import("../helpers/fetchers.js");
    const calls = await fetchCalls(session.store);
    res.json({ success: true, data: { calls } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============= STATUS UPDATES =============
router.get("/status-updates/:phone", async (req, res) => {
  const session = sessions.get(req.params.phone.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });
  
  try {
    const { fetchStatusUpdates } = await import("../helpers/fetchers.js");
    const statuses = await fetchStatusUpdates(session.store);
    res.json({ success: true, data: { statuses } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============= CHANNELS =============
router.get("/channels/:phone", async (req, res) => {
  const session = sessions.get(req.params.phone.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });
  
  try {
    const channels = [];
    res.json({ success: true, data: { channels } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============= COMMUNITIES =============
router.get("/communities/:phone", async (req, res) => {
  const session = sessions.get(req.params.phone.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });
  
  try {
    const communities = [];
    res.json({ success: true, data: { communities } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============= PROFILE =============
router.get("/profile/:phone", async (req, res) => {
  const normalizedPhone = req.params.phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });
  
  try {
    const { fetchProfile } = await import("../helpers/fetchers.js");
    const jid = normalizedPhone + '@s.whatsapp.net';
    const profile = await fetchProfile(session.sock, jid);
    
    const userData = {
      name: session.sock.user?.name || normalizedPhone,
      phone: normalizedPhone,
      status: profile.status || '',
      picture: profile.profilePicUrl || null,
    };
    
    res.json({ success: true, data: userData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

  return router;
}

export default createApiRoutes;
