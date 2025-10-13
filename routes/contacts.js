import express from "express";
import { sessions } from "../helpers/whatsapp.js";
import { contactActions } from "../controllers/contacts.js";

const router = express.Router();

router.post("/action", async (req, res) => {
  const { phone, action, jid } = req.body;
  const session = sessions.get(phone.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    switch (action) {
      case "get":
        const { fetchContacts } = await import("../helpers/fetchers.js");
        const contacts = await fetchContacts(session.store, session.sock);
        return res.json({ success: true, contacts });
      case "block":
        await contactActions.block(session.sock, jid);
        break;
      case "unblock":
        await contactActions.unblock(session.sock, jid);
        break;
      case "blocked":
        const blocked = await contactActions.blocked(session.sock);
        return res.json({ success: true, blocked });
      default:
        return res.status(400).json({ error: "Invalid contact action" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all contacts
router.get("/:phone", async (req, res) => {
  const normalizedPhone = req.params.phone.replace(/^\+|\s/g, "");
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

export default router;