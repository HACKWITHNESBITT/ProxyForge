import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/v1/proxy/pac
 * 
 * Generates a PAC (Proxy Auto-Configuration) file that phones can use
 * to auto-route traffic through the specified proxy.
 * 
 * Query params:
 *   - host: proxy IP address (required)
 *   - port: proxy port (required)
 *   - protocol: HTTP | SOCKS4 | SOCKS5 (default: HTTP)
 *   - bypass: comma-separated list of hosts to bypass (optional)
 */
router.get('/pac', (req: Request, res: Response) => {
  const host = req.query.host as string;
  const port = req.query.port as string;
  const protocol = ((req.query.protocol as string) || 'http').toUpperCase();
  const bypass = (req.query.bypass as string) || '';

  if (!host || !port) {
    return res.status(400).json({
      error: 'Missing required query parameters: host, port',
    });
  }

  // Build bypass rules
  const bypassHosts = bypass
    ? bypass.split(',').map(h => h.trim()).filter(Boolean)
    : ['localhost', '127.0.0.1', '*.local'];

  const bypassConditions = bypassHosts
    .map(h => {
      if (h.startsWith('*')) {
        return `    if (dnsDomainIs(host, "${h.slice(1)}")) return "DIRECT";`;
      }
      return `    if (host === "${h}") return "DIRECT";`;
    })
    .join('\n');

  // Map protocol to PAC directive
  let proxyDirective: string;
  switch (protocol) {
    case 'SOCKS4':
      proxyDirective = `SOCKS4 ${host}:${port}`;
      break;
    case 'SOCKS5':
    case 'SOCKS':
      proxyDirective = `SOCKS5 ${host}:${port}`;
      break;
    case 'HTTPS':
      proxyDirective = `HTTPS ${host}:${port}`;
      break;
    case 'HTTP':
    default:
      proxyDirective = `PROXY ${host}:${port}`;
      break;
  }

  const pacContent = `// ProxyForge Auto-Configuration Script
// Generated: ${new Date().toISOString()}
// Proxy: ${protocol} ${host}:${port}

function FindProxyForURL(url, host) {
    // Bypass rules
${bypassConditions}

    // Route everything else through the proxy
    return "${proxyDirective}; DIRECT";
}
`;

  res.setHeader('Content-Type', 'application/x-ns-proxy-autoconfig');
  res.setHeader('Content-Disposition', `inline; filename="proxyforge-${host.replace(/\./g, '-')}.pac"`);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.status(200).send(pacContent);
});

/**
 * GET /api/v1/proxy/connect-info
 * 
 * Returns connection instructions and details for a given proxy.
 * Used by the frontend modal to display setup information.
 */
router.get('/connect-info', (req: Request, res: Response) => {
  const host = req.query.host as string;
  const port = req.query.port as string;
  const protocol = ((req.query.protocol as string) || 'http').toUpperCase();

  if (!host || !port) {
    return res.status(400).json({
      error: 'Missing required query parameters: host, port',
    });
  }

  const pacUrl = `${req.protocol}://${req.get('host')}/api/v1/proxy/pac?host=${host}&port=${port}&protocol=${protocol.toLowerCase()}`;

  res.status(200).json({
    proxy: {
      host,
      port,
      protocol,
      url: `${protocol.toLowerCase()}://${host}:${port}`,
    },
    pac: {
      url: pacUrl,
      description: 'Use this URL in your phone\'s Wi-Fi proxy "Auto-Config" setting.',
    },
    instructions: {
      android_manual: [
        'Open Settings → Network & Internet → Wi-Fi',
        'Tap the gear icon next to your connected network',
        'Tap Edit → Advanced options',
        'Set Proxy to Manual',
        `Enter Host: ${host} and Port: ${port}`,
        'Tap Save',
      ],
      android_auto: [
        'Open Settings → Network & Internet → Wi-Fi',
        'Tap the gear icon next to your connected network',
        'Tap Edit → Advanced options',
        'Set Proxy to Auto-Config',
        `Paste PAC URL: ${pacUrl}`,
        'Tap Save',
      ],
      system_wide: [
        'Install Super Proxy or Every Proxy from the Play Store',
        'Open the app and add a new proxy profile',
        `Enter Host: ${host}, Port: ${port}, Protocol: ${protocol}`,
        'Enable the proxy connection',
        'All device traffic will now route through the proxy',
      ],
    },
    recommended_apps: [
      { name: 'Super Proxy', platform: 'Android', features: 'HTTP/SOCKS5, VPN routing, auto-start' },
      { name: 'Every Proxy', platform: 'Android/iOS', features: 'Simple UI, per-app toggle' },
    ],
  });
});

export default router;
