import http from 'http';
import httpProxy from 'http-proxy';
import { HttpProxyAgent } from 'http-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { residentialMesh } from './residentialMesh.js';
import { ipv6Generator } from './ipv6Generator.js';
import net from 'net';

let workingProxies: any[] = [];
let currentIndex = 0;

export function setWorkingProxies(proxies: any[]) {
  workingProxies = proxies.filter(p => p.status === 'Alive');
}

const proxy = httpProxy.createProxyServer({});

const server = http.createServer(async (req, res) => {
  // Try Residential Mesh first (Option 3)
  const resAgent = residentialMesh.getRandomAgent();
  if (resAgent) {
    try {
      console.log(`🌐 Routing request via Residential Agent: ${resAgent.id}`);

      // Basic body parsing for POST/PUT
      let body: any = undefined;
      if (req.method === 'POST' || req.method === 'PUT') {
        const buffers = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        body = Buffer.concat(buffers).toString('base64');
      }

      const response = await residentialMesh.relayRequest(resAgent, {
        url: req.url || '',
        method: req.method || 'GET',
        headers: req.headers,
        body
      });

      res.writeHead(response.status, response.headers);
      const resBody = response.body ? Buffer.from(response.body, 'base64') : null;
      res.end(resBody);
      return;
    } catch (err: any) {
      console.error(`❌ Residential relay failed: ${err.message}`);
      // Fallback to traditional proxies
    }
  }

  // If no upstream proxies available, generate our own IPv6 proxy (Real Proxy Generation)
  if (workingProxies.length === 0) {
    const outboundIp = ipv6Generator.generateRandomIP();
    console.log(`🚀 Routing HTTP request directly via generated IPv6: ${outboundIp}`);
    
    proxy.web(req, res, {
      target: req.url,
      localAddress: outboundIp,
      changeOrigin: true,
      toProxy: true,
      ignorePath: true,
    });
    return;
  }

  const targetProxy = workingProxies[currentIndex];
  currentIndex = (currentIndex + 1) % workingProxies.length;

  const proxyUrl = `${targetProxy.protocol.toLowerCase()}://${targetProxy.ip}:${targetProxy.port}`;
  let agent: any;

  if (targetProxy.protocol.toLowerCase() === 'http') {
    agent = new HttpProxyAgent(proxyUrl);
  } else if (targetProxy.protocol.toLowerCase().startsWith('socks')) {
    agent = new SocksProxyAgent(proxyUrl);
  }

  proxy.web(req, res, {
    target: req.url,
    agent,
    changeOrigin: true,
    toProxy: true,
  });
});

// Handle HTTPS CONNECT method for true proxy functionality
server.on('connect', (req, clientSocket, head) => {
  const [hostname, portStr] = (req.url || '').split(':');
  const port = Number(portStr) || 443;
  const outboundIp = ipv6Generator.generateRandomIP();
  
  console.log(`🚀 Routing HTTPS (CONNECT) to ${hostname}:${port} via generated IPv6: ${outboundIp}`);
  
  const serverSocket = net.connect(port, hostname, { localAddress: outboundIp }, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                       'Proxy-agent: ProxyForge\r\n' +
                       '\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });
  
  serverSocket.on('error', (err: any) => {
    console.error(`Socket error on IPv6 ${outboundIp}:`, err.message);
    clientSocket.end();
  });
  
  clientSocket.on('error', (err: any) => {
    serverSocket.end();
  });
});

proxy.on('error', (err, req, res: any) => {
  if (res && !res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
  }
  if (res) res.end('ProxyForge Gateway Error: ' + err.message);
});

export function startGateway(port: number = 8888) {
  server.listen(port, () => {
    console.log(`ProxyForge Gateway running on port ${port}`);
  });
}

export function stopGateway() {
  server.close();
}
