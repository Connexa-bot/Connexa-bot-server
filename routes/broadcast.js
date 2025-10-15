
import express from 'express';
import { sessions } from '../helpers/whatsapp.js';

const router = express.Router();

const normalizePhone = (phone) => phone?.replace(/^\+|\s/g, '');

// Get all broadcast lists
router.get('/:phone', async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    // Broadcast lists are stored in chats with @broadcast suffix
    const store = session.store;
    const chats = store.chats?.all() || [];
    const broadcastLists = chats.filter(chat => chat.id?.includes('@broadcast'));
    
    res.json({ success: true, broadcastLists, count: broadcastLists.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create broadcast list
router.post('/create', async (req, res) => {
  const { phone, name, recipients } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    // Note: Baileys doesn't directly support creating broadcast lists
    // This would require custom implementation
    res.json({ 
      success: false, 
      message: 'Broadcast list creation not directly supported by Baileys. Use sendBroadcast for similar functionality.' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send broadcast message
router.post('/send', async (req, res) => {
  const { phone, recipients, message } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const results = await Promise.all(
      recipients.map(async (recipient) => {
        try {
          const jid = recipient.includes("@") ? recipient : `${recipient}@s.whatsapp.net`;
          const result = await session.sock.sendMessage(jid, message);
          return { recipient: jid, success: true, messageId: result.key?.id };
        } catch (err) {
          return { recipient, success: false, error: err.message };
        }
      })
    );
    
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
