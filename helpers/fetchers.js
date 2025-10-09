import { sessions } from "./whatsapp.js";

export async function fetchChats(store) {
  if (!store) throw new Error("Store not available");
  
  const chats = store.chats.all();
  return chats.map(chat => ({
    id: chat.id,
    name: chat.name || chat.id.split('@')[0],
    conversationTimestamp: chat.conversationTimestamp || Date.now(),
    unreadCount: chat.unreadCount || 0,
    lastMessage: chat.lastMessage || null,
    isGroup: chat.id.endsWith('@g.us'),
  })).sort((a, b) => b.conversationTimestamp - a.conversationTimestamp);
}

export async function fetchMessages(store, chatId, limit = 50) {
  if (!store) throw new Error("Store not available");
  
  const messages = store.messages[chatId];
  if (!messages) return [];
  
  const msgArray = messages.all();
  return msgArray.slice(-limit).map(msg => ({
    id: msg.key.id,
    chatId: msg.key.remoteJid,
    fromMe: msg.key.fromMe,
    text: msg.message?.conversation || 
          msg.message?.extendedTextMessage?.text || 
          msg.message?.imageMessage?.caption ||
          msg.message?.videoMessage?.caption || '',
    timestamp: msg.messageTimestamp,
    type: Object.keys(msg.message || {})[0] || 'text',
    hasMedia: !!(msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.audioMessage || msg.message?.documentMessage),
  }));
}

export async function fetchContacts(store) {
  if (!store) throw new Error("Store not available");
  
  const contacts = store.contacts;
  if (!contacts) return [];
  
  const contactsObj = contacts;
  return Object.keys(contactsObj).map(jid => {
    const contact = contactsObj[jid];
    return {
      id: jid,
      name: contact.name || contact.notify || contact.verifiedName || jid.split('@')[0],
      number: jid.split('@')[0],
      isBlocked: contact.isBlocked || false,
    };
  }).filter(c => c.id.includes('@s.whatsapp.net'));
}

export async function fetchGroups(store) {
  if (!store) throw new Error("Store not available");
  
  const chats = store.chats.all();
  return chats
    .filter(chat => chat.id.endsWith('@g.us'))
    .map(group => ({
      id: group.id,
      name: group.name || group.id.split('@')[0],
      participantsCount: group.participants?.length || 0,
      subject: group.subject || group.name,
      description: group.desc || '',
      owner: group.owner || null,
    }));
}

export async function fetchProfile(sock, jid) {
  try {
    const status = await sock.fetchStatus(jid);
    let profilePicUrl = null;
    try {
      profilePicUrl = await sock.profilePictureUrl(jid, 'image');
    } catch {}
    
    return {
      jid,
      status: status?.status || '',
      setAt: status?.setAt || null,
      profilePicUrl,
    };
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    return {
      jid,
      status: '',
      setAt: null,
      profilePicUrl: null,
    };
  }
}

export async function fetchCalls(store) {
  if (!store) return [];
  
  const chats = store.chats.all();
  const calls = [];
  
  for (const chat of chats) {
    const messages = store.messages[chat.id];
    if (!messages) continue;
    
    const msgArray = messages.all();
    for (const msg of msgArray) {
      if (msg.message?.call) {
        calls.push({
          id: msg.key.id,
          name: chat.name || chat.id.split('@')[0],
          timestamp: msg.messageTimestamp,
          type: msg.key.fromMe ? 'outgoing' : 'incoming',
          missed: msg.message.call.callType === 'missed',
          video: msg.message.call.isVideo || false,
        });
      }
    }
  }
  
  return calls.sort((a, b) => b.timestamp - a.timestamp);
}

export async function fetchStatusUpdates(store) {
  if (!store) return [];
  
  const statusChat = store.chats.all().find(chat => chat.id === 'status@broadcast');
  if (!statusChat) return [];
  
  const messages = store.messages['status@broadcast'];
  if (!messages) return [];
  
  const msgArray = messages.all();
  return msgArray.map(msg => ({
    id: msg.key.id,
    participant: msg.key.participant || msg.key.remoteJid,
    timestamp: msg.messageTimestamp,
    media: msg.message?.imageMessage || msg.message?.videoMessage || null,
    viewed: false,
  })).sort((a, b) => b.timestamp - a.timestamp);
}
