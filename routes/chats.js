// routes/chats.js
// ===============================
// Chat action routes
// ===============================

import express from 'express';
import { sessions } from '../helpers/whatsapp.js';
import * as chatActions from '../helpers/chatActions.js';

const router = express.Router();

const normalizePhone = (phone) => phone?.replace(/^\+|\s/g, '');

// Archive chat
router.post('/archive', async (req, res) => {
  const { phone, chatId, archive } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    await chatActions.archiveChat(normalizedPhone, chatId, archive !== false);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pin chat
router.post('/pin', async (req, res) => {
  const { phone, chatId, pin } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    await chatActions.pinChat(normalizedPhone, chatId, pin !== false);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mute chat
router.post('/mute', async (req, res) => {
  const { phone, chatId, duration } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    await chatActions.muteChat(normalizedPhone, chatId, duration);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as read
router.post('/mark-read', async (req, res) => {
  const { phone, chatId } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    await chatActions.markChatRead(normalizedPhone, chatId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as unread
router.post('/mark-unread', async (req, res) => {
  const { phone, chatId } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    await chatActions.markChatUnread(normalizedPhone, chatId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete chat
router.post('/delete', async (req, res) => {
  const { phone, chatId } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    await chatActions.deleteChat(normalizedPhone, chatId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear chat
router.post('/clear', async (req, res) => {
  const { phone, chatId } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    await chatActions.clearChat(normalizedPhone, chatId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get labels
router.get('/labels/:phone', async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await chatActions.getChatLabels(normalizedPhone);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add label
router.post('/label/add', async (req, res) => {
  const { phone, chatId, labelId } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await chatActions.addChatLabel(normalizedPhone, chatId, labelId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove label
router.post('/label/remove', async (req, res) => {
  const { phone, chatId, labelId } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await chatActions.removeChatLabel(normalizedPhone, chatId, labelId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
