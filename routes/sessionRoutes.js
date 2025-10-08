// ~/ConnexaBotServer/routes/sessionRoutes.js
import express from 'express';
import { getSession, clearSession } from '../helpers/sessionManager.js';

const router = express.Router();

router.get('/status/:phone', async (req, res) => {
  const { phone } = req.params;
  const session = getSession(phone);

  if (!session) {
    return res.json({ connected: false, message: 'No active session.' });
  }

  const { connected, qrCode, linkCode, error } = session;
  return res.json({
    connected: !!connected,
    qrCode: qrCode || null,
    linkCode: linkCode || null,
    error: error || null,
  });
});

router.post('/logout/:phone', async (req, res) => {
  const { phone } = req.params;
  await clearSession(phone);
  return res.json({ message: 'Session cleared successfully.' });
});

export default router;
