// ===============================
// 📚 ConnexaBot API Documentation
// ===============================
// Complete list of all available API endpoints with descriptions and usage examples

export const API_ENDPOINTS = {
  
  // ============= CONNECTION & SESSION =============
  
  // Base API check
  GET_API_STATUS: {
    method: "GET",
    path: "/api",
    description: "Check if the API is running",
    request: {},
    response: "🚀 WhatsApp Bot Backend running..."
  },

  // Connect WhatsApp session (generates QR code)
  CONNECT_WHATSAPP: {
    method: "POST",
    path: "/api/connect",
    description: "Initiate WhatsApp connection and generate QR code or link code for authentication",
    request: {
      phone: "1234567890" // Phone number without + or spaces
    },
    response: {
      qrCode: "base64_encoded_qr_code_string",
      linkCode: "XXXX-XXXX-XXXX",
      message: "Session initiated",
      connected: false
    }
  },

  // Check connection status
  GET_STATUS: {
    method: "GET",
    path: "/api/status/:phone",
    description: "Check WhatsApp connection status for a phone number",
    request: {},
    response: {
      connected: true,
      qrCode: null,
      linkCode: null,
      error: null
    }
  },

  // Logout/disconnect WhatsApp
  LOGOUT_WHATSAPP: {
    method: "POST",
    path: "/api/logout",
    description: "Logout and clear WhatsApp session",
    request: {
      phone: "1234567890"
    },
    response: {
      message: "Session cleared. Please reconnect."
    }
  },

  // ============= CHATS =============

  // Get all chats
  GET_CHATS: {
    method: "GET",
    path: "/api/chats/:phone",
    description: "Get list of all chats (individual and groups) for a phone number",
    request: {},
    response: {
      chats: [
        {
          id: "1234567890@s.whatsapp.net",
          name: "Contact Name",
          unreadCount: 2,
          lastMessage: {}
        }
      ]
    }
  },

  // ============= CONTACTS =============

  // Contact actions
  CONTACT_ACTION: {
    method: "POST",
    path: "/api/contacts/action",
    description: "Perform contact-related actions",
    actions: {
      get: {
        description: "Get all contacts",
        request: { phone: "1234567890", action: "get" },
        response: { contacts: [] }
      },
      block: {
        description: "Block a contact",
        request: { 
          phone: "1234567890", 
          action: "block",
          jid: "9876543210@s.whatsapp.net"
        },
        response: { success: true }
      },
      unblock: {
        description: "Unblock a contact",
        request: {
          phone: "1234567890",
          action: "unblock",
          jid: "9876543210@s.whatsapp.net"
        },
        response: { success: true }
      },
      blocked: {
        description: "Get list of blocked contacts",
        request: { phone: "1234567890", action: "blocked" },
        response: { blocked: [] }
      }
    }
  },

  // ============= GROUPS =============

  // List groups
  GET_GROUPS: {
    method: "GET",
    path: "/api/groups/:phone",
    description: "Get all groups for a phone number",
    request: {},
    response: {
      groups: [
        {
          id: "123456789@g.us",
          subject: "Group Name",
          participants: []
        }
      ]
    }
  },

  // Group actions
  GROUP_ACTION: {
    method: "POST",
    path: "/api/groups/action",
    description: "Perform group-related actions",
    actions: {
      create: {
        description: "Create a new group",
        request: {
          phone: "1234567890",
          action: "create",
          name: "My Group",
          participants: ["9876543210@s.whatsapp.net", "5555555555@s.whatsapp.net"]
        },
        response: { success: true, group: {} }
      },
      add: {
        description: "Add participants to group",
        request: {
          phone: "1234567890",
          action: "add",
          groupId: "123456789@g.us",
          participants: ["9876543210@s.whatsapp.net"]
        },
        response: { success: true }
      },
      remove: {
        description: "Remove participants from group",
        request: {
          phone: "1234567890",
          action: "remove",
          groupId: "123456789@g.us",
          participants: ["9876543210@s.whatsapp.net"]
        },
        response: { success: true }
      },
      promote: {
        description: "Promote participants to admin",
        request: {
          phone: "1234567890",
          action: "promote",
          groupId: "123456789@g.us",
          participants: ["9876543210@s.whatsapp.net"]
        },
        response: { success: true }
      },
      demote: {
        description: "Demote admins to regular participants",
        request: {
          phone: "1234567890",
          action: "demote",
          groupId: "123456789@g.us",
          participants: ["9876543210@s.whatsapp.net"]
        },
        response: { success: true }
      },
      updateSubject: {
        description: "Update group name/subject",
        request: {
          phone: "1234567890",
          action: "updateSubject",
          groupId: "123456789@g.us",
          subject: "New Group Name"
        },
        response: { success: true }
      },
      updateDescription: {
        description: "Update group description",
        request: {
          phone: "1234567890",
          action: "updateDescription",
          groupId: "123456789@g.us",
          description: "New group description"
        },
        response: { success: true }
      },
      updateSettings: {
        description: "Update group settings (announcement mode, etc)",
        request: {
          phone: "1234567890",
          action: "updateSettings",
          groupId: "123456789@g.us",
          setting: "announcement" // or "not_announcement"
        },
        response: { success: true }
      },
      leave: {
        description: "Leave a group",
        request: {
          phone: "1234567890",
          action: "leave",
          groupId: "123456789@g.us"
        },
        response: { success: true }
      },
      getInviteCode: {
        description: "Get group invite code",
        request: {
          phone: "1234567890",
          action: "getInviteCode",
          groupId: "123456789@g.us"
        },
        response: { code: "INVITE_CODE" }
      },
      revokeInviteCode: {
        description: "Revoke and generate new invite code",
        request: {
          phone: "1234567890",
          action: "revokeInviteCode",
          groupId: "123456789@g.us"
        },
        response: { revoked: true }
      },
      acceptInvite: {
        description: "Accept group invite using invite code",
        request: {
          phone: "1234567890",
          action: "acceptInvite",
          inviteCode: "INVITE_CODE"
        },
        response: { result: {} }
      },
      getMetadata: {
        description: "Get group metadata/info",
        request: {
          phone: "1234567890",
          action: "getMetadata",
          groupId: "123456789@g.us"
        },
        response: { metadata: {} }
      }
    }
  },

  // ============= MESSAGES =============

  // Send text message (TO BE IMPLEMENTED)
  SEND_MESSAGE: {
    method: "POST",
    path: "/api/messages/send",
    description: "Send a text message to a chat or group",
    request: {
      phone: "1234567890",
      to: "9876543210@s.whatsapp.net", // or groupId@g.us
      text: "Hello, this is a message!"
    },
    response: {
      success: true,
      messageId: "MESSAGE_ID"
    }
  },

  // Download media from message
  DOWNLOAD_MEDIA: {
    method: "POST",
    path: "/api/messages/download",
    description: "Download media (image, video, audio, document) from a message",
    request: {
      phone: "1234567890",
      chatId: "9876543210@s.whatsapp.net",
      msgId: "MESSAGE_ID",
      type: "image" // or "video", "audio", "document"
    },
    response: {
      filePath: "/media/phone/filename.ext"
    }
  },

  // Message actions
  MESSAGE_ACTION: {
    method: "POST",
    path: "/api/messages/action",
    description: "Perform message-related actions",
    actions: {
      delete: {
        description: "Delete a message",
        request: {
          phone: "1234567890",
          action: "delete",
          chatId: "9876543210@s.whatsapp.net",
          messageKey: { remoteJid: "...", id: "...", fromMe: true }
        },
        response: { success: true }
      },
      forward: {
        description: "Forward a message",
        request: {
          phone: "1234567890",
          action: "forward",
          to: "5555555555@s.whatsapp.net",
          messageKey: { remoteJid: "...", id: "...", fromMe: false }
        },
        response: { success: true }
      },
      star: {
        description: "Star/unstar a message",
        request: {
          phone: "1234567890",
          action: "star",
          chatId: "9876543210@s.whatsapp.net",
          messageId: "MESSAGE_ID"
        },
        response: { success: true }
      },
      react: {
        description: "React to a message with emoji",
        request: {
          phone: "1234567890",
          action: "react",
          chatId: "9876543210@s.whatsapp.net",
          messageKey: { remoteJid: "...", id: "...", fromMe: false },
          emoji: "👍"
        },
        response: { success: true }
      },
      edit: {
        description: "Edit a sent message",
        request: {
          phone: "1234567890",
          action: "edit",
          chatId: "9876543210@s.whatsapp.net",
          messageKey: { remoteJid: "...", id: "...", fromMe: true },
          newText: "Edited message text"
        },
        response: { success: true }
      }
    }
  },

  // ============= PRESENCE =============

  // Presence actions
  PRESENCE_ACTION: {
    method: "POST",
    path: "/api/presence/action",
    description: "Manage presence (typing, recording, online/offline)",
    actions: {
      update: {
        description: "Update presence in a chat",
        request: {
          phone: "1234567890",
          action: "update",
          chatId: "9876543210@s.whatsapp.net",
          presence: "composing" // or "recording", "paused", "available", "unavailable"
        },
        response: { success: true }
      },
      subscribe: {
        description: "Subscribe to presence updates of a contact",
        request: {
          phone: "1234567890",
          action: "subscribe",
          jid: "9876543210@s.whatsapp.net"
        },
        response: { success: true }
      }
    }
  },

  // ============= PROFILE =============

  // Profile actions
  PROFILE_ACTION: {
    method: "POST",
    path: "/api/profile/action",
    description: "Manage WhatsApp profile settings",
    actions: {
      updateName: {
        description: "Update profile name",
        request: {
          phone: "1234567890",
          action: "updateName",
          name: "New Display Name"
        },
        response: { success: true }
      },
      updateStatus: {
        description: "Update status/about",
        request: {
          phone: "1234567890",
          action: "updateStatus",
          status: "Hey there! I'm using WhatsApp"
        },
        response: { success: true }
      },
      updatePicture: {
        description: "Update profile picture",
        request: {
          phone: "1234567890",
          action: "updatePicture",
          jid: "1234567890@s.whatsapp.net",
          imageBuffer: "base64_encoded_image"
        },
        response: { success: true }
      },
      removePicture: {
        description: "Remove profile picture",
        request: {
          phone: "1234567890",
          action: "removePicture",
          jid: "1234567890@s.whatsapp.net"
        },
        response: { success: true }
      },
      getPicture: {
        description: "Get profile picture URL",
        request: {
          phone: "1234567890",
          action: "getPicture",
          jid: "9876543210@s.whatsapp.net"
        },
        response: { url: "https://..." }
      }
    }
  }
};

// ============= USAGE NOTES =============

/*
Phone Number Format:
- Use numbers without + or spaces: "1234567890"
- The API normalizes it internally

JID (WhatsApp ID) Format:
- Individual chat: "1234567890@s.whatsapp.net"
- Group chat: "123456789@g.us"

Connection Flow:
1. POST /api/connect with phone number
2. Get QR code or link code in response
3. Scan QR code or use link code in WhatsApp app
4. Check /api/status/:phone to verify connection

Message Key Format:
{
  remoteJid: "9876543210@s.whatsapp.net",
  id: "MESSAGE_ID",
  fromMe: true // or false
}
*/

// Export for use in other files
export default API_ENDPOINTS;
