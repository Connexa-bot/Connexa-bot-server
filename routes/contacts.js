import express from "express";
import { sessions } from "../index.js";
import { contactActions } from "../controllers/contacts.js";

const router = express.Router();

router.post("/action", async (req, res) => {
  const { phone, action, jid } = req.body;
  const session = sessions.get(phone.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    switch (action) {
      case "get":
        const contacts = await contactActions.get(session.store);
        return res.json({ contacts });
      case "block":
        await contactActions.block(session.sock, jid);
        break;
      case "unblock":
        await contactActions.unblock(session.sock, jid);
        break;
      case "blocked":
        const blocked = await contactActions.blocked(session.sock);
        return res.json({ blocked });
      default:
        return res.status(400).json({ error: "Invalid contact action" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
