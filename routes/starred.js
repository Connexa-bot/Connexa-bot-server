
import express from 'express';
import { sessions } from '../helpers/whatsapp.js';

const router = express.Router();

const normalizePhone = (phone) => phone?.replace(/^\+|\s/g, '');

// Get all starred messages
router.get('/:phone', async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const store = session.store;
    const allMessages = Object.values(store.messages).flatMap(m => m.array || []);
    const starredMessages = allMessages.filter(msg => msg.starred);
    
    res.json({ success: true, starredMessages, count: starredMessages.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get starred messages by chat
router.get('/:phone/:chatId', async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const store = session.store;
    const chatMessages = store.messages[req.params.chatId]?.array || [];
    const starredMessages = chatMessages.filter(msg => msg.starred);
    
    res.json({ success: true, starredMessages, count: starredMessages.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search starred messages
router.post('/search', async (req, res) => {
  const { phone, query } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const store = session.store;
    const allMessages = Object.values(store.messages).flatMap(m => m.array || []);
    const starredMessages = allMessages.filter(msg => {
      if (!msg.starred) return false;
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      return text.toLowerCase().includes(query.toLowerCase());
    });
    
    res.json({ success: true, starredMessages, count: starredMessages.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unstar all messages
router.post('/unstar-all', async (req, res) => {
  const { phone } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const store = session.store;
    const allMessages = Object.values(store.messages).flatMap(m => m.array || []);
    const starredMessages = allMessages.filter(msg => msg.starred);
    
    for (const msg of starredMessages) {
      await session.sock.chatModify({ 
        star: { messages: [{ id: msg.key.id, fromMe: msg.key.fromMe }], star: false } 
      }, msg.key.remoteJid);
    }
    
    res.json({ success: true, unstarred: starredMessages.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
