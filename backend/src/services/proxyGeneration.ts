import axios from 'axios';
import { query } from '../config/db.js';
import dotenv from 'dotenv';
import { validateProxy } from './proxyValidator.js';

dotenv.config();

const SOURCES: Record<string, string[]> = {
  http: [
    'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
    'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
    'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt',
  ],
  socks4: [
    'https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks4&timeout=10000&country=all',
    'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks4.txt',
    'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks4.txt',
  ],
  socks5: [
    'https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks5&timeout=10000&country=all',
    'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt',
    'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt',
  ],
};

export interface GeneratedProxy {
  ip: string;
  port: string;
  protocol: string;
  status: 'Alive' | 'Dead';
  latency: number;
  country?: string;
  anonymity?: string;
  source: string;
}

export async function fetchProxiesFromSources(
  protocol: string,
  limit: number = 200,
  validate: boolean = true
): Promise<GeneratedProxy[]> {
  if (!SOURCES[protocol]) {
    throw new Error(`Invalid protocol: ${protocol}. Supported: http, socks4, socks5`);
  }

  const fetchPromises = SOURCES[protocol].map(async (url) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) return await response.text();
    } catch (e) {
      console.error(`Failed to fetch from ${url}:`, e);
    }
    return '';
  });

  const results = await Promise.all(fetchPromises);
  const combinedText = results.join('\n');
  const allProxies = Array.from(
    new Set(combinedText.split(/\r?\n/).filter((line) => line.trim() !== ''))
  );

  const candidates = allProxies.slice(0, validate ? limit * 5 : limit);

  if (!validate) {
    return candidates.map((proxyStr) => {
      const [ip, port] = proxyStr.split(':');
      return {
        ip: ip || '',
        port: port || '',
        protocol: protocol.toUpperCase(),
        status: 'Alive' as const,
        latency: 0,
        source: 'Unvalidated Fetch',
      };
    });
  }

  const batchSize = 250;
  const validProxies: GeneratedProxy[] = [];

  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    const validationResults = await Promise.all(
      batch.map(async (proxyStr) => {
        const [ip, port] = proxyStr.split(':');
        if (!ip || !port) return null;
        const result = await validateProxy(ip, port, protocol);
        return {
          ip: result.ip,
          port: result.port,
          protocol: result.protocol,
          status: result.status,
          latency: result.latency,
          country: result.country || undefined,
          anonymity: result.anonymity || undefined,
          source: 'Validated Fetch',
        } as GeneratedProxy;
      })
    );

    const batchValid = validationResults.filter(
      (p): p is GeneratedProxy => p !== null && p.status === 'Alive'
    );
    validProxies.push(...batchValid);

    if (validProxies.length >= limit) break;
  }

  await storeProxies(validProxies);

  return validProxies.slice(0, limit);
}

export async function generateProxies(
  protocol: string,
  count: number = 50,
  validate: boolean = true
): Promise<GeneratedProxy[]> {
  const rawProxies = await fetchProxiesFromSources(protocol, count, validate);

  const shuffled = rawProxies.sort(() => 0.5 - Math.random());
  const candidates = shuffled.slice(0, count);

  if (!validate) {
    return candidates.map((p) => ({
      ip: p.ip,
      port: p.port,
      protocol: p.protocol,
      status: 'Alive' as const,
      latency: 0,
      source: 'Unvalidated Fetch',
    }));
  }

  await storeProxies(candidates);

  return candidates;
}

