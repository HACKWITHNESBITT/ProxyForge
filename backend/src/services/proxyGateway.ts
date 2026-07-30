import http from 'http';
import httpProxy from 'http-proxy';
import { HttpProxyAgent } from 'http-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { residentialMesh } from './residentialMesh.js';

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

  if (workingProxies.length === 0) {
    res.statusCode = 502;
    res.end('No working proxies available in ProxyForge Gateway');
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

proxy.on('error', (err, req, res: any) => {
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
  }
  res.end('ProxyForge Gateway Error: ' + err.message);
});

export function startGateway(port: number = 8888) {
  server.listen(port, () => {
    console.log(`ProxyForge Gateway running on port ${port}`);
  });
}

export function stopGateway() {
  server.close();
}
