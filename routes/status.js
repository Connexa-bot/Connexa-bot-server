// routes/status.js
// ===============================
// Status update routes
// ===============================

import express from 'express';
import { sessions } from '../helpers/whatsapp.js';
import * as statusActions from '../helpers/statusActions.js';
import multer from 'multer';
import fs from 'fs/promises';

const router = express.Router();

// Setup multer for file uploads
const upload = multer({ 
  dest: './media/uploads/',
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

const normalizePhone = (phone) => phone?.replace(/^\+|\s/g, '');

// ============= POST STATUS =============

// Post text status
router.post('/post-text', async (req, res) => {
  const { phone, text, statusJidList, backgroundColor, font } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await statusActions.postTextStatus(
      normalizedPhone, 
      text, 
      statusJidList || [],
      { backgroundColor, font }
    );
    res.json({ success: true, messageId: result.key.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post image status
router.post('/post-image', upload.single('image'), async (req, res) => {
  const { phone, caption, statusJidList, imageUrl } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const image = req.file ? req.file.path : imageUrl;
    if (!image) return res.status(400).json({ error: 'Image required' });

    const jidList = statusJidList ? JSON.parse(statusJidList) : [];
    
    const result = await statusActions.postImageStatus(
      normalizedPhone,
      image,
      caption || '',
      jidList
    );
    
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    
    res.json({ success: true, messageId: result.key.id });
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

// Post video status
router.post('/post-video', upload.single('video'), async (req, res) => {
  const { phone, caption, statusJidList, videoUrl } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const video = req.file ? req.file.path : videoUrl;
    if (!video) return res.status(400).json({ error: 'Video required' });

    const jidList = statusJidList ? JSON.parse(statusJidList) : [];
    
    const result = await statusActions.postVideoStatus(
      normalizedPhone,
      video,
      caption || '',
      jidList
    );
    
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    
    res.json({ success: true, messageId: result.key.id });
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

// Post audio status
router.post('/post-audio', upload.single('audio'), async (req, res) => {
  const { phone, statusJidList, audioUrl } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const audio = req.file ? req.file.path : audioUrl;
    if (!audio) return res.status(400).json({ error: 'Audio required' });

    const jidList = statusJidList ? JSON.parse(statusJidList) : [];
    
    const result = await statusActions.postAudioStatus(
      normalizedPhone,
      audio,
      jidList
    );
    
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    
    res.json({ success: true, messageId: result.key.id });
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

// ============= STATUS ACTIONS =============

// Delete status
router.post('/delete', async (req, res) => {
  const { phone, statusKey } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    await statusActions.deleteStatus(normalizedPhone, statusKey);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View status
router.post('/view', async (req, res) => {
  const { phone, statusJid, messageKeys } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    await statusActions.viewStatus(normalizedPhone, statusJid, messageKeys);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get privacy settings
router.get('/privacy/:phone', async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const privacy = await statusActions.getStatusPrivacy(normalizedPhone);
    res.json({ success: true, privacy });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
