// controllers/status.js
// ===============================
// Status update controllers
// ===============================

import { 
  postTextStatus, 
  postImageStatus, 
  postVideoStatus,
  postAudioStatus 
} from "../helpers/statusActions.js";
import { getClient, getStore } from "../helpers/whatsapp.js";

/**
 * POST /api/status/post
 * Post a status update (text, image, video, or audio)
 */
export const postStatus = async (req, res) => {
  try {
    const { phone, type, content, caption, statusJidList = [], options = {} } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone number is required" });
    }

    if (!type || !['text', 'image', 'video', 'audio'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: "Type is required and must be one of: text, image, video, audio" 
      });
    }

    if (!content) {
      return res.status(400).json({ success: false, error: "Content is required" });
    }

    let result;

    switch (type) {
      case 'text':
        result = await postTextStatus(phone, content, statusJidList, options);
        break;
      
      case 'image':
        result = await postImageStatus(phone, content, caption, statusJidList, options);
        break;
      
      case 'video':
        result = await postVideoStatus(phone, content, caption, statusJidList, options);
        break;
      
      case 'audio':
        result = await postAudioStatus(phone, content, statusJidList, options);
        break;
    }

    res.json({ 
      success: true, 
      data: { 
        messageId: result.key?.id,
        type,
        posted: true 
      } 
    });
  } catch (error) {
    console.error("Error posting status:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/status/contacts/:phone
 * Get list of contacts for status privacy
 */
export const getStatusContacts = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone number is required" });
    }

    const store = getStore(phone);
    if (!store) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    const contacts = store.contacts || {};
    const contactList = Object.keys(contacts)
      .filter(jid => jid.includes('@s.whatsapp.net'))
      .map(jid => ({
        jid,
        name: contacts[jid]?.name || contacts[jid]?.notify || jid.split('@')[0]
      }));

    res.json({ 
      success: true, 
      data: { contacts: contactList } 
    });
  } catch (error) {
    console.error("Error getting status contacts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
