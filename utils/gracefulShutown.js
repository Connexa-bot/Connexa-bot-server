// ~/ConnexaBotServer/utils/gracefulShutdown.js
import { getAllSessions, clearSession } from '../helpers/sessionManager.js';

export function setupGracefulShutdown() {
  const cleanup = async () => {
    console.log('\n🧹 Cleaning up active sessions...');
    const phones = getAllSessions();
    for (const phone of phones) {
      await clearSession(phone);
    }
    console.log('✅ All sessions cleaned. Exiting.');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}
