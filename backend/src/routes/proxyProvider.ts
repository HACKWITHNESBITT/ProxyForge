import { Router, Request, Response } from 'express';
import { validateProxy } from '../services/proxyValidator.js';

const router = Router();

const SOURCES: Record<string, string[]> = {
  http: [
    'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
    'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
    'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt'
  ],
  socks4: [
    'https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks4&timeout=10000&country=all',
    'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks4.txt',
    'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks4.txt'
  ],
  socks5: [
    'https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks5&timeout=10000&country=all',
    'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt',
    'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt'
  ],
};

router.get('/free', async (req: Request, res: Response) => {
  const protocol = (req.query.protocol as string) || 'http';
  const shouldValidate = req.query.validate === 'true';
  const limit = Number(req.query.limit) || 100;
  
  if (!SOURCES[protocol]) {
    return res.status(400).json({ error: 'Invalid protocol requested. Supported: http, socks4, socks5' });
  }

  try {
    // Fetch from all sources in parallel for the protocol
    const fetchPromises = SOURCES[protocol].map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) return await response.text();
      } catch (e) {
        console.error(`Failed to fetch from ${url}`);
      }
      return '';
    });

    const results = await Promise.all(fetchPromises);
    const combinedText = results.join('\n');
    const allProxies = Array.from(new Set(combinedText.split(/\r?\n/).filter(line => line.trim() !== '')));
    
    // Shuffle and pick limit
    const shuffled = allProxies.sort(() => 0.5 - Math.random()).slice(0, limit);

    if (shouldValidate) {
      // Validate requested batch size
      const validationResults = await Promise.all(
        shuffled.map(async (proxyStr) => {
          const [ip, port] = proxyStr.split(':');
          if (!ip || !port) return null;
          return validateProxy(ip, port, protocol);
        })
      );
      
      const working = validationResults.filter(p => p && p.status === 'Alive');
      
      return res.status(200).json({
        protocol,
        count: working.length,
        proxies: working.map(p => `${p?.ip}:${p?.port}`),
        validated: true,
        source: 'Aggregated & Validated'
      });
    }
    
    res.status(200).json({
      protocol,
      count: shuffled.length,
      proxies: shuffled,
      validated: false,
      source: 'Aggregated'
    });
  } catch (error: any) {
    console.error('Error fetching free proxies:', error.message);
    res.status(500).json({ error: 'Failed to retrieve free proxies' });
  }
});

export default router;
