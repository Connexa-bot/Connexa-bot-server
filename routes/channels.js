// routes/channels.js
// ===============================
// Channel/Newsletter routes
// ===============================

import express from 'express';
import { sessions } from '../helpers/whatsapp.js';
import * as channelActions from '../helpers/channelActions.js';

const router = express.Router();

const normalizePhone = (phone) => phone?.replace(/^\+|\s/g, '');

// Get all channels
router.get('/:phone', async (req, res) => {
  const normalizedPhone = req.params.phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const { fetchChannels } = await import("../helpers/fetchers.js");
    const channels = await fetchChannels(normalizedPhone);
    res.json({ success: true, data: { channels } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Follow channel
router.post('/follow', async (req, res) => {
  const { phone, channelJid } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await channelActions.followChannel(normalizedPhone, channelJid);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unfollow channel
router.post('/unfollow', async (req, res) => {
  const { phone, channelJid } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await channelActions.unfollowChannel(normalizedPhone, channelJid);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get channel metadata
router.get('/metadata/:phone/:channelJid', async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await channelActions.getChannelMetadata(normalizedPhone, req.params.channelJid);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mute channel
router.post('/mute', async (req, res) => {
  const { phone, channelJid, duration } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await channelActions.muteChannel(normalizedPhone, channelJid, duration);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get communities (linked channels)
router.get('/communities/:phone', async (req, res) => {
  const normalizedPhone = req.params.phone.replace(/^\+|\s/g, "");
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const { fetchCommunities } = await import("../helpers/fetchers.js");
    const communities = await fetchCommunities(normalizedPhone);
    res.json({ success: true, communities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;