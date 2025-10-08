import express from "express";
import { sessions } from "../helpers/whatsapp.js";
import { profileActions } from "../controllers/profile.js";

const router = express.Router();

router.post("/action", async (req, res) => {
  const { phone, action, name, status, imageBuffer, jid } = req.body;
  const session = sessions.get(phone.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    switch (action) {
      case "updateName":
        await profileActions.updateName(session.sock, name);
        break;
      case "updateStatus":
        await profileActions.updateStatus(session.sock, status);
        break;
      case "updatePicture":
        await profileActions.updatePicture(session.sock, jid, imageBuffer);
        break;
      case "removePicture":
        await profileActions.removePicture(session.sock, jid);
        break;
      case "getPicture":
        const url = await profileActions.getPicture(session.sock, jid);
        return res.json({ url });
      default:
        return res.status(400).json({ error: "Invalid profile action" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