async function ensureProxiesTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS proxies (
        id SERIAL PRIMARY KEY,
        ip VARCHAR(45) NOT NULL,
        port VARCHAR(10) NOT NULL,
        protocol VARCHAR(10) NOT NULL,
        status VARCHAR(10) NOT NULL DEFAULT 'Alive',
        latency INTEGER DEFAULT -1,
        country VARCHAR(10),
        anonymity VARCHAR(20),
        source VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(ip, port)
      )
    `);
    console.log('✅ Proxies table ensured');
  } catch (err) {
    console.error('Failed to ensure proxies table:', err);
  }
}

export async function storeProxies(proxies: GeneratedProxy[]): Promise<void> {
  try {
    await ensureProxiesTable();
    for (const proxy of proxies) {
      await query(
        `INSERT INTO proxies (ip, port, protocol, status, latency, country, anonymity, source, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (ip, port) DO UPDATE SET
           status = EXCLUDED.status,
           latency = EXCLUDED.latency,
           country = EXCLUDED.country,
           source = EXCLUDED.source,
           updated_at = NOW()`,
        [
          proxy.ip,
          proxy.port,
          proxy.protocol,
          proxy.status,
          proxy.latency,
          proxy.country || null,
          proxy.anonymity || null,
          proxy.source,
        ]
      );
    }
    console.log(`💾 Stored ${proxies.length} proxies in database`);
  } catch (err) {
    console.error('Failed to store proxies:', err);
  }
}

export async function getStoredProxies(
  protocol?: string,
  limit: number = 100
): Promise<GeneratedProxy[]> {
  try {
    await ensureProxiesTable();
    let queryText = 'SELECT ip, port, protocol, status, latency, country, anonymity, source FROM proxies WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (protocol) {
      queryText += ` AND protocol = $${paramIndex++}`;
      params.push(protocol.toUpperCase());
    }

    queryText += ` ORDER BY latency ASC NULLS LAST LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await query(queryText, params);
    return result.rows.map((row: any) => ({
      ip: row.ip,
      port: row.port,
      protocol: row.protocol,
      status: row.status,
      latency: row.latency,
      country: row.country,
      anonymity: row.anonymity,
      source: row.source,
    }));
  } catch (err) {
    console.error('Failed to fetch stored proxies:', err);
    return [];
  }
}

export async function provisionCloudProxyNode(
  region: string = 'nyc1',
  protocol: string = 'socks5',
  userIp?: string
): Promise<{ success: boolean; ip?: string; port?: string; message: string; source: string }> {
  const apiKey = process.env.DIGITALOCEAN_API_KEY;

  const proxyPort = protocol === 'socks5' ? '1080' : protocol === 'socks4' ? '1080' : '8080';
  const httpPort = protocol === 'http' ? '8080' : '8888';

  if (!apiKey) {
    if (userIp) {
      return {
        success: true,
        ip: userIp,
        port: proxyPort,
        message: `Using your existing IP (${userIp}) as a self-hosted proxy node on port ${proxyPort}.`,
        source: 'Self-Hosted (User IP)',
      };
    }
    return {
      success: false,
      message: 'DIGITALOCEAN_API_KEY not configured and no IP provided. Cannot provision cloud nodes.',
      source: 'None',
    };
  }

  const setupScript = `#!/bin/bash
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y curl ufw

cd /tmp
curl -sL https://github.com/3proxy/3proxy/archive/refs/tags/v0.9.3.tar.gz | tar xz
cd 3proxy-0.9.3
make -j$(nproc) && make install

mkdir -p /etc/3proxy
cat > /etc/3proxy/3proxy.cfg << 'PROXYEOF'
daemon
nscache 65536
nserver 8.8.8.8
nserver 8.8.4.4
nscache 65536
timeouts 1 5 30 60 180 1800 15 60
auth none
socks -p${proxyPort}
http -p${httpPort}
flush
PROXYEOF

ufw allow ${proxyPort}/tcp
ufw allow ${httpPort}/tcp
ufw --force enable

service 3proxy start

echo "Proxy server started on port ${proxyPort}"
`;

  try {
    const response = await axios.post(
      'https://api.digitalocean.com/v2/droplets',
      {
        name: `proxyforge-node-${Date.now()}`,
        region,
        size: 's-1vcpu-512mb-10gb',
        image: 'ubuntu-22-04-x64',
        ssh_keys: [],
        user_data: Buffer.from(setupScript).toString('base64'),
        tags: ['proxyforge-node', 'auto-provisioned'],
        vpc_uuid: '',
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const droplet = response.data.droplet;
    return {
      success: true,
      ip: droplet.networks.v4?.[0]?.ip_address || '',
      port: proxyPort,
      message: `Droplet ${droplet.id} created in ${droplet.region.slug}. IP will be available once provisioning completes.`,
      source: 'DigitalOcean Cloud',
    };
  } catch (err: any) {
    if (userIp) {
      return {
        success: true,
        ip: userIp,
        port: proxyPort,
        message: `Cloud provisioning failed (${err.message}). Falling back to your existing IP (${userIp}) as self-hosted proxy on port ${proxyPort}.`,
        source: 'Self-Hosted (Fallback)',
      };
    }
    return {
      success: false,
      message: `Cloud provisioning failed: ${err.message}`,
      source: 'None',
    };
  }
}