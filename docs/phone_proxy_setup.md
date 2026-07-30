# Phone Proxy Setup Guide

## Overview
ProxyForge makes it easy to connect a proxy to your Android phone. After validating proxies in the dashboard, simply click the **"Connect"** button next to any alive proxy — a setup modal will guide you through three connection methods.

---

## Method 1: QR Code (Fastest)
1. In the ProxyForge dashboard, validate your proxies.
2. Click the **📱 Connect** button on any alive proxy.
3. A modal appears with a **QR code**. Open your phone camera or a proxy app (e.g., **Super Proxy**, **Every Proxy**) and scan the QR code.
4. The app will auto-import the proxy settings — just tap **Connect**.

> **Best for:** Quick one-time setup via a third-party proxy app.

---

## Method 2: Auto-Config (PAC File)
The dashboard generates a PAC (Proxy Auto-Configuration) file for each proxy. This is the most "set-and-forget" approach.

1. Click **📱 Connect** → go to the **Auto Config** tab.
2. Either:
   - **Copy the PAC URL** and paste it into your phone's Wi-Fi proxy settings (choose "Auto-Config" instead of "Manual").
   - **Download the PAC file** and host it on your own server.
3. Your phone will automatically route traffic through the configured proxy.

### PAC URL Example
```
http://your-server:8000/api/v1/proxy/pac?host=192.168.1.1&port=3128&protocol=http
```

### Setting PAC on Android
1. Open **Settings** → **Network & Internet** → **Wi-Fi**.
2. Tap the gear icon next to your connected network.
3. Tap **Edit** → expand **Advanced options**.
4. Set **Proxy** to **Auto-Config** (or "Proxy Auto-Config").
5. Paste the PAC URL.
6. Tap **Save**.

> **Best for:** Users who want automatic proxy routing without a third-party app.

---

## Method 3: Manual Configuration
1. Click **📱 Connect** → go to the **Manual** tab.
2. Follow the step-by-step instructions shown in the modal:
   - Open **Settings** → **Network & Internet** → **Wi-Fi**
   - Tap the gear icon next to your connected Wi-Fi network
   - Tap **Edit** → **Advanced options**
   - Set **Proxy** to **Manual**
   - Enter the **Host** (IP address) and **Port** shown in the modal
   - Enter **Username** and **Password** if prompted
   - Tap **Save**
3. Use the **Copy** buttons in the modal to quickly copy the host and port.

> **Note:** Manual Wi-Fi proxy settings only affect browser traffic. Most mobile apps bypass this setting.

---

## System-Wide Proxy (All Apps)
To route **all** app traffic (not just browser) through the proxy, use a third-party VPN-based proxy app:

| App | Features | Platform |
|-----|----------|----------|
| **Super Proxy** | HTTP/SOCKS5 with VPN routing, auto-start on boot | Android |
| **Every Proxy** | Simple UI, per-app toggle, DNS-over-HTTPS | Android/iOS |

These apps create a local VPN connection that forces all device traffic through the configured proxy. You can import settings via QR code from the ProxyForge dashboard.

---

## Verifying the Connection
- Open a browser and visit **https://www.whatismyip.com** — the displayed IP should match the proxy's IP.
- For deeper verification, install a terminal app (e.g., **Termux**) and run:
  ```bash
  curl -x http://<proxy-ip>:<port> http://ifconfig.me
  ```

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Cannot connect | Firewall blocking proxy port | Ensure the port is open and accessible |
| Authentication failed | Wrong username/password | Re-enter credentials from the dashboard |
| Only browser works | Using native Wi-Fi proxy | Switch to Super Proxy / Every Proxy for system-wide routing |
| QR code not scanning | Low screen brightness | Increase brightness, ensure QR is fully visible |

---

## Backend API Reference

### `GET /api/v1/proxy/pac`
Generates a PAC auto-configuration file.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `host` | string | ✅ | Proxy IP address |
| `port` | string | ✅ | Proxy port |
| `protocol` | string | ❌ | `http` (default), `socks4`, `socks5` |
| `bypass` | string | ❌ | Comma-separated hosts to bypass |

### `GET /api/v1/proxy/connect-info`
Returns structured connection instructions and details.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `host` | string | ✅ | Proxy IP address |
| `port` | string | ✅ | Proxy port |
| `protocol` | string | ❌ | `http` (default), `socks4`, `socks5` |

---
*Last updated: 2026-05-22*
