import { Router, Request, Response } from 'express';
import { validateProxy } from '../services/proxyValidator.js';
import { setWorkingProxies } from '../services/proxyGateway.js';

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
      // Add a small jitter to avoid self-DDoS on local network
      await new Promise(r => setTimeout(r, Math.random() * 500));
      return validateProxy(ip, port, protocol || 'http');
    })
  );

  const validResults = results.filter(Boolean);
  
  // Update the gateway with new working proxies
  setWorkingProxies(validResults);

  res.status(200).json({
    results: validResults,
  });
});

export default router;
