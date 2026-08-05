import { Router, Request, Response } from 'express';
import { generateProxies, provisionCloudProxyNode, getStoredProxies } from '../services/proxyGeneration.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { protocol, count, validate, source, region, ip } = req.body;

  if (!protocol || !['http', 'socks4', 'socks5'].includes(protocol.toLowerCase())) {
    return res.status(400).json({ error: 'Valid protocol required: http, socks4, socks5' });
  }

  const proxyCount = Math.min(Number(count) || 50, 500);
  const shouldValidate = validate !== false;

  try {
    if (source === 'cloud') {
      const regionVal = region || 'nyc1';
      const result = await provisionCloudProxyNode(regionVal, protocol.toLowerCase(), ip);

      const proxies: any[] = [];
      if (result.success && result.ip) {
        proxies.push({
          ip: result.ip,
          port: result.port,
          protocol: protocol.toUpperCase(),
          latency: 0,
          country: 'Self-Hosted',
          status: 'Alive',
          source: result.source,
        });
      }

      const storedFreeProxies = await getStoredProxies(protocol.toLowerCase(), 20);
      for (const p of storedFreeProxies) {
        proxies.push({
          ip: p.ip,
          port: p.port,
          protocol: p.protocol,
          latency: p.latency,
          country: p.country || 'Cached',
          status: p.status,
          source: p.source,
        });
      }

      return res.status(200).json({
        protocol,
        count: proxies.length,
        source: result.source || 'Cloud Provisioning',
        result,
        proxies,
      });
    }

    const proxies = await generateProxies(protocol.toLowerCase(), proxyCount, shouldValidate);

    res.status(200).json({
      protocol,
      count: proxies.length,
      validated: shouldValidate,
      source: shouldValidate ? 'Generated & Validated' : 'Generated (Unvalidated)',
      proxies: proxies.map((p) => ({
        ip: p.ip,
        port: p.port,
        protocol: p.protocol,
        latency: p.latency,
        country: p.country,
        status: p.status,
      })),
    });
  } catch (error: any) {
    console.error('Error generating proxies:', error.message);
    res.status(500).json({ error: 'Failed to generate proxies', details: error.message });
  }
});

router.get('/free', async (req: Request, res: Response) => {
  const protocol = (req.query.protocol as string) || 'http';
  const shouldValidate = req.query.validate === 'true';
  const limit = Number(req.query.limit) || 100;

  if (!['http', 'socks4', 'socks5'].includes(protocol.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid protocol. Supported: http, socks4, socks5' });
  }

  try {
    const storedProxies = await getStoredProxies(protocol.toLowerCase(), limit);
    const shuffled = storedProxies.sort(() => 0.5 - Math.random()).slice(0, limit);

    res.status(200).json({
      protocol,
      count: shuffled.length,
      proxies: shuffled.map((p) => `${p.ip}:${p.port}`),
      validated: true,
      source: 'Cached Validated',
    });
  } catch (error: any) {
    console.error('Error fetching free proxies:', error.message);
    res.status(500).json({ error: 'Failed to retrieve free proxies' });
  }
});

router.get('/stored', async (req: Request, res: Response) => {
  const protocol = req.query.protocol as string | undefined;
  const limit = Number(req.query.limit) || 100;

  try {
    const proxies = await getStoredProxies(protocol, limit);
    res.status(200).json({
      count: proxies.length,
      proxies,
    });
  } catch (error: any) {
    console.error('Error fetching stored proxies:', error.message);
    res.status(500).json({ error: 'Failed to fetch stored proxies' });
  }
});

export default router;