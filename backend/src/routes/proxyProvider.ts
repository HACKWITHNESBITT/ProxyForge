import { Router, Request, Response } from 'express';
import { getStoredProxies } from '../services/proxyGeneration.js';

const router = Router();

router.get('/free', async (req: Request, res: Response) => {
  const protocol = (req.query.protocol as string) || 'http';
  const limit = Number(req.query.limit) || 100;

  if (!['http', 'socks4', 'socks5'].includes(protocol.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid protocol requested. Supported: http, socks4, socks5' });
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

export default router;
