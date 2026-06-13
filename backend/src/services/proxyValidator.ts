import axios from 'axios';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

export interface ProxyCheckResult {
  ip: string;
  port: string;
  protocol: string;
  latency: number;
  status: 'Alive' | 'Dead';
  country?: string;
  anonymity?: 'Elite' | 'Anonymous' | 'Transparent';
}

export async function validateProxy(ip: string, port: string, protocol: string): Promise<ProxyCheckResult> {
  const start = Date.now();
  const proxyUrl = `${protocol.toLowerCase()}://${ip}:${port}`;
  let agent: any;

  try {
    if (protocol.toLowerCase() === 'http' || protocol.toLowerCase() === 'https') {
      agent = new HttpProxyAgent(proxyUrl);
    } else if (protocol.toLowerCase().startsWith('socks')) {
      agent = new SocksProxyAgent(proxyUrl);
    }

    const response = await axios.get('http://ip-api.com/json', {
      httpAgent: agent,
      httpsAgent: agent,
      timeout: 5000,
    });

    const latency = Date.now() - start;

    return {
      ip,
      port,
      protocol: protocol.toUpperCase(),
      latency,
      status: 'Alive',
      country: response.data.countryCode || 'Unknown',
      anonymity: 'Elite', // Simplification for now
    };
  } catch (error) {
    return {
      ip,
      port,
      protocol: protocol.toUpperCase(),
      latency: -1,
      status: 'Dead',
    };
  }
}
