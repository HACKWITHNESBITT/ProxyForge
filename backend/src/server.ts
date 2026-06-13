import http from 'http';
import app from './app.js';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { startGateway } from './services/proxyGateway.js';
import { residentialMesh } from './services/residentialMesh.js';

dotenv.config();

const PORT = process.env.PORT || 8000;
const GATEWAY_PORT = Number(process.env.GATEWAY_PORT) || 8888;

const server = http.createServer(app);

// WebSocket setup for live updates
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection established');
  const ip = req.socket.remoteAddress || 'unknown';
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'register_agent') {
        const id = residentialMesh.registerAgent(ws, ip);
        ws.send(JSON.stringify({ type: 'registered', id }));
        return;
      }
    } catch (e) {}
    console.log(`Received message => ${message}`);
  });
  
  ws.send(JSON.stringify({ type: 'connected', message: 'Welcome to ProxyForge Live Updates' }));
});

server.listen(PORT, () => {
  console.log(`🚀 ProxyForge Backend is running on port ${PORT}`);
  console.log(`🔌 WebSocket server is listening on port ${PORT}`);
  
  // Start the proxy gateway
  startGateway(GATEWAY_PORT);
});

export { server, wss };
