import { Router, Request, Response } from 'express';
import { fetchProxiesFromSources } from '../services/proxyGeneration.js';
import { validateProxy } from '../services/proxyValidator.js';

const router = Router();

router.get('/free', async (req: Request, res: Response) => {
  const protocol = (req.query.protocol as string) || 'http';
  const shouldValidate = req.query.validate === 'true';
  const limit = Number(req.query.limit) || 100;

  if (!['http', 'socks4', 'socks5'].includes(protocol.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid protocol requested. Supported: http, socks4, socks5' });
  }

  try {
    const rawProxies = await fetchProxiesFromSources(protocol.toLowerCase(), limit * 3);
    const shuffled = rawProxies.sort(() => 0.5 - Math.random()).slice(0, limit);

    if (shouldValidate) {
      const validationResults = await Promise.all(
        shuffled.map(async (proxyStr) => {
          const [ip, port] = proxyStr.split(':');
          if (!ip || !port) return null;
          return validateProxy(ip, port, protocol);
        })
      );

      const working = validationResults.filter((p) => p && p.status === 'Alive');

      return res.status(200).json({
        protocol,
        count: working.length,
        proxies: working.map((p) => `${p?.ip}:${p?.port}`),
        validated: true,
        source: 'Aggregated & Validated',
      });
    }

    res.status(200).json({
      protocol,
      count: shuffled.length,
      proxies: shuffled,
      validated: false,
      source: 'Aggregated',
    });
  } catch (error: any) {
    console.error('Error fetching free proxies:', error.message);
    res.status(500).json({ error: 'Failed to retrieve free proxies' });
  }
});

export default router;
