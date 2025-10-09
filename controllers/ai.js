import * as aiService from "../helpers/aiService.js";

export async function generateResponse(phone, chatId, userMessage, options) {
  return await aiService.generateAIResponse(phone, chatId, userMessage, options);
}

export async function analyzeImage(base64Image, prompt) {
  return await aiService.analyzeImageWithAI(base64Image, prompt);
}

export async function transcribeAudio(audioFilePath) {
  return await aiService.transcribeAudioWithAI(audioFilePath);
}

export async function analyzeSentimentForText(text) {
  return await aiService.analyzeSentiment(text);
}

export async function getSmartReplies(phone, chatId, context) {
  return await aiService.generateSmartReply(phone, chatId, context);
}

export async function autoReply(phone, chatId, message, settings) {
  return await aiService.autoReplyToMessage(phone, chatId, message, settings);
}

export async function summarize(phone, chatId, messageCount) {
  return await aiService.summarizeConversation(phone, chatId, messageCount);
}

export async function getChatHistory(phone, chatId) {
  return await aiService.getChatHistory(phone, chatId);
}

export async function clearHistory(phone, chatId) {
  return await aiService.clearChatHistory(phone, chatId);
}
