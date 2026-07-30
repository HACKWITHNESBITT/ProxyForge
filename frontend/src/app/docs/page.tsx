"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Code, Shield, Lock, Zap, Box, ChevronRight, Terminal, Globe, Cpu, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('Introduction');

  const sections = [
    { title: 'Getting Started', items: ['Introduction', 'Installation', 'Quick Start Guide'], icon: Book },
    { title: 'Authentication', items: ['API Keys', 'JWT Integration', 'OAuth 2.0'], icon: Lock },
    { title: 'Proxy Validation', items: ['Bulk Checks', 'Protocol Support', 'Anonymity Levels'], icon: Shield },
    { title: 'Network Engine', items: ['Edge Locations', 'Routing Logic', 'Custom Tunnels'], icon: Zap },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Introduction':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h1 className="text-4xl font-bold text-white mb-6">Introduction to ProxyForge</h1>
            <p className="text-neutral-400 text-lg leading-relaxed">
              ProxyForge is a high-performance, privacy-first proxy management and validation platform designed for modern security infrastructure. 
              Our globally distributed edge network provides unparalleled speed and anonymity for automated workflows.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
                <Box className="w-8 h-8 text-cyan-400 mb-4" />
                <h4 className="text-white font-bold mb-2">Zero-Log</h4>
                <p className="text-sm text-neutral-500">We never store request metadata or transit data on our edge nodes.</p>
              </div>
              <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
                <Zap className="w-8 h-8 text-emerald-400 mb-4" />
                <h4 className="text-white font-bold mb-2">Low Latency</h4>
                <p className="text-sm text-neutral-500">Proprietary routing ensures the shortest path through the global mesh.</p>
              </div>
            </div>
          </motion.div>
        );
      case 'Installation':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Installation</h1>
            <p className="text-neutral-400">Install the ProxyForge CLI or SDK to integrate with your local environment.</p>
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 font-mono text-sm">
              <div className="text-neutral-500 mb-2"># Install via NPM</div>
              <div className="text-cyan-400">npm install -g @proxyforge/cli</div>
              <div className="text-neutral-500 mt-4 mb-2"># Verify installation</div>
              <div className="text-emerald-400">proxyforge --version</div>
            </div>
          </motion.div>
        );
      case 'Quick Start Guide':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Quick Start Guide</h1>
            <p className="text-neutral-400">Get your first validated proxy up and running in under 60 seconds.</p>
            <ol className="space-y-4 text-neutral-300">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Generate an <strong>API Key</strong> in the API Engine dashboard.</span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Configure your local environment variables.</span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Run a health check on your proxy pool.</span>
              </li>
            </ol>
          </motion.div>
        );
      case 'API Keys':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h1 className="text-3xl font-bold text-white">API Keys</h1>
            <p className="text-neutral-400">ProxyForge uses API keys for simple, scalable authentication. Keys can be scoped to specific regions or features.</p>
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3">
              <Shield className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-200/70">Never share your production API keys. We recommend using environment secrets for deployment.</p>
            </div>
          </motion.div>
        );
      case 'JWT Integration':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h1 className="text-3xl font-bold text-white">JWT Integration</h1>
            <p className="text-neutral-400">For enterprise applications, ProxyForge supports stateless JWT authentication for high-frequency requests.</p>
          </motion.div>
        );
      case 'OAuth 2.0':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h1 className="text-3xl font-bold text-white">OAuth 2.0</h1>
            <p className="text-neutral-400">Connect third-party tools securely using our OAuth 2.0 provider flow.</p>
          </motion.div>
        );
      case 'Bulk Checks':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Bulk Checks</h1>
            <p className="text-neutral-400">Validate up to 10,000 proxies per second using our distributed validation engine.</p>
          </motion.div>
        );
      case 'Protocol Support':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Protocol Support</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['HTTP', 'HTTPS', 'SOCKS5'].map(proto => (
                <div key={proto} className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-center font-bold text-cyan-400">
                  {proto}
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'Anonymity Levels':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Anonymity Levels</h1>
            <ul className="space-y-4">
              <li className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
                <h4 className="text-white font-bold">Elite (Level 1)</h4>
                <p className="text-sm text-neutral-500">Server cannot detect you are using a proxy at all.</p>
              </li>
              <li className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
                <h4 className="text-white font-bold">Anonymous (Level 2)</h4>
                <p className="text-sm text-neutral-500">Server knows you use a proxy but cannot see your real IP.</p>
              </li>
              <li className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
                <h4 className="text-white font-bold">Transparent (Level 3)</h4>
                <p className="text-sm text-neutral-500">Server knows you use a proxy and can see your real IP.</p>
              </li>
            </ul>
          </motion.div>
        );
      case 'Edge Locations':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Edge Locations</h1>
            <p className="text-neutral-400">ProxyForge operates in 42+ countries with over 500 dedicated edge nodes.</p>
            <Globe className="w-24 h-24 text-cyan-500/20 mx-auto" />
          </motion.div>
        );
      case 'Routing Logic':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Routing Logic</h1>
            <p className="text-neutral-400">Custom algorithms select the optimal node based on latency, target site, and current load factor.</p>
          </motion.div>
        );
      case 'Custom Tunnels':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Custom Tunnels</h1>
            <p className="text-neutral-400">Establish permanent encrypted tunnels (WireGuard) between your infrastructure and the ProxyForge mesh.</p>
          </motion.div>
        );
      default:
        return <div>Select a section from the sidebar.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-cyan-500/30 overflow-hidden font-sans">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Nav */}
          <aside className="w-full lg:w-64 space-y-8">
            {sections.map((section, i) => (
              <div key={i}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-2">
                  <section.icon className="w-3 h-3" /> {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item, j) => (
                    <li 
                      key={j} 
                      onClick={() => setActiveTab(item)}
                      className={cn(
                        "text-sm cursor-pointer transition-all flex items-center justify-between group px-3 py-2 rounded-lg",
                        activeTab === item 
                          ? "bg-cyan-500/10 text-cyan-400 font-medium" 
                          : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
                      )}
                    >
                      {item}
                      <ChevronRight className={cn(
                        "w-3 h-3 transition-all",
                        activeTab === item ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                      )} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>

          {/* Content */}
          <div className="flex-1 max-w-3xl">
            <div className="min-h-[500px]">
              <AnimatePresence mode="wait">
                {renderContent()}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
