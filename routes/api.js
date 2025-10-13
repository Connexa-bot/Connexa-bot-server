import express from "express";
import { sessions, startBot, logoutFromWhatsApp, clearSession, clearSessionState } from "../helpers/whatsapp.js"; // main sessions map & helpers

import * as chatCtrl from "../controllers/chats.js";
import * as groupCtrl from "../controllers/groups.js";
import * as msgCtrl from "../controllers/messages.js";
import * as profileCtrl from "../controllers/profile.js";
import * as contactCtrl from "../controllers/contacts.js";
import * as presenceCtrl from "../controllers/presence.js";

export function createApiRoutes(broadcast) {
  const router = express.Router();

  const normalizePhone = (phone) => {
    if (!phone) return '';
    return String(phone).replace(/\D/g, '');
  };

  router.get("/", (req, res) => res.send("🚀 WhatsApp Bot Backend running..."));

  // ============= HEALTH CHECK =============
  router.get("/health", (req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      activeSessions: sessions.size
    });
  });

  // ============= CONNECTION =============
  router.post("/connect", async (req, res) => {
    const { phone } = req.body;
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) return res.status(400).json({ error: "Phone number is required" });

    try {
      if (sessions.has(normalizedPhone)) await clearSession(normalizedPhone);

      // Start bot connection
      await startBot(normalizedPhone, broadcast);

      // Wait for session to be initialized and get QR/link code
      let attempts = 0;
      const maxAttempts = 120; // 120 * 500ms = 60 seconds max wait
      const checkInterval = 500;

      const checkSession = () => new Promise((resolve) => {
        const interval = setInterval(() => {
          const session = sessions.get(normalizedPhone);
          attempts++;

          console.log(`🔍 Connect check attempt ${attempts}/${maxAttempts}: session=${!!session}, qr=${!!session?.qrCode}, link=${!!session?.linkCode}, connected=${session?.connected}, error=${session?.error}`);

          // Success conditions: we have QR, link code, connection, or error
          if (session && (session.qrCode || session.linkCode || session.connected || session.error)) {
            clearInterval(interval);

            const result = {
              success: true,
              qrCode: session.qrCode || null,
              linkCode: session.linkCode || null,
              message: session.error || (session.connected ? "Connected" : "Scan QR code or use link code"),
              connected: session.connected || false
            };

            console.log(`✅ Connect returning:`, result);
            resolve(result);
            return;
          }

          // Timeout condition
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            
            const result = {
              success: false,
              qrCode: null,
              linkCode: null,
              message: "Connection timeout. Please try again.",
              connected: false,
              error: "Timeout waiting for QR/link code"
            };

            console.log(`⏱️ Connect timeout:`, result);
            resolve(result);
          }
        }, checkInterval);
      });

      const result = await checkSession();
      res.json(result);
    } catch (err) {
      console.error(`❌ Connect error for ${normalizedPhone}:`, err);
      res.status(500).json({ 
        success: false,
        error: `Failed to connect: ${err.message}`,
        qrCode: null,
        linkCode: null,
        connected: false
      });
    }
  });

  router.get("/status/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);

    console.log('='.repeat(50));
    console.log(`🔍 STATUS CHECK for ${normalizedPhone}`);
    console.log(`📊 Total sessions in Map: ${sessions.size}`);
    console.log(`📊 All session keys:`, Array.from(sessions.keys()));

    const session = sessions.get(normalizedPhone);
    console.log(`📊 Session exists: ${!!session}`);

    if (!session) {
      console.log(`❌ No session found for ${normalizedPhone}`);
      console.log('='.repeat(50));
      return res.json({
        connected: false,
        status: 'not_found',
        error: "No session found"
      });
    }

    const isConnected = session.connected === true ||
                       session.sock?.user?.id ||
                       false;

    console.log(`📊 Session details:`, {
      connected: session.connected,
      hasSocket: !!session.sock,
      hasUser: !!session.sock?.user,
      userId: session.sock?.user?.id,
      linkCode: session.linkCode,
      qrCode: session.qrCode ? 'present' : 'null',
      error: session.error
    });
    console.log(`📊 Final isConnected status: ${isConnected}`);
    console.log('='.repeat(50));

    res.json({
      connected: isConnected,
      status: isConnected ? 'connected' : 'waiting',
      authenticated: isConnected,
      ready: isConnected,
      isConnected: isConnected,
      qrCode: !isConnected ? session.qrCode : null,
      linkCode: !isConnected ? session.linkCode : null,
      user: session.sock?.user || null,
      phone: normalizedPhone,
      error: session.error
    });
  });

  router.post("/logout", async (req, res) => {
    const { phone } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const session = sessions.get(normalizedPhone);
    if (session && session.sock.ws?.readyState !== 3) await logoutFromWhatsApp(session.sock, normalizedPhone);
    await clearSession(normalizedPhone, sessions);
    res.json({ message: "Session cleared. Please reconnect." });
  });

  // ============= CLEAR STATE =============
  router.post("/clear-state/:phoneNumber", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phoneNumber);
    const { fullReset } = req.query;

    const success = await clearSessionState(normalizedPhone, fullReset === 'true');

    if (success) {
      if (fullReset === 'true') {
        sessions.delete(normalizedPhone);
      }
      res.json({ success: true, message: 'State cleared successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to clear state' });
    }
  });

  // ============= CHATS =============
  router.get("/chats/:phone", async (req, res) => {
    try {
      const normalizedPhone = normalizePhone(req.params.phone);
      const session = sessions.get(normalizedPhone);

      if (!session?.connected) {
        return res.status(200).json({
          success: false,
          chats: [],
          message: 'No active session'
        });
      }

      const chats = await chatCtrl.getChats(session);
      res.json({
        success: true,
        chats: chats || [],
        count: chats ? chats.length : 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Chats endpoint error:', error);
      res.status(500).json({
        success: false,
        chats: [],
        error: error.message
      });
    }
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
    try {
      const normalizedPhone = normalizePhone(req.params.phone);
      const session = sessions.get(normalizedPhone);

      if (!session?.sock) {
        return res.status(200).json({
          success: true,
          statusUpdates: [],
          message: 'No active session'
        });
      }

      let statusUpdates = [];
      try {
        const { fetchStatusUpdates } = await import("../helpers/fetchers.js");
        statusUpdates = await fetchStatusUpdates(session.store) || [];
      } catch (err) {
        console.error('Status fetch error:', err);
      }

      res.json({
        success: true,
        statusUpdates,
        count: statusUpdates.length
      });

    } catch (error) {
      console.error('Status updates endpoint error:', error);
      res.status(200).json({
        success: false,
        statusUpdates: [],
        error: error.message
      });
    }
  });

  // ============= CONTACTS =============
  router.get("/contacts/:phone", async (req, res) => {
    const session = sessions.get(req.params.phone.replace(/^\+|\s/g, ""));
    if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });

    try {
      const { fetchContacts } = await import("../helpers/fetchers.js");
      const contacts = await fetchContacts(session.store, session.sock);
      res.json({ success: true, contacts, count: contacts.length });
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