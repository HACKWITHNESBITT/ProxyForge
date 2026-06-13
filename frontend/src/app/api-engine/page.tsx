"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Key, Database, Cpu, Copy, Check, RefreshCw } from 'lucide-react';

export default function ApiEnginePage() {
  const [apiKey, setApiKey] = useState('pf_live_72x9kLp2mN5qR8vW4tZ1sA3bC6dE9fG');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const usageStats = [
    { label: 'Requests (24h)', value: '1,284,092', change: '+12.5%', icon: Database },
    { label: 'Avg Latency', value: '42ms', change: '-2ms', icon: Cpu },
    { label: 'Success Rate', value: '99.98%', change: 'Stable', icon: Terminal },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-cyan-500/30 overflow-hidden font-sans">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-10 blur-[100px]"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">API Engine</h1>
          <p className="text-neutral-400 text-sm">Manage your ProxyForge API access and monitor real-time throughput.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Key Management */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Key className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Production API Key</h2>
                  <p className="text-xs text-neutral-500">Use this key to authenticate your requests to the ProxyForge edge network.</p>
                </div>
              </div>

              <div className="relative group">
                <input 
                  type="text" 
                  readOnly 
                  value={apiKey}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 pr-24 text-sm font-mono text-cyan-400 outline-none group-hover:border-neutral-700 transition-colors"
                />
                <div className="absolute right-2 top-1.5 flex gap-1">
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-neutral-800 rounded-md transition-colors text-neutral-400 hover:text-white"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button className="p-2 hover:bg-neutral-800 rounded-md transition-colors text-neutral-400 hover:text-white">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-medium text-neutral-300 mb-4">Quick Start</h3>
                <div className="bg-neutral-950 rounded-lg p-4 border border-neutral-800 font-mono text-xs text-neutral-400 overflow-x-auto">
                  <div className="flex gap-4 mb-2 border-b border-neutral-900 pb-2">
                    <span className="text-cyan-400 border-b border-cyan-400 pb-2">cURL</span>
                    <span className="hover:text-neutral-200 cursor-pointer">Node.js</span>
                    <span className="hover:text-neutral-200 cursor-pointer">Python</span>
                  </div>
                  <pre className="mt-4">
                    {`curl -X POST https://api.proxyforge.io/v1/validate \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "proxies": ["1.1.1.1:8080"],
    "check_latency": true
  }'`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="lg:col-span-4 space-y-6">
            <div className="grid gap-4">
              {usageStats.map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="w-4 h-4 text-neutral-500" />
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-neutral-400 text-xs">{stat.label}</div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/20 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-2">Upgrade Engine</h3>
              <p className="text-xs text-neutral-400 mb-4">Unlock 10Gbps dedicated nodes and custom rotate logic.</p>
              <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all">
                View Enterprise Plans
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
