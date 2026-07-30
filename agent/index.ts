import WebSocket from 'ws';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SERVER_URL = process.env.SERVER_URL || 'ws://localhost:8000';
console.log(`🏠 Starting ProxyForge Residential Agent...`);
console.log(`🔌 Connecting to ${SERVER_URL}`);

function connect() {
  const ws = new WebSocket(SERVER_URL);

  ws.on('open', () => {
    console.log('✅ Connected to ProxyForge Backend');
    ws.send(JSON.stringify({ type: 'register_agent' }));
  });

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'registered') {
        console.log(`🆔 Agent registered with ID: ${message.id}`);
      }

      if (message.type === 'proxy_request') {
        const { requestId, url, method, headers, body } = message;
        console.log(`🚀 Handling request: ${method} ${url}`);

        try {
          const axiosConfig: any = {
            url,
            method,
            headers: { ...headers },
            responseType: 'arraybuffer',
            validateStatus: () => true, // Don't throw on 4xx/5xx
          };

          // Remove host header to avoid issues
          delete axiosConfig.headers['host'];
          delete axiosConfig.headers['connection'];

          if (body) {
            axiosConfig.data = Buffer.from(body, 'base64');
          }

          const response = await axios(axiosConfig);

          ws.send(JSON.stringify({
            type: 'proxy_response',
            requestId,
            status: response.status,
            headers: response.headers,
            body: Buffer.from(response.data).toString('base64')
          }));
          
          console.log(`✅ Request completed: ${response.status}`);
        } catch (error: any) {
          console.error(`❌ Request failed: ${error.message}`);
          ws.send(JSON.stringify({
            type: 'proxy_response',
            requestId,
            status: 502,
            headers: {},
            body: Buffer.from(`Agent Error: ${error.message}`).toString('base64')
          }));
        }
      }
    } catch (e) {
      console.error('Failed to process message', e);
    }
  });

  ws.on('close', () => {
    console.log('❌ Disconnected from server. Reconnecting in 5s...');
    setTimeout(connect, 5000);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });
}

connect();
