import express from "express";
import { sessions } from "../helpers/whatsapp.js";
import * as aiCtrl from "../controllers/ai.js";

const router = express.Router();

router.post("/generate-response", async (req, res) => {
  const { phone, chatId, message, options } = req.body;
  const session = sessions.get(phone?.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });

  try {
    const result = await aiCtrl.generateResponse(phone, chatId, message, options);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/analyze-image", async (req, res) => {
  const { phone, base64Image, prompt } = req.body;
  const session = sessions.get(phone?.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });

  try {
    const analysis = await aiCtrl.analyzeImage(base64Image, prompt);
    res.json({ success: true, data: { analysis } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/transcribe-audio", async (req, res) => {
  const { phone, audioFilePath } = req.body;
  const session = sessions.get(phone?.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });

  try {
    const transcription = await aiCtrl.transcribeAudio(audioFilePath);
    res.json({ success: true, data: transcription });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/analyze-sentiment", async (req, res) => {
  const { phone, text } = req.body;
  const session = sessions.get(phone?.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });

  try {
    const sentiment = await aiCtrl.analyzeSentimentForText(text);
    res.json({ success: true, data: sentiment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/smart-replies", async (req, res) => {
  const { phone, chatId, context } = req.body;
  const session = sessions.get(phone?.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });

  try {
    const suggestions = await aiCtrl.getSmartReplies(phone, chatId, context);
    res.json({ success: true, data: { suggestions } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/auto-reply", async (req, res) => {
  const { phone, chatId, message, settings } = req.body;
  const session = sessions.get(phone?.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });

  try {
    const result = await aiCtrl.autoReply(phone, chatId, message, settings);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/summarize", async (req, res) => {
  const { phone, chatId, messageCount } = req.body;
  const session = sessions.get(phone?.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });

  try {
    const summary = await aiCtrl.summarize(phone, chatId, messageCount || 20);
    res.json({ success: true, data: { summary } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/chat-history/:phone/:chatId", async (req, res) => {
  const { phone, chatId } = req.params;
  const session = sessions.get(phone?.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });

  try {
    const history = await aiCtrl.getChatHistory(phone, chatId);
    res.json({ success: true, data: { history } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/chat-history/:phone/:chatId?", async (req, res) => {
  const { phone, chatId } = req.params;
  const session = sessions.get(phone?.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ success: false, error: "Not connected" });

  try {
    const result = await aiCtrl.clearHistory(phone, chatId || null);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
