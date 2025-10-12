import express from "express";
import { sessions } from "../helpers/whatsapp.js";
import * as msgActions from "../helpers/messageActions.js";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

const router = express.Router();

// Setup multer for file uploads
const upload = multer({ 
  dest: './media/uploads/',
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

const normalizePhone = (phone) => phone?.replace(/^\+|\s/g, '');

// ============= SEND MESSAGES =============

// Send text message
router.post("/send", async (req, res) => {
  const { phone, to, text, mentions } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    let msg;
    if (mentions && mentions.length > 0) {
      msg = await msgActions.sendMessageWithMentions(normalizedPhone, to, text, mentions);
    } else {
      msg = await msgActions.sendMessage(normalizedPhone, to, text);
    }
    res.json({ success: true, messageId: msg.key.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reply to message
router.post("/reply", async (req, res) => {
  const { phone, to, text, quotedMessage } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    const msg = await msgActions.replyToMessage(normalizedPhone, to, text, quotedMessage);
    res.json({ success: true, messageId: msg.key.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send image
router.post("/send-image", upload.single('image'), async (req, res) => {
  const { phone, to, caption, imageUrl } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    const image = req.file ? req.file.path : imageUrl;
    if (!image) return res.status(400).json({ error: "Image required" });
    
    const msg = await msgActions.sendImage(normalizedPhone, to, image, caption || '');
    
    // Cleanup uploaded file
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    
    res.json({ success: true, messageId: msg.key.id });
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

// Send video
router.post("/send-video", upload.single('video'), async (req, res) => {
  const { phone, to, caption, videoUrl, gifPlayback } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    const video = req.file ? req.file.path : videoUrl;
    if (!video) return res.status(400).json({ error: "Video required" });
    
    const msg = await msgActions.sendVideo(normalizedPhone, to, video, caption || '', gifPlayback === 'true');
    
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    
    res.json({ success: true, messageId: msg.key.id });
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

// Send audio/voice note
router.post("/send-audio", upload.single('audio'), async (req, res) => {
  const { phone, to, audioUrl, ptt } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    const audio = req.file ? req.file.path : audioUrl;
    if (!audio) return res.status(400).json({ error: "Audio required" });
    
    const msg = await msgActions.sendAudio(normalizedPhone, to, audio, ptt === 'true');
    
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    
    res.json({ success: true, messageId: msg.key.id });
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

// Send document
router.post("/send-document", upload.single('document'), async (req, res) => {
  const { phone, to, fileName, mimetype, documentUrl } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    const document = req.file ? req.file.path : documentUrl;
    if (!document) return res.status(400).json({ error: "Document required" });
    
    const docFileName = fileName || req.file?.originalname || 'document';
    const docMimetype = mimetype || req.file?.mimetype || 'application/pdf';
    
    const msg = await msgActions.sendDocument(normalizedPhone, to, document, docFileName, docMimetype);
    
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    
    res.json({ success: true, messageId: msg.key.id });
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

// Send location
router.post("/send-location", async (req, res) => {
  const { phone, to, latitude, longitude, name, address } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    if (!latitude || !longitude) return res.status(400).json({ error: "Latitude and longitude required" });
    
    const msg = await msgActions.sendLocation(normalizedPhone, to, parseFloat(latitude), parseFloat(longitude), name || '', address || '');
    res.json({ success: true, messageId: msg.key.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send contact
router.post("/send-contact", async (req, res) => {
  const { phone, to, contacts } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: "Contacts array required" });
    }
    
    const msg = await msgActions.sendContact(normalizedPhone, to, contacts);
    res.json({ success: true, messageId: msg.key.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send poll
router.post("/send-poll", async (req, res) => {
  const { phone, to, name, options, selectableCount } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    if (!name || !options || !Array.isArray(options)) {
      return res.status(400).json({ error: "Poll name and options array required" });
    }
    
    const msg = await msgActions.sendPoll(normalizedPhone, to, name, options, selectableCount || 1);
    res.json({ success: true, messageId: msg.key.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send list message
router.post("/send-list", async (req, res) => {
  const { phone, to, text, buttonText, sections, footer, title } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({ error: "Sections array required" });
    }
    
    const msg = await msgActions.sendList(normalizedPhone, to, text, buttonText, sections, footer, title);
    res.json({ success: true, messageId: msg.key.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send broadcast
router.post("/send-broadcast", async (req, res) => {
  const { phone, recipients, message } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    if (!recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ error: "Recipients array required" });
    }
    
    const results = await msgActions.sendBroadcast(normalizedPhone, recipients, message);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= MESSAGE ACTIONS =============

// Delete message
router.post("/delete", async (req, res) => {
  const { phone, chatId, messageKey } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    await msgActions.deleteMessage(normalizedPhone, chatId, messageKey);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forward message
router.post("/forward", async (req, res) => {
  const { phone, to, message } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    await msgActions.forwardMessage(normalizedPhone, to, message);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// React to message
router.post("/react", async (req, res) => {
  const { phone, chatId, messageKey, emoji } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    await msgActions.reactToMessage(normalizedPhone, chatId, messageKey, emoji);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit message
router.post("/edit", async (req, res) => {
  const { phone, chatId, messageKey, newText } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    await msgActions.editMessage(normalizedPhone, chatId, messageKey, newText);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Star message
router.post("/star", async (req, res) => {
  const { phone, chatId, messageKey, star } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    await msgActions.starMessage(normalizedPhone, chatId, messageKey, star !== false);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark message as read
router.post("/read", async (req, res) => {
  const { phone, messageKey } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    await msgActions.markMessageRead(normalizedPhone, messageKey);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
