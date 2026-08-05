import { Router, Request, Response } from 'express';
import { validateProxy } from '../services/proxyValidator.js';
import { setWorkingProxies } from '../services/proxyGateway.js';
import { storeProxies } from '../services/proxyGeneration.js';

const router = Router();

router.post('/validate', async (req: Request, res: Response) => {
  const { proxies, protocol } = req.body;

  if (!Array.isArray(proxies)) {
    return res.status(400).json({ error: 'Proxies must be an array of strings (ip:port)' });
  }

  const results = await Promise.all(
    proxies.slice(0, 200).map(async (proxyStr) => {
      const [ip, port] = proxyStr.split(':');
      if (!ip || !port) return null;
      await new Promise(r => setTimeout(r, Math.random() * 500));
      return validateProxy(ip, port, protocol || 'http');
    })
  );

  const validResults = results.filter((p): p is NonNullable<typeof p> => p !== null && p.status === 'Alive');

  setWorkingProxies(validResults);

  await storeProxies(
    validResults.map((p) => ({
      ip: p.ip,
      port: p.port,
      protocol: p.protocol,
      status: p.status,
      latency: p.latency,
      country: p.country || undefined,
      anonymity: p.anonymity || undefined,
      source: 'Validated via API',
    }))
  );

  res.status(200).json({
    results: validResults,
  });
});

export default router;
