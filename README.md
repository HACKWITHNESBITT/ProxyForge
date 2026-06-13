# 🛡️ ProxyForge: Enterprise-Grade Proxy Infrastructure

ProxyForge is a high-performance, privacy-focused proxy management and validation platform. It allows users to build, manage, and scale a globally distributed proxy network with real-time monitoring and automated edge provisioning.

---

## 🌟 Key Features

### 1. 🔍 High-Speed Proxy Validator
*   **Bulk Validation:** Check thousands of HTTP, HTTPS, and SOCKS5 proxies in seconds.
*   **Deep Intelligence:** Detect latency (ms), country/location, and anonymity levels (Elite, Anonymous, Transparent).
*   **Real-time Streaming:** Powered by WebSockets to show live validation progress.

### 2. ⚙️ Managed API Engine
*   **Single Entry Point:** Rotate thousands of proxies through a single Gateway endpoint.
*   **API Key Management:** Scalable authentication for production environments.
*   **Quick Integration:** Built-in code generators for cURL, Node.js, and Python.

### 3. 🌐 Global Network Monitoring
*   **Real-time Mesh Visualizer:** Interactive dashboard showing global traffic and node health.
*   **Throughput Tracking:** Monitor GB/s throughput and active tunnel counts across your mesh.
*   **Edge Node Status:** Detailed metrics for every region (NA, EU, AS, UK).

### 4. 🚀 Automated Node Provisioning
*   **One-Click Deployment:** Turn any clean Ubuntu/Debian VPS into a ProxyForge edge node.
*   **SSH Integration:** Automated OS hardening, TCP stack optimization, and engine installation.
*   **Encrypted Tunneling:** Built-in support for secure WireGuard tunnels.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript (ESM), WebSockets |
| **Storage** | PostgreSQL (Relational Data), Redis (Queueing & Caching) |
| **DevOps** | Docker, Docker Compose, Multi-stage Builds, Standalone Next.js |

---

## 🌐 Real Proxy Gateway (New!)

ProxyForge now includes a **Rotating Proxy Gateway**. Instead of manually configuring individual free proxies (which often die), you can connect your devices to a single stable endpoint that automatically rotates through working proxies.

### Gateway Connection Details
*   **Host:** `YOUR_LOCAL_IP` (e.g., `192.168.1.197`)
*   **Port:** `8888`
*   **Protocol:** HTTP

### 📱 Mobile Setup

#### **Android / iOS**
1.  Go to **Wi-Fi Settings** on your device.
2.  Select your network and find **Proxy Settings**.
3.  Set to **Manual**.
4.  Enter your computer's IP address and port `8888`.
5.  Save and browse!

---

## 🚀 Getting Started

### Prerequisites
*   [Docker](https://docs.docker.com/get-docker/)
*   [Docker Compose](https://docs.docker.com/compose/install/)

### Installation & Launch

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/HACKWITHNESBITT/ProxyForge.git
    cd ProxyForge
    ```

2.  **Launch the infrastructure:**
    ```bash
    # This builds optimized production images and starts all services
    docker compose up -d --build
    ```

3.  **Access the Dashboard:**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```text
ProxyForge/
├── frontend/                 # Next.js 15 Standalone Frontend
│   ├── src/app/              # Multi-page dashboard architecture
│   ├── src/components/       # Premium UI components (Glassmorphism)
│   └── Dockerfile            # Optimized 3-stage build (~100MB image)
├── backend/                  # Node.js + Express API (ESM)
│   ├── src/                  # TypeScript source with NodeNext resolution
│   └── Dockerfile            # Production-ready Node 20 build
└── docker-compose.yml        # Orchestration for DB, Redis, API, and Web
```

---

## 🔧 Optimized Build System

ProxyForge uses a highly optimized Docker build pipeline:
*   **Layer Caching:** Dependencies are cached separately from source code.
*   **.dockerignore:** Massive speedups by excluding `node_modules` and local artifacts from build context.
*   **Standalone Mode:** Next.js is compiled to a standalone output, significantly reducing production container size.

---

## 🔒 Security

*   **Zero-Log Policy:** Edge nodes do not store transit metadata.
*   **SSH Hardening:** Provisioning wizard enforces best practices on remote VPS nodes.
*   **JWT Auth:** Stateless authentication for all API Engine requests.

