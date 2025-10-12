// routes/ai.js
// ===============================
// AI automation routes
// ===============================

import express from 'express';
import { sessions } from '../helpers/whatsapp.js';
import * as aiService from '../helpers/aiService.js';
import { sendMessage } from '../helpers/messageActions.js';

const router = express.Router();

const normalizePhone = (phone) => phone?.replace(/^\+|\s/g, '');

// ============= SMART REPLY & ASSISTANCE =============

// Generate smart reply suggestions
router.post('/smart-reply', async (req, res) => {
  const { phone, chatId, lastMessage, senderName, relationship } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const suggestions = await aiService.generateSmartReply(normalizedPhone, chatId, {
      lastMessage,
      senderName,
      relationship
    });
    res.json({ success: true, suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-reply to message
router.post('/auto-reply', async (req, res) => {
  const { phone, chatId, to, message, settings } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await aiService.autoReplyToMessage(normalizedPhone, chatId, message, settings);
    
    if (result && result.shouldSend && to) {
      const msg = await sendMessage(normalizedPhone, to, result.reply);
      res.json({ success: true, reply: result.reply, sent: true, messageId: msg.key.id });
    } else {
      res.json({ success: true, reply: result?.reply, sent: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate AI response
router.post('/generate', async (req, res) => {
  const { phone, chatId, userMessage, systemPrompt, maxTokens, includeHistory } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await aiService.generateAIResponse(normalizedPhone, chatId, userMessage, {
      systemPrompt,
      maxTokens,
      includeHistory
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= CONTENT ANALYSIS =============

// Analyze sentiment
router.post('/sentiment', async (req, res) => {
  const { phone, text } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const sentiment = await aiService.analyzeSentiment(text);
    res.json({ success: true, sentiment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analyze image
router.post('/analyze-image', async (req, res) => {
  const { phone, base64Image, prompt } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const analysis = await aiService.analyzeImageWithAI(base64Image, prompt);
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transcribe audio
router.post('/transcribe', async (req, res) => {
  const { phone, audioFilePath } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const transcription = await aiService.transcribeAudioWithAI(audioFilePath);
    res.json({ success: true, ...transcription });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= CONVERSATION MANAGEMENT =============

// Summarize conversation
router.post('/summarize', async (req, res) => {
  const { phone, chatId, messageCount } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const summary = await aiService.summarizeConversation(normalizedPhone, chatId, messageCount);
    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chat history
router.get('/history/:phone/:chatId', async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const history = await aiService.getChatHistory(normalizedPhone, req.params.chatId);
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear chat history
router.post('/history/clear', async (req, res) => {
  const { phone, chatId } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await aiService.clearChatHistory(normalizedPhone, chatId);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= CONTENT MODERATION & SAFETY =============

// Content moderation (using AI to check for inappropriate content)
router.post('/moderate', async (req, res) => {
  const { phone, text } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    // Use AI to detect inappropriate content
    const result = await aiService.generateAIResponse(normalizedPhone, 'moderation', text, {
      systemPrompt: 'You are a content moderator. Analyze the following text for inappropriate content, hate speech, spam, or harmful material. Respond with JSON: { "safe": true/false, "reason": "explanation", "categories": ["category1", "category2"] }',
      maxTokens: 200,
      includeHistory: false
    });
    
    const moderation = JSON.parse(result.reply);
    res.json({ success: true, moderation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= TRANSLATION =============

// Translate text
router.post('/translate', async (req, res) => {
  const { phone, text, targetLang } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await aiService.generateAIResponse(normalizedPhone, 'translation', text, {
      systemPrompt: `Translate the following text to ${targetLang}. Return only the translation, no explanations.`,
      maxTokens: 500,
      includeHistory: false
    });
    
    res.json({ success: true, translation: result.reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= SMART COMPOSE =============

// Smart compose (continue writing)
router.post('/compose', async (req, res) => {
  const { phone, chatId, context, tone } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const result = await aiService.generateAIResponse(normalizedPhone, chatId, context, {
      systemPrompt: `You are a writing assistant. Help compose a message based on the context. Use a ${tone || 'friendly'} tone. Be concise and natural.`,
      maxTokens: 300,
      includeHistory: true
    });
    
    res.json({ success: true, composed: result.reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= MESSAGE ENHANCEMENT =============

// Improve message (grammar, clarity, tone)
router.post('/improve', async (req, res) => {
  const { phone, text, improvements } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    const improvementTypes = improvements || ['grammar', 'clarity', 'tone'];
    const result = await aiService.generateAIResponse(normalizedPhone, 'improvement', text, {
      systemPrompt: `Improve the following message for ${improvementTypes.join(', ')}. Return only the improved version, no explanations.`,
      maxTokens: 300,
      includeHistory: false
    });
    
    res.json({ success: true, improved: result.reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= BATCH OPERATIONS =============

// Batch analyze messages
router.post('/batch-analyze', async (req, res) => {
  const { phone, messages } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: 'Not connected' });

  try {
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    const results = [];
    for (const message of messages) {
      try {
        const sentiment = await aiService.analyzeSentiment(message.text);
        results.push({ messageId: message.id, sentiment, success: true });
      } catch (error) {
        results.push({ messageId: message.id, success: false, error: error.message });
      }
    }
    
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
