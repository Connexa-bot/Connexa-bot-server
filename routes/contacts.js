import express from "express";
import { sessions } from "../helpers/whatsapp.js";
import { contactActions } from "../controllers/contacts.js";
import * as contactHelpers from "../helpers/contactActions.js";

const router = express.Router();

const normalizePhone = (phone) => phone?.replace(/^\+|\s/g, '');

// Get all contacts
router.get("/:phone", async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    const { fetchContacts } = await import("../helpers/fetchers.js");
    const contacts = await fetchContacts(normalizedPhone);
    res.json({ success: true, contacts, count: contacts.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific contact
router.get("/:phone/:contactId", async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    const result = await contactHelpers.getContact(normalizedPhone, req.params.contactId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get contact profile picture
router.get("/:phone/:contactId/picture", async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    const result = await contactHelpers.getProfilePicture(normalizedPhone, req.params.contactId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get contact status/about
router.get("/:phone/:contactId/status", async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    const result = await contactHelpers.getStatus(normalizedPhone, req.params.contactId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if contact exists
router.post("/check-exists", async (req, res) => {
  const { phone, phoneNumber } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    const result = await contactHelpers.checkIfContactExists(normalizedPhone, phoneNumber);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get business profile
router.get("/:phone/:contactId/business", async (req, res) => {
  const normalizedPhone = normalizePhone(req.params.phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    const result = await contactHelpers.getBusinessProfile(normalizedPhone, req.params.contactId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Contact actions
router.post("/action", async (req, res) => {
  const { phone, action, jid, phoneNumber } = req.body;
  const normalizedPhone = normalizePhone(phone);
  const session = sessions.get(normalizedPhone);
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    switch (action) {
      case "block":
        const blockResult = await contactHelpers.blockContact(normalizedPhone, jid);
        return res.json(blockResult);
      case "unblock":
        const unblockResult = await contactHelpers.unblockContact(normalizedPhone, jid);
        return res.json(unblockResult);
      case "blocked":
        const blocked = await contactHelpers.getBlockedUsers(session.sock);
        return res.json({ success: true, blocked });
      default:
        return res.status(400).json({ error: "Invalid contact action" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;