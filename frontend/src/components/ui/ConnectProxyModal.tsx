"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Smartphone,
  Copy,
  Check,
  Download,
  Wifi,
  QrCode,
  ExternalLink,
  Shield,
  ChevronRight,
  Info,
} from "lucide-react";

interface ProxyData {
  ip: string;
  port: string;
  protocol: string;
  latency: number;
  status: string;
  country: string;
  username?: string;
  password?: string;
}

interface ConnectProxyModalProps {
  proxy: ProxyData | null;
  isOpen: boolean;
  onClose: () => void;
  backendUrl?: string;
}

type CopiedField = "host" | "port" | "url" | "pac" | null;
type Tab = "qr" | "manual" | "auto";

export default function ConnectProxyModal({
  proxy,
  isOpen,
  onClose,
  backendUrl = "",
}: ConnectProxyModalProps) {
  const [copiedField, setCopiedField] = useState<CopiedField>(null);
  const [activeTab, setActiveTab] = useState<Tab>("qr");
  const [activeStep, setActiveStep] = useState(0);

  if (!proxy) return null;

  const proxyUrl = proxy.username
    ? `${proxy.protocol.toLowerCase()}://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`
    : `${proxy.protocol.toLowerCase()}://${proxy.ip}:${proxy.port}`;

  const pacUrl = `${backendUrl}/api/v1/proxy/pac?host=${proxy.ip}&port=${proxy.port}&protocol=${proxy.protocol.toLowerCase()}`;

  const qrData = JSON.stringify({
    type: "proxyforge-connect",
    host: proxy.ip,
    port: proxy.port,
    protocol: proxy.protocol,
    username: proxy.username || "",
    password: proxy.password || "",
  });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}&bgcolor=0a0a0a&color=22d3ee&format=svg`;

  const copyToClipboard = async (text: string, field: CopiedField) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const downloadPacFile = () => {
    const pacContent = `function FindProxyForURL(url, host) {
  return "${proxy.protocol.toUpperCase()} ${proxy.ip}:${proxy.port}";
}`;
    const blob = new Blob([pacContent], {
      type: "application/x-ns-proxy-autoconfig",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proxyforge-${proxy.ip.replace(/\./g, "-")}.pac`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const manualSteps = [
    {
      title: "Open Wi-Fi Settings",
      desc: "Go to Settings → Network & Internet → Wi-Fi",
      icon: Wifi,
    },
    {
      title: "Select Your Network",
      desc: "Tap the gear icon next to your connected Wi-Fi",
      icon: ChevronRight,
    },
    {
      title: "Edit Proxy Settings",
      desc: 'Tap Edit → Advanced options → Set Proxy to "Manual"',
      icon: Shield,
    },
    {
      title: "Enter Proxy Details",
      desc: `Host: ${proxy.ip} | Port: ${proxy.port}`,
      icon: Smartphone,
    },
    {
      title: "Save & Connect",
      desc: "Tap Save. Your traffic now routes through this proxy.",
      icon: Check,
    },
  ];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "qr", label: "QR Code", icon: <QrCode className="w-3.5 h-3.5" /> },
    {
      id: "auto",
      label: "Auto Config",
      icon: <Download className="w-3.5 h-3.5" />,
    },
    {
      id: "manual",
      label: "Manual",
      icon: <Smartphone className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 380 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl shadow-cyan-500/5 overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/15 rounded-full blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="relative p-5 pb-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Connect to Phone
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Configure this proxy on your mobile device
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Proxy info bar */}
              <div className="mt-4 flex items-center gap-3 p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-cyan-400 truncate">
                      {proxy.ip}:{proxy.port}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-800 border border-neutral-700 text-neutral-400">
                      {proxy.protocol}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                    <span>{proxy.country}</span>
                    <span>•</span>
                    <span
                      className={
                        proxy.latency < 100
                          ? "text-emerald-400"
                          : proxy.latency < 250
                            ? "text-yellow-400"
                            : "text-red-400"
                      }
                    >
                      {proxy.latency}ms
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Alive
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(proxyUrl, "url")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-600/20 transition-all"
                >
                  {copiedField === "url" ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copiedField === "url" ? "Copied!" : "Copy URL"}
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-1 mt-4 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                        : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="relative p-5">
              <AnimatePresence mode="wait">
                {/* QR Code Tab */}
                {activeTab === "qr" && (
                  <motion.div
                    key="qr"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className="relative p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
                        {/* QR Code */}
                        <div className="w-[220px] h-[220px] bg-[#0a0a0a] rounded-xl overflow-hidden flex items-center justify-center">
                          <img
                            src={qrImageUrl}
                            alt="Proxy QR Code"
                            width={220}
                            height={220}
                            className="rounded-xl"
                          />
                        </div>
                        {/* Decorative corners */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-lg" />
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-lg" />
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-lg" />
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500/40 rounded-br-lg" />
                      </div>
                      <p className="mt-3 text-xs text-neutral-500 text-center max-w-[280px]">
                        Scan this QR code with your phone camera or a proxy app
                        like{" "}
                        <span className="text-cyan-400 font-medium">
                          Super Proxy
                        </span>{" "}
                        or{" "}
                        <span className="text-cyan-400 font-medium">
                          Every Proxy
                        </span>{" "}
                        to auto-import settings.
                      </p>
                    </div>

                    {/* Quick copy fields */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => copyToClipboard(proxy.ip, "host")}
                        className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all group"
                      >
                        <div className="text-left">
                          <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                            Host
                          </div>
                          <div className="text-sm font-mono text-neutral-300 mt-0.5 truncate max-w-[140px]">
                            {proxy.ip}
                          </div>
                        </div>
                        {copiedField === "host" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(proxy.port, "port")}
                        className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all group"
                      >
                        <div className="text-left">
                          <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                            Port
                          </div>
                          <div className="text-sm font-mono text-neutral-300 mt-0.5">
                            {proxy.port}
                          </div>
                        </div>
                        {copiedField === "port" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Auto Config Tab */}
                {activeTab === "auto" && (
                  <motion.div
                    key="auto"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* PAC File section */}
                    <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                          <Download className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            PAC File (Auto-Config)
                          </h3>
                          <p className="text-[11px] text-neutral-500">
                            Set once — proxy updates automatically
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Download a PAC file or use the PAC URL below. In your
                        phone&apos;s Wi-Fi proxy settings, choose{" "}
                        <span className="text-white font-medium">
                          &quot;Auto-Config&quot;
                        </span>{" "}
                        instead of &quot;Manual&quot; and paste the URL.
                      </p>

                      {/* PAC URL */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-2 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-xs text-neutral-400 truncate">
                          {pacUrl}
                        </div>
                        <button
                          onClick={() => copyToClipboard(pacUrl, "pac")}
                          className="shrink-0 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-all flex items-center gap-1.5"
                        >
                          {copiedField === "pac" ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          {copiedField === "pac" ? "Copied" : "Copy"}
                        </button>
                      </div>

                      <button
                        onClick={downloadPacFile}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/10"
                      >
                        <Download className="w-4 h-4" />
                        Download PAC File
                      </button>
                    </div>

                    {/* Third party apps */}
                    <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-sm font-semibold text-white">
                          Recommended Apps
                        </h3>
                      </div>
                      <p className="text-xs text-neutral-400 mb-3">
                        For{" "}
                        <span className="text-white font-medium">
                          system-wide
                        </span>{" "}
                        proxy routing (all apps, not just browser), use one of
                        these:
                      </p>
                      <div className="space-y-2">
                        {[
                          {
                            name: "Super Proxy",
                            desc: "HTTP/SOCKS5 with VPN routing",
                            color: "emerald",
                          },
                          {
                            name: "Every Proxy",
                            desc: "Simple UI, per-app toggle",
                            color: "cyan",
                          },
                        ].map((app) => (
                          <div
                            key={app.name}
                            className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg"
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-7 h-7 rounded-lg bg-${app.color}-500/10 border border-${app.color}-500/20 flex items-center justify-center`}
                              >
                                <Smartphone
                                  className={`w-3.5 h-3.5 text-${app.color}-400`}
                                />
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-white">
                                  {app.name}
                                </div>
                                <div className="text-[10px] text-neutral-500">
                                  {app.desc}
                                </div>
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-neutral-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Manual Tab */}
                {activeTab === "manual" && (
                  <motion.div
                    key="manual"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    <p className="text-xs text-neutral-500 mb-3">
                      Follow these steps to configure the proxy manually on your
                      Android device:
                    </p>
                    {manualSteps.map((step, i) => {
                      const Icon = step.icon;
                      const isActive = activeStep === i;
                      return (
                        <button
                          key={i}
                          onClick={() => setActiveStep(i)}
                          className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                            isActive
                              ? "bg-cyan-500/5 border-cyan-500/20"
                              : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                          }`}
                        >
                          <div
                            className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                              isActive
                                ? "bg-cyan-600 text-white"
                                : "bg-neutral-800 text-neutral-500"
                            }`}
                          >
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm font-semibold ${isActive ? "text-white" : "text-neutral-400"}`}
                            >
                              {step.title}
                            </div>
                            <div
                              className={`text-xs mt-0.5 ${isActive ? "text-neutral-400" : "text-neutral-600"}`}
                            >
                              {step.desc}
                            </div>
                          </div>
                          <Icon
                            className={`shrink-0 w-4 h-4 mt-0.5 ${isActive ? "text-cyan-400" : "text-neutral-700"}`}
                          />
                        </button>
                      );
                    })}

                    <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-400/80 leading-relaxed">
                        Native Wi-Fi proxy only routes browser traffic. For
                        system-wide routing, use the{" "}
                        <button
                          onClick={() => setActiveTab("auto")}
                          className="text-cyan-400 underline underline-offset-2 font-medium"
                        >
                          Auto Config
                        </button>{" "}
                        tab with a third-party app.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
