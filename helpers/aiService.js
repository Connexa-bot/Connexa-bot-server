import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const CHAT_HISTORY_DIR = "./chat_history";
const MAX_HISTORY_MESSAGES = 50;

await fs.mkdir(CHAT_HISTORY_DIR, { recursive: true });

export async function getChatHistory(phone, chatId) {
  const filePath = path.join(CHAT_HISTORY_DIR, `${phone}_${chatId}.json`);
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function saveChatHistory(phone, chatId, messages) {
  const filePath = path.join(CHAT_HISTORY_DIR, `${phone}_${chatId}.json`);
  const limited = messages.slice(-MAX_HISTORY_MESSAGES);
  await fs.writeFile(filePath, JSON.stringify(limited, null, 2));
}

export async function addMessageToHistory(phone, chatId, role, content) {
  const history = await getChatHistory(phone, chatId);
  history.push({ role, content, timestamp: Date.now() });
  await saveChatHistory(phone, chatId, history);
  return history;
}

export async function generateAIResponse(phone, chatId, userMessage, options = {}) {
  if (!openai) {
    throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.");
  }

  const {
    systemPrompt = "You are a helpful WhatsApp assistant. Respond naturally and conversationally.",
    maxTokens = 500,
    includeHistory = true,
  } = options;

  let messages = [{ role: "system", content: systemPrompt }];

  if (includeHistory) {
    const history = await getChatHistory(phone, chatId);
    const recentHistory = history.slice(-10).map(h => ({
      role: h.role,
      content: h.content,
    }));
    messages = [...messages, ...recentHistory];
  }

  messages.push({ role: "user", content: userMessage });

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages,
    max_completion_tokens: maxTokens,
  });

  const aiReply = response.choices[0].message.content;

  await addMessageToHistory(phone, chatId, "user", userMessage);
  await addMessageToHistory(phone, chatId, "assistant", aiReply);

  return {
    reply: aiReply,
    usage: response.usage,
    model: response.model,
  };
}

export async function analyzeImageWithAI(base64Image, prompt = "Describe this image in detail") {
  if (!openai) {
    throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.");
  }

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
        ],
      },
    ],
    max_completion_tokens: 1000,
  });

  return response.choices[0].message.content;
}

export async function transcribeAudioWithAI(audioFilePath) {
  if (!openai) {
    throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.");
  }

  const audioReadStream = await fs.readFile(audioFilePath);
  const audioBuffer = Buffer.from(audioReadStream);

  const transcription = await openai.audio.transcriptions.create({
    file: new File([audioBuffer], path.basename(audioFilePath)),
    model: "whisper-1",
  });

  return {
    text: transcription.text,
    duration: transcription.duration || 0,
  };
}

export async function analyzeSentiment(text) {
  if (!openai) {
    throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.");
  }

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: "You are a sentiment analysis expert. Analyze the sentiment and respond with JSON: { 'sentiment': 'positive'|'negative'|'neutral', 'score': 0-1, 'emotions': ['emotion1', 'emotion2'] }",
      },
      { role: "user", content: text },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function generateSmartReply(phone, chatId, context = {}) {
  if (!openai) {
    throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.");
  }

  const {
    lastMessage,
    messageType = "text",
    senderName = "User",
    relationship = "friend",
  } = context;

  const systemPrompt = `You are generating a smart reply suggestion for a WhatsApp chat. 
The sender is a ${relationship}. Generate 3 short, appropriate reply suggestions (max 10 words each).
Respond with JSON: { "suggestions": ["reply1", "reply2", "reply3"] }`;

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `${senderName} said: "${lastMessage}"` },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 200,
  });

  const result = JSON.parse(response.choices[0].message.content);
  return result.suggestions || [];
}

export async function autoReplyToMessage(phone, chatId, message, settings = {}) {
  if (!openai) {
    throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.");
  }

  const {
    autoReplyEnabled = true,
    personality = "friendly and helpful",
    language = "auto-detect",
    contextWindow = 5,
  } = settings;

  if (!autoReplyEnabled) return null;

  const history = await getChatHistory(phone, chatId);
  const recentMessages = history.slice(-contextWindow);

  const systemPrompt = `You are an auto-reply bot for WhatsApp. Be ${personality}.
Respond in ${language === "auto-detect" ? "the same language as the user" : language}.
Keep responses brief and natural (1-3 sentences max).`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...recentMessages.map(h => ({ role: h.role, content: h.content })),
    { role: "user", content: message },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages,
    max_completion_tokens: 300,
  });

  const reply = response.choices[0].message.content;

  await addMessageToHistory(phone, chatId, "user", message);
  await addMessageToHistory(phone, chatId, "assistant", reply);

  return {
    reply,
    confidence: 0.9,
    shouldSend: true,
  };
}

export async function summarizeConversation(phone, chatId, messageCount = 20) {
  if (!openai) {
    throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.");
  }

  const history = await getChatHistory(phone, chatId);
  const messages = history.slice(-messageCount);

  if (messages.length === 0) {
    return "No conversation history available.";
  }

  const conversationText = messages
    .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: "Summarize the following conversation concisely, highlighting key points and action items.",
      },
      { role: "user", content: conversationText },
    ],
    max_completion_tokens: 500,
  });

  return response.choices[0].message.content;
}

export async function clearChatHistory(phone, chatId = null) {
  if (chatId) {
    const filePath = path.join(CHAT_HISTORY_DIR, `${phone}_${chatId}.json`);
    await fs.unlink(filePath).catch(() => {});
    return { cleared: 1 };
  } else {
    const files = await fs.readdir(CHAT_HISTORY_DIR);
    const phoneFiles = files.filter(f => f.startsWith(phone));
    for (const file of phoneFiles) {
      await fs.unlink(path.join(CHAT_HISTORY_DIR, file)).catch(() => {});
    }
    return { cleared: phoneFiles.length };
  }
}
