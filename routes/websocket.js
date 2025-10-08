import { WebSocketServer } from "ws";

export const setupWebSocket = (server, sessions) => {
  const wss = new WebSocketServer({ server });
  let wsClients = [];

  wss.on("connection", (ws) => {
    wsClients.push(ws);
    ws.on("close", () => {
      wsClients = wsClients.filter((c) => c !== ws);
    });
  });

  const broadcast = (event, data) => {
    wsClients.forEach((ws) => {
      if (ws.readyState === 1) ws.send(JSON.stringify({ event, data }));
    });
  };

  // Attach broadcast to each session for updates
  sessions.forEach((session) => {
    session.broadcast = broadcast;
  });

  return { wss, broadcast };
};
