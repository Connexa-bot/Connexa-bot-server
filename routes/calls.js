// routes/calls.js
// ===============================
// Call routes
// ===============================

import express from 'express';
import { sessions } from '../helpers/whatsapp.js';
import * as callActions from '../helpers/callActions.js';

const router = express.Router();

const normalizePhone = (phone) => phone?.replace(/^\+|\s/g, '');

// Get call history
router.get('/:phone', async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await callActions.getCallHistory(normalizedPhone);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Make call (not supported - returns info message)
router.post('/make', async (req, res) => {
  const { phone, to, isVideo } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await callActions.makeCall(normalizedPhone, to, isVideo);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
