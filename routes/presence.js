import express from "express";
import { sessions } from "../index.js";
import { presenceActions } from "../controllers/presence.js";

const router = express.Router();

router.post("/action", async (req, res) => {
  const { phone, action, chatId, presence, jid } = req.body;
  const session = sessions.get(phone.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    switch (action) {
      case "update":
        await presenceActions.update(session.sock, chatId, presence);
        break;
      case "subscribe":
        await presenceActions.subscribe(session.sock, jid);
        break;
      default:
        return res.status(400).json({ error: "Invalid presence action" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
