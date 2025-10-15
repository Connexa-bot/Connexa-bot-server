import express from "express";
import { sessions, startBot, logoutFromWhatsApp, clearSession, clearSessionState } from "../helpers/whatsapp.js";

// Import action helpers
import * as chatActions from "../helpers/chatActions.js";
import * as messageActions from "../helpers/messageActions.js";
import * as groupActions from "../helpers/groupActions.js";
import * as contactActions from "../helpers/contactActions.js";
import * as presenceActions from "../helpers/presenceActions.js";
import * as profileActions from "../helpers/profileActions.js";
import * as statusActions from "../helpers/statusActions.js";
import * as channelActions from "../helpers/channelActions.js";
import * as callActions from "../helpers/callActions.js";
import { fetchCalls } from "../helpers/fetchers.js"; // Explicitly import fetchCalls

export function createApiRoutes(broadcast) {
  const router = express.Router();

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================
  const normalizePhone = (phone) => {
    if (!phone) return '';
    return String(phone).replace(/\D/g, '');
  };

  const getSession = (phone) => {
    const normalizedPhone = normalizePhone(phone);
    return sessions.get(normalizedPhone);
  };

  const validateSession = (phone) => {
    const session = getSession(phone);
    if (!session || !session.connected) {
      return { valid: false, error: "Not connected to WhatsApp" };
    }
    return { valid: true, session };
  };

  // ===============================
  // SECTION 0: HEALTH & CONNECTION
  // ===============================

  router.get("/", (req, res) => res.send("🚀 WhatsApp Bot Backend running..."));

  // Health check endpoint
  router.get("/health", (req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      activeSessions: sessions.size
    });
  });

  // Connect to WhatsApp and generate QR/link code
  router.post("/connect", async (req, res) => {
    const { phone } = req.body;
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) return res.status(400).json({ error: "Phone number is required" });

    try {
      if (sessions.has(normalizedPhone)) await clearSession(normalizedPhone);
      await startBot(normalizedPhone, broadcast);

      let attempts = 0;
      const maxAttempts = 120;
      const checkInterval = 500;

      const checkSession = () => new Promise((resolve) => {
        const interval = setInterval(() => {
          const session = sessions.get(normalizedPhone);
          attempts++;

          if (session && (session.qrCode || session.linkCode || session.connected || session.error)) {
            clearInterval(interval);
            resolve({
              success: true,
              qrCode: session.qrCode || null,
              linkCode: session.linkCode || null,
              message: session.error || (session.connected ? "Connected" : "Scan QR code or use link code"),
              connected: session.connected || false
            });
            return;
          }

          if (attempts >= maxAttempts) {
            clearInterval(interval);
            resolve({
              success: false,
              qrCode: null,
              linkCode: null,
              message: "Connection timeout. Please try again.",
              connected: false,
              error: "Timeout waiting for QR/link code"
            });
          }
        }, checkInterval);
      });

      const result = await checkSession();
      res.json(result);
    } catch (err) {
      console.error(`❌ Connect error for ${normalizedPhone}:`, err);
      res.status(500).json({
        success: false,
        error: `Failed to connect: ${err.message}`,
        qrCode: null,
        linkCode: null,
        connected: false
      });
    }
  });

  // Get connection status
  router.get("/status/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const session = sessions.get(normalizedPhone);

    if (!session) {
      return res.json({
        connected: false,
        status: 'not_found',
        error: "No session found"
      });
    }

    const isConnected = session.connected === true || session.sock?.user?.id || false;

    res.json({
      connected: isConnected,
      status: isConnected ? 'connected' : 'waiting',
      authenticated: isConnected,
      ready: isConnected,
      isConnected: isConnected,
      qrCode: !isConnected ? session.qrCode : null,
      linkCode: !isConnected ? session.linkCode : null,
      user: session.sock?.user || null,
      phone: normalizedPhone,
      error: session.error
    });
  });

  // Logout and clear session
  router.post("/logout", async (req, res) => {
    const { phone } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const session = sessions.get(normalizedPhone);
    if (session && session.sock?.ws?.readyState !== 3) {
      await logoutFromWhatsApp(session.sock, normalizedPhone);
    }
    await clearSession(normalizedPhone);
    res.json({ success: true, message: "Session cleared. Please reconnect." });
  });

  // Clear session state
  router.post("/clear-state/:phoneNumber", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phoneNumber);
    const { fullReset } = req.query;

    const success = await clearSessionState(normalizedPhone, fullReset === 'true');

    if (success) {
      if (fullReset === 'true') {
        sessions.delete(normalizedPhone);
      }
      res.json({ success: true, message: 'State cleared successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to clear state' });
    }
  });

  // ===============================
  // SECTION 1: CHAT LIST SCREEN
  // ===============================

  // Get all chats with full details
  router.get("/chats/:phone", async (req, res) => {
    const validation = validateSession(req.params.phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const normalizedPhone = normalizePhone(req.params.phone);
      console.log(`📋 Fetching chats for ${normalizedPhone}`);

      const chats = await chatActions.getChats(normalizedPhone); // Changed from fetchChats to chatActions.getChats
      console.log(`📋 Found ${chats.length} chats`);

      // Get profile pictures for each chat
      const chatsWithPics = await Promise.all(
        chats.map(async (chat) => {
          try {
            const profilePicUrl = await validation.session.sock.profilePictureUrl(chat.id, 'image').catch(() => null);
            return { ...chat, profilePicUrl };
          } catch (err) {
            return { ...chat, profilePicUrl: null };
          }
        })
      );

      res.json({ success: true, chats: chatsWithPics, count: chatsWithPics.length });
    } catch (err) {
      console.error(`❌ Error fetching chats:`, err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get specific chat by ID
  router.get("/chats/:phone/:chatId", async (req, res) => {
    const { phone, chatId } = req.params;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await chatActions.getChatById(phone, chatId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Archive/Unarchive chat
  router.post("/chats/archive", async (req, res) => {
    const { phone, chatId, archive } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await chatActions.archiveChat(normalizedPhone, chatId);
      res.json({ success: true, message: archive ? "Chat archived" : "Chat unarchived" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Pin/Unpin chat
  router.post("/chats/pin", async (req, res) => {
    const { phone, chatId, pin } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await chatActions.pinChat(normalizedPhone, chatId, pin);
      res.json({ success: true, message: pin ? "Chat pinned" : "Chat unpinned" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete chat
  router.post("/chats/delete", async (req, res) => {
    const { phone, chatId } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await chatActions.deleteChat(normalizedPhone, chatId);
      res.json({ success: true, message: "Chat deleted" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mark chat as read/unread
  router.post("/chats/mark-read", async (req, res) => {
    const { phone, chatId } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await chatActions.markChatRead(normalizedPhone, chatId);
      res.json({ success: true, message: "Chat marked as read" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post("/chats/mark-unread", async (req, res) => {
    const { phone, chatId } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await chatActions.markChatUnread(normalizedPhone, chatId);
      res.json({ success: true, message: "Chat marked as unread" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mute/Unmute chat
  router.post("/chats/mute", async (req, res) => {
    const { phone, chatId, duration } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await chatActions.muteChat(normalizedPhone, chatId, duration);
      res.json({ success: true, message: duration ? "Chat muted" : "Chat unmuted" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Clear chat history
  router.post("/chats/clear", async (req, res) => {
    const { phone, chatId } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await chatActions.clearChat(normalizedPhone, chatId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get archived chats
  router.get("/chats/archived/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await chatActions.getArchivedChats(normalizedPhone);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Search chats
  router.get("/chats/search/:phone", async (req, res) => {
    const { phone } = req.params;
    const { query } = req.query;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await chatActions.searchChats(phone, query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===============================
  // SECTION 2: CONTACT PROFILE SCREEN
  // ===============================

  // Get all contacts
  router.get("/contacts/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const { fetchContacts } = await import("../helpers/fetchers.js");
      const contacts = await fetchContacts(validation.session.store, validation.session.sock);
      res.json({ success: true, contacts, count: contacts.length });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get specific contact
  router.get("/contacts/:phone/:contactId", async (req, res) => {
    const { phone, contactId } = req.params;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await contactActions.getContact(normalizePhone(phone), contactId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get profile picture
  router.get("/contacts/:phone/:contactId/picture", async (req, res) => {
    const { phone, contactId } = req.params;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await contactActions.getProfilePicture(normalizePhone(phone), contactId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get contact status/about
  router.get("/contacts/:phone/:contactId/status", async (req, res) => {
    const { phone, contactId } = req.params;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await contactActions.getStatus(normalizePhone(phone), contactId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Check if contact exists on WhatsApp
  router.post("/contacts/check-exists", async (req, res) => {
    const { phone, phoneNumber } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await contactActions.checkIfContactExists(normalizePhone(phone), phoneNumber);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Block contact
  router.post("/contacts/block", async (req, res) => {
    const { phone, contactId } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await contactActions.blockContact(normalizePhone(phone), contactId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Unblock contact
  router.post("/contacts/unblock", async (req, res) => {
    const { phone, contactId } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await contactActions.unblockContact(normalizePhone(phone), contactId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get business profile
  router.get("/contacts/:phone/:contactId/business-profile", async (req, res) => {
    const { phone, contactId } = req.params;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await contactActions.getBusinessProfile(normalizePhone(phone), contactId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===============================
  // SECTION 3: STATUS/UPDATES SCREEN
  // ===============================

  // Get all status updates
  router.get("/status-updates/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const { fetchStatusUpdates } = await import("../helpers/fetchers.js");
      const statusUpdates = await fetchStatusUpdates(normalizedPhone);
      res.json({ success: true, statusUpdates, count: statusUpdates.length });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Post text status
  router.post("/status/post-text", async (req, res) => {
    const { phone, text, statusJidList, backgroundColor, font } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await statusActions.postTextStatus(normalizePhone(phone), text, statusJidList || [], { backgroundColor, font });
      res.json({ success: true, messageId: result.key?.id });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Post image status
  router.post("/status/post-image", async (req, res) => {
    const { phone, imageUrl, caption, statusJidList } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await statusActions.postImageStatus(normalizePhone(phone), imageUrl, caption, statusJidList);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Post video status
  router.post("/status/post-video", async (req, res) => {
    const { phone, videoUrl, caption, statusJidList } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await statusActions.postVideoStatus(normalizePhone(phone), videoUrl, caption, statusJidList);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete status
  router.post("/status/delete", async (req, res) => {
    const { phone, statusKey } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await statusActions.deleteStatus(normalizePhone(phone), statusKey);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // View status
  router.post("/status/view", async (req, res) => {
    const { phone, statusJid, messageKeys } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await statusActions.viewStatus(normalizePhone(phone), statusJid, messageKeys);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get status privacy settings
  router.get("/status/privacy/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await statusActions.getStatusPrivacy(normalizedPhone);
      res.json({ success: true, privacy: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===============================
  // SECTION 4: GROUPS SCREEN
  // ===============================

  // Get all groups
  router.get("/groups/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const { fetchGroups } = await import("../helpers/fetchers.js");
      const groups = await fetchGroups(normalizedPhone);
      res.json({ success: true, groups, count: groups.length });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get group metadata
  router.get("/groups/:phone/:groupId/metadata", async (req, res) => {
    const { phone, groupId } = req.params;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await groupActions.getGroupMetadata(normalizePhone(phone), groupId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create group
  router.post("/groups/create", async (req, res) => {
    const { phone, name, participants } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await groupActions.createGroup(normalizePhone(phone), name, participants);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get group invite code
  router.get("/groups/:phone/:groupId/invite-code", async (req, res) => {
    const { phone, groupId } = req.params;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await groupActions.getGroupInviteCode(normalizePhone(phone), groupId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Join group via invite
  router.post("/groups/join-via-invite", async (req, res) => {
    const { phone, inviteCode } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await groupActions.joinGroupViaInvite(normalizePhone(phone), inviteCode);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Leave group
  router.post("/groups/leave", async (req, res) => {
    const { phone, groupId } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await groupActions.leaveGroup(normalizePhone(phone), groupId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update group subject
  router.post("/groups/update-subject", async (req, res) => {
    const { phone, groupId, subject } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await groupActions.updateGroupSubject(normalizePhone(phone), groupId, subject);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update group description
  router.post("/groups/update-description", async (req, res) => {
    const { phone, groupId, description } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await groupActions.updateGroupDescription(normalizePhone(phone), groupId, description);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Add participants
  router.post("/groups/add-participants", async (req, res) => {
    const { phone, groupId, participants } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await groupActions.addParticipants(normalizePhone(phone), groupId, participants);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Remove participants
  router.post("/groups/remove-participants", async (req, res) => {
    const { phone, groupId, participants } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await groupActions.removeParticipants(normalizePhone(phone), groupId, participants);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Promote participants to admin
  router.post("/groups/promote-participants", async (req, res) => {
    const { phone, groupId, participants } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await groupActions.promoteParticipants(normalizePhone(phone), groupId, participants);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Demote participants from admin
  router.post("/groups/demote-participants", async (req, res) => {
    const { phone, groupId, participants } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await groupActions.demoteParticipants(normalizePhone(phone), groupId, participants);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update group picture
  router.post("/groups/update-picture", async (req, res) => {
    const { phone, groupId, imageUrl } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await groupActions.updateGroupPicture(normalizePhone(phone), groupId, imageUrl);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Toggle announcement mode
  router.post("/groups/toggle-announcement", async (req, res) => {
    const { phone, groupId, announce } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await groupActions.toggleAnnouncement(normalizePhone(phone), groupId, announce);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===============================
  // SECTION 5: CHANNELS SCREEN
  // ===============================

  // Get all channels
  router.get("/channels/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const { fetchChannels } = await import("../helpers/fetchers.js");
      const channels = await fetchChannels(normalizedPhone);
      res.json({ success: true, data: { channels } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get channel info
  router.get("/channels/:phone/:channelId/info", async (req, res) => {
    const { phone, channelId } = req.params;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await channelActions.getChannelInfo(normalizePhone(phone), channelId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Follow channel
  router.post("/channels/follow", async (req, res) => {
    const { phone, channelJid } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await channelActions.followChannel(normalizePhone(phone), channelJid);
      res.json(result);
    } catch (err) {


  // ===============================
  // SECTION 18: LINKED DEVICES
  // ===============================

  // Get linked devices
  router.get("/devices/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const devices = await validation.session.sock.getLinkedDevices();
      res.json({ success: true, devices });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Unlink device
  router.post("/devices/unlink", async (req, res) => {
    const { phone, deviceId } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      await validation.session.sock.unlinkDevice(deviceId);
      res.json({ success: true, message: "Device unlinked" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Unfollow channel
  router.post("/channels/unfollow", async (req, res) => {
    const { phone, channelJid } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await channelActions.unfollowChannel(normalizePhone(phone), channelJid);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mute channel
  router.post("/channels/mute", async (req, res) => {
    const { phone, channelJid, duration } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await channelActions.muteChannel(normalizePhone(phone), channelJid, duration);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===============================
  // SECTION 6: COMMUNITIES SCREEN
  // ===============================

  // Get all communities
  router.get("/communities/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const { fetchCommunities } = await import("../helpers/fetchers.js");
      const communities = await fetchCommunities(normalizedPhone);
      res.json({ success: true, data: { communities } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===============================
  // SECTION 7: CHAT VIEW/MESSAGING
  // ===============================

  // Get messages from a chat
  router.get("/messages/:phone/:chatId", async (req, res) => {
    const { phone, chatId } = req.params;
    const { limit } = req.query;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const { fetchMessages } = await import("../helpers/fetchers.js");
      const messages = await fetchMessages(validation.session.store, chatId, parseInt(limit) || 50);
      res.json({ success: true, data: { messages } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Send text message
  router.post("/messages/send", async (req, res) => {
    const { phone, to, text, mentions } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = mentions && mentions.length > 0
        ? await messageActions.sendMessageWithMentions(normalizePhone(phone), to, text, mentions)
        : await messageActions.sendMessage(normalizePhone(phone), to, text);
      res.json({ success: true, messageId: result.key?.id });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Reply to message
  router.post("/messages/reply", async (req, res) => {
    const { phone, to, text, quotedMessage } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.replyToMessage(normalizePhone(phone), to, text, quotedMessage);
      res.json({ success: true, messageId: result.key?.id });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Send image
  router.post("/messages/send-image", async (req, res) => {
    const { phone, to, imageUrl, caption } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.sendImage(normalizePhone(phone), to, imageUrl, caption);
      res.json({ success: true, messageId: result.key?.id });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Send video
  router.post("/messages/send-video", async (req, res) => {
    const { phone, to, videoUrl, caption, gifPlayback } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.sendVideo(normalizePhone(phone), to, videoUrl, caption, gifPlayback);
      res.json({ success: true, messageId: result.key?.id });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Send audio
  router.post("/messages/send-audio", async (req, res) => {
    const { phone, to, audioUrl, ptt } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.sendAudio(normalizePhone(phone), to, audioUrl, ptt);
      res.json({ success: true, messageId: result.key?.id });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Send document
  router.post("/messages/send-document", async (req, res) => {
    const { phone, to, documentUrl, fileName, mimetype } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.sendDocument(normalizePhone(phone), to, documentUrl, fileName, mimetype);
      res.json({ success: true, messageId: result.key?.id });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Send location
  router.post("/messages/send-location", async (req, res) => {
    const { phone, to, latitude, longitude, name, address } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.sendLocation(normalizePhone(phone), to, parseFloat(latitude), parseFloat(longitude), name, address);
      res.json({ success: true, messageId: result.key?.id });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Send contact
  router.post("/messages/send-contact", async (req, res) => {
    const { phone, to, contacts } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.sendContact(normalizePhone(phone), to, contacts);
      res.json({ success: true, messageId: result.key?.id });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Send poll
  router.post("/messages/send-poll", async (req, res) => {
    const { phone, to, name, options, selectableCount } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.sendPoll(normalizePhone(phone), to, name, options, selectableCount || 1);
      res.json({ success: true, messageId: result.key?.id });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Send list message
  router.post("/messages/send-list", async (req, res) => {
    const { phone, to, text, buttonText, sections, footer, title } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.sendList(normalizePhone(phone), to, text, buttonText, sections, footer, title);
      res.json({ success: true, messageId: result.key?.id });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Forward message
  router.post("/messages/forward", async (req, res) => {
    const { phone, to, message } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.forwardMessage(normalizePhone(phone), to, message);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete message
  router.post("/messages/delete", async (req, res) => {
    const { phone, chatId, messageKey } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.deleteMessage(normalizePhone(phone), chatId, messageKey);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // React to message
  router.post("/messages/react", async (req, res) => {
    const { phone, chatId, messageKey, emoji } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.reactToMessage(normalizePhone(phone), chatId, messageKey, emoji);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Edit message
  router.post("/messages/edit", async (req, res) => {
    const { phone, chatId, messageKey, newText } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.editMessage(normalizePhone(phone), chatId, messageKey, newText);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Star message
  router.post("/messages/star", async (req, res) => {
    const { phone, chatId, messageKey, star } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.starMessage(normalizePhone(phone), chatId, messageKey, star);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Download media
  router.post("/messages/download", async (req, res) => {
    const { phone, messageKey } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.downloadMedia(normalizePhone(phone), messageKey);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Send broadcast message
  router.post("/messages/send-broadcast", async (req, res) => {
    const { phone, recipients, message } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.sendBroadcast(normalizePhone(phone), recipients, message);
      res.json({ success: true, results: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===============================
  // SECTION 8: CALLS
  // ===============================

  // Get call history
  router.get("/calls/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const calls = await fetchCalls(normalizedPhone);
      res.json({ success: true, calls: calls });
    } catch (err) {
      res.status(500).json({ success: false, calls: [], error: err.message });
    }
  });

  // Make call (note: not directly supported by Baileys)
  router.post("/calls/make", async (req, res) => {
    const { phone, to, isVideo } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    res.json({
      success: false,
      error: "Direct call initiation is not supported by Baileys API. Use WhatsApp client to make calls."
    });
  });

  // ===============================
  // SECTION 9: PRESENCE & TYPING
  // ===============================

  // Update presence (typing, recording, online, etc.)
  router.post("/presence/update", async (req, res) => {
    const { phone, chatId, presence } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      await validation.session.sock.sendPresenceUpdate(presence, chatId);
      res.json({ success: true, presence, chatId });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Subscribe to presence updates
  router.post("/presence/subscribe", async (req, res) => {
    const { phone, contactId } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      await validation.session.sock.presenceSubscribe(contactId);
      res.json({ success: true, message: `Subscribed to presence updates for ${contactId}` });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===============================
  // SECTION 10: PROFILE SETTINGS
  // ===============================

  // Get own profile
  router.get("/profile/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const { fetchProfile } = await import("../helpers/fetchers.js");
      const jid = normalizedPhone + '@s.whatsapp.net';
      const profile = await fetchProfile(validation.session.sock, jid);

      const userData = {
        name: validation.session.sock.user?.name || normalizedPhone,
        phone: normalizedPhone,
        status: profile.status || '',
        picture: profile.profilePicUrl || null,
      };

      res.json({ success: true, data: userData });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update profile name
  router.post("/profile/update-name", async (req, res) => {
    const { phone, name } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      await validation.session.sock.updateProfileName(name);
      res.json({ success: true, name });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update profile status/about
  router.post("/profile/update-status", async (req, res) => {
    const { phone, status } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      await validation.session.sock.updateProfileStatus(status);
      res.json({ success: true, status });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update profile picture
  router.post("/profile/update-picture", async (req, res) => {
    const { phone, imageUrl } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await profileActions.updateProfilePicture(normalizePhone(phone), imageUrl);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Remove profile picture
  router.post("/profile/remove-picture", async (req, res) => {
    const { phone } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await profileActions.removeProfilePicture(normalizePhone(phone));
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===============================
  // SECTION 11: PRIVACY SETTINGS
  // ===============================

  // Get privacy settings
  router.get("/privacy/settings/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await validation.session.sock.fetchPrivacySettings();
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update privacy settings
  router.post("/privacy/settings/update", async (req, res) => {
    const { phone, setting, value } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      // Use the chatActions helper which has the proper implementation
      const result = await chatActions.updatePrivacySettings(normalizedPhone, setting, value);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get blocked contacts
  router.get("/privacy/blocked/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await validation.session.sock.fetchBlocklist();
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Set disappearing messages
  router.post("/privacy/disappearing-messages", async (req, res) => {
    const { phone, chatId, duration } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      await validation.session.sock.sendMessage(chatId, {
        disappearingMessagesInChat: duration ? duration : false
      });
      res.json({ success: true, message: "Disappearing messages updated" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===============================
  // SECTION 12: STARRED MESSAGES
  // ===============================

  // Get starred messages
  router.get("/messages/starred/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.getStarredMessages(normalizedPhone);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===============================
  // SECTION 13: MEDIA GALLERY
  // ===============================

  // Get shared media from chat
  router.get("/media/:phone/:chatId", async (req, res) => {
    const { phone, chatId } = req.params;
    const { type } = req.query;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.getSharedMedia(validation.session.store, chatId, type);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===============================
  // SECTION 14: BROADCAST LISTS
  // ===============================

  // Get broadcast lists
  router.get("/broadcast/lists/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    res.json({
      success: true,
      message: "Broadcast lists are managed client-side. Use send-broadcast endpoint to send messages."
    });
  });

  // ===============================
  // SECTION 15: SEARCH
  // ===============================

  // Search messages globally
  router.get("/search/messages/:phone", async (req, res) => {
    const { phone } = req.params;
    const { query } = req.query;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const result = await messageActions.searchMessages(phone, query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===============================
  // SECTION 16: QR CODE & MULTI-DEVICE
  // ===============================

  // Get linked devices
  router.get("/devices/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      const devices = await validation.session.sock.getLinkedDevices();
      res.json({ success: true, devices });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Unlink device
  router.post("/devices/unlink", async (req, res) => {
    const { phone, deviceId } = req.body;
    const validation = validateSession(phone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    try {
      await validation.session.sock.unlinkDevice(deviceId);
      res.json({ success: true, message: "Device unlinked" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===============================
  // SECTION 17: BUSINESS FEATURES
  // ===============================

  // Get business catalog
  router.get("/business/catalog/:phone", async (req, res) => {
    const normalizedPhone = normalizePhone(req.params.phone);
    const validation = validateSession(normalizedPhone);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    res.json({
      success: false,
      error: "Business catalog features are limited in Baileys. Use WhatsApp Business API for full support."
    });
  });

  // ===============================
  // SECTION 18: AUTOMATION & AI
  // ===============================

  // AI endpoints are handled in separate routes/ai.js file
  // This section is a placeholder for reference

  // ===============================
  // SECTION 19: OPENAI STATUS
  // ===============================

  // Check OpenAI connection status
  router.get("/openai/status", (req, res) => {
    const isOpenAiConnected = typeof global.openaiClient !== 'undefined' && global.openaiClient !== null;
    const hasApiKey = !!process.env.OPENAI_API_KEY;

    res.json({
      connected: isOpenAiConnected,
      configured: hasApiKey,
      status: isOpenAiConnected ? 'active' : (hasApiKey ? 'error' : 'not_configured'),
      message: isOpenAiConnected
        ? 'OpenAI API is connected and ready'
        : (hasApiKey ? 'OpenAI API key configured but connection failed' : 'OpenAI API key not configured')
    });
  });

  return router;
}

export default createApiRoutes;