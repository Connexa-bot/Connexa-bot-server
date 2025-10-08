// ~/ConnexaBotServer/helpers/sessionManager.js
const sessions = new Map();

export function setSession(phone, data) {
  sessions.set(phone, { ...(sessions.get(phone) || {}), ...data });
}

export function getSession(phone) {
  return sessions.get(phone);
}

export async function clearSession(phone) {
  if (sessions.has(phone)) {
    try {
      const session = sessions.get(phone);
      if (session.sock?.end) await session.sock.end();
    } catch (err) {
      console.error(`[SESSION] Error ending session for ${phone}:`, err);
    }
    sessions.delete(phone);
  }
}

export function getAllSessions() {
  return Array.from(sessions.keys());
}
