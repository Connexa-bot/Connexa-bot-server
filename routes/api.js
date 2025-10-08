import express from "express";
import { sessions, startBot, logoutFromWhatsApp, clearSession } from "../helpers/whatsapp.js"; // main sessions map & helpers

import * as chatCtrl from "../controllers/chats.js";
import * as groupCtrl from "../controllers/groups.js";
import * as msgCtrl from "../controllers/messages.js";
import * as profileCtrl from "../controllers/profile.js";
import * as contactCtrl from "../controllers/contacts.js";
import * as presenceCtrl from "../controllers/presence.js";

const router = express.Router();

router.get("/", (req, res) => res.send("🚀 WhatsApp Bot Backend running..."));

// ============= CONNECTION =============
router.post("/connect", async (req, res) => {
  const { phone } = req.body;
  const normalizedPhone = phone?.replace(/^\+|\s/g, "");
  if (!phone) return res.status(400).json({ error: "Phone number is required" });

  try {
    if (sessions.has(normalizedPhone)) await clearSession(normalizedPhone, sessions);
    startBot(normalizedPhone, sessions).catch(console.error);

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
// Example: get chats
router.get("/chats/:phone", async (req, res) => {
  const session = sessions.get(req.params.phone.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });
  const chats = await chatCtrl.getChats(session);
  res.json({ chats });
});

export default router;
