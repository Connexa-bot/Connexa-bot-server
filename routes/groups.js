import express from "express";
import { sessions } from "../helpers/whatsapp.js";
import * as groupCtrl from "../controllers/groups.js";

const router = express.Router();

// List groups
router.get("/:phone", async (req, res) => {
  const session = sessions.get(req.params.phone.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });
  
  try {
    const groups = await groupCtrl.listGroups(session);
    
    // Add profile pictures to groups
    const groupsWithPics = await Promise.all(
      groups.map(async (group) => {
        try {
          const profilePicUrl = await session.sock.profilePictureUrl(group.id, 'image').catch(() => null);
          return { ...group, profilePicUrl };
        } catch (err) {
          return { ...group, profilePicUrl: null };
        }
      })
    );
    
    res.json({ success: true, groups: groupsWithPics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Group actions (create, add, remove, promote, demote, update, leave, invite)
router.post("/action", async (req, res) => {
  const { phone, action, groupId, name, participants, setting, subject, description, inviteCode } = req.body;
  const session = sessions.get(phone.replace(/^\+|\s/g, ""));
  if (!session?.connected) return res.status(400).json({ error: "Not connected" });

  try {
    switch (action) {
      case "create":
        const group = await groupCtrl.groupActions.create(session.sock, name, participants);
        return res.json({ success: true, group });
      case "add":
        await groupCtrl.groupActions.add(session.sock, groupId, participants);
        break;
      case "remove":
        await groupCtrl.groupActions.remove(session.sock, groupId, participants);
        break;
      case "promote":
        await groupCtrl.groupActions.promote(session.sock, groupId, participants);
        break;
      case "demote":
        await groupCtrl.groupActions.demote(session.sock, groupId, participants);
        break;
      case "updateSubject":
        await groupCtrl.groupActions.updateSubject(session.sock, groupId, subject);
        break;
      case "updateDescription":
        await groupCtrl.groupActions.updateDescription(session.sock, groupId, description);
        break;
      case "updateSettings":
        await groupCtrl.groupActions.updateSettings(session.sock, groupId, setting);
        break;
      case "leave":
        await groupCtrl.groupActions.leave(session.sock, groupId);
        break;
      case "getInviteCode":
        const code = await groupCtrl.groupActions.getInviteCode(session.sock, groupId);
        return res.json({ code });
      case "revokeInviteCode":
        const revoked = await groupCtrl.groupActions.revokeInviteCode(session.sock, groupId);
        return res.json({ revoked });
      case "acceptInvite":
        const result = await groupCtrl.groupActions.acceptInvite(session.sock, inviteCode);
        return res.json({ result });
      case "getMetadata":
        const metadata = await groupCtrl.groupActions.getMetadata(session.sock, groupId);
        return res.json({ metadata });
      default:
        return res.status(400).json({ error: "Invalid group action" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
