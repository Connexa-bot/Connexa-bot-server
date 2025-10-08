import express from "express";
import { sessions } from "../helpers/whatsapp.js";
import * as msgCtrl from "../controllers/messages.js";
import { sendMessage } from "../helpers/messageActions.js";

const router = express.Router();

// Send text message
router.post("/send", async (req, res) => {
  const { phone, to, text } = req.body;
  const session = sessions.get(phone.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    const msg = await sendMessage(phone, to, text);
    res.json({ success: true, messageId: msg.key.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download media
router.post("/download", async (req, res) => {
  const { phone, chatId, msgId, type } = req.body;
  const session = sessions.get(phone.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    const filePath = await msgCtrl.fetchMedia(session, chatId, msgId, type, phone);
    res.json({ filePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Message actions (delete, forward, star, react, edit)
router.post("/action", async (req, res) => {
  const { phone, action, chatId, messageKey, messageId, to, emoji, newText } = req.body;
  const session = sessions.get(phone.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    switch (action) {
      case "delete":
        await msgCtrl.messageActions.delete(session.sock, chatId, messageKey);
        break;
      case "forward":
        await msgCtrl.messageActions.forward(session.sock, to, messageKey);
        break;
      case "star":
        await msgCtrl.messageActions.star(session.sock, chatId, messageId);
        break;
      case "react":
        await msgCtrl.messageActions.react(session.sock, chatId, messageKey, emoji);
        break;
      case "edit":
        await msgCtrl.messageActions.edit(session.sock, chatId, messageKey, newText);
        break;
      default:
        return res.status(400).json({ error: "Invalid message action" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
