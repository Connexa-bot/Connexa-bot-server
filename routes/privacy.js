// routes/privacy.js
// ===============================
// Privacy and Business Profile routes
// ===============================

import express from 'express';
import { sessions } from '../helpers/whatsapp.js';
import * as chatActions from '../helpers/chatActions.js';
import * as contactActions from '../helpers/contactActions.js';

const router = express.Router();

const normalizePhone = (phone) => phone?.replace(/^\+|\s/g, '');

// ============= PRIVACY SETTINGS =============

// Get privacy settings
router.get('/settings/:phone', async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await chatActions.getPrivacySettings(normalizedPhone);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update privacy settings
router.post('/settings/update', async (req, res) => {
  const { phone, setting, value } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await chatActions.updatePrivacySettings(normalizedPhone, setting, value);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= BLOCKED CONTACTS =============

// Get blocked users
router.get('/blocked/:phone', async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const blocked = await contactActions.getBlockedUsers(session.sock);
    res.json({ success: true, blocked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Block user
router.post('/block', async (req, res) => {
  const { phone, jid } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    await contactActions.blockUser(session.sock, jid);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unblock user
router.post('/unblock', async (req, res) => {
  const { phone, jid } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    await contactActions.unblockUser(session.sock, jid);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= DISAPPEARING MESSAGES =============

// Set disappearing messages for a chat
router.post('/disappearing-messages', async (req, res) => {
  const { phone, chatId, duration } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await chatActions.setDisappearingMessages(normalizedPhone, chatId, duration);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= BUSINESS PROFILE =============

// Get business profile
router.get('/business-profile/:phone/:jid', async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await chatActions.getBusinessProfile(normalizedPhone, req.params.jid);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
