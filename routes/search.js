
import express from 'express';
import { sessions } from '../helpers/whatsapp.js';

const router = express.Router();

const normalizePhone = (phone) => phone?.replace(/^\+|\s/g, '');

// Global message search
router.post('/messages', async (req, res) => {
  const { phone, query, limit = 100 } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const store = session.store;
    const allMessages = Object.values(store.messages).flatMap(m => m.array || []);
    
    const results = allMessages
      .filter(msg => {
        const text = msg.message?.conversation || 
                    msg.message?.extendedTextMessage?.text || 
                    msg.message?.imageMessage?.caption ||
                    msg.message?.videoMessage?.caption || '';
        return text.toLowerCase().includes(query.toLowerCase());
      })
      .slice(0, limit)
      .map(msg => ({
        messageId: msg.key.id,
        chatId: msg.key.remoteJid,
        text: msg.message?.conversation || msg.message?.extendedTextMessage?.text || '',
        timestamp: msg.messageTimestamp,
        fromMe: msg.key.fromMe
      }));
    
    res.json({ success: true, results, count: results.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search by date range
router.post('/by-date', async (req, res) => {
  const { phone, startDate, endDate } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const store = session.store;
    const allMessages = Object.values(store.messages).flatMap(m => m.array || []);
    
    const start = new Date(startDate).getTime() / 1000;
    const end = new Date(endDate).getTime() / 1000;
    
    const results = allMessages.filter(msg => {
      const timestamp = msg.messageTimestamp;
      return timestamp >= start && timestamp <= end;
    });
    
    res.json({ success: true, results, count: results.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search by media type
router.post('/by-media', async (req, res) => {
  const { phone, mediaType } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const store = session.store;
    const allMessages = Object.values(store.messages).flatMap(m => m.array || []);
    
    const results = allMessages.filter(msg => {
      return msg.message?.[`${mediaType}Message`] !== undefined;
    });
    
    res.json({ success: true, results, count: results.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread chats
router.get('/unread/:phone', async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const store = session.store;
    const chats = store.chats?.all() || [];
    const unreadChats = chats.filter(chat => chat.unreadCount > 0);
    const totalUnread = unreadChats.reduce((sum, chat) => sum + chat.unreadCount, 0);
    
    res.json({ success: true, unreadChats, totalUnread });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
