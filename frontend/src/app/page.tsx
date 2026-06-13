"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Server, Activity, Globe, Play, Loader2, ArrowRight, Smartphone } from 'lucide-react';
import ConnectProxyModal from '@/components/ui/ConnectProxyModal';

export default function ProxyForgeDashboard() {
  const [checking, setChecking] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [proxies, setProxies] = useState<any[]>([]);
  const [proxyList, setProxyList] = useState('');
  const [protocol, setProtocol] = useState('http');
  const [selectedProxy, setSelectedProxy] = useState<any>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [meshStats, setMeshStats] = useState({ totalAgents: 0, online: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/v1/mesh/stats');
        const data = await res.json();
        setMeshStats(data);
      } catch (e) {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCheck = async () => {
    if (!proxyList.trim()) return;
    setChecking(true);
    
    try {
      const lines = proxyList.split('\n').filter(l => l.trim());
      const response = await fetch('/api/v1/validate/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proxies: lines, protocol })
      });
      
      const data = await response.json();
      if (data.results) {
        setProxies(data.results);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setChecking(false);
    }
  };

  const fetchFreeProxies = async (bulk = false) => {
    setFetching(true);
    try {
      const response = await fetch(`/api/v1/proxies/free?protocol=${protocol}&validate=true&limit=${bulk ? 500 : 100}`);
      const data = await response.json();
      if (data.proxies) {
        setProxyList(data.proxies.join('\n'));
        if (data.validated && data.proxies.length > 0) {
          // If we got validated proxies, we can immediately show them in the results too
          handleCheck();
        }
      }
    } catch (error) {
      console.error('Failed to fetch proxies:', error);
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-cyan-500/30 overflow-hidden font-sans">
      
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-cyan-500 opacity-20 blur-[100px]"></div>
      </div>


      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Residential Mesh
              </h2>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${meshStats.online > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-medium text-neutral-400">{meshStats.online} Nodes Online</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">Gateway Port</span>
                  <span className="text-[10px] font-mono text-cyan-400">8888</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">Local IP</span>
                  <span className="text-[10px] font-mono text-cyan-400">192.168.1.197</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedProxy({
                    ip: '192.168.1.197',
                    port: '8888',
                    protocol: 'HTTP',
                    latency: 0,
                    status: 'Alive',
                    country: 'Local Mesh'
                  });
                  setShowConnectModal(true);
                }}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
              >
                <Smartphone className="w-4 h-4" />
                Connect Phone to Mesh
              </button>
            </div>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Proxy Validator</h1>
                <p className="text-neutral-400 text-sm">Enter proxies to check their health, anonymity, and latency.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
                {['http', 'socks4', 'socks5'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setProtocol(p)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${protocol === p ? 'bg-cyan-600 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => fetchFreeProxies(false)}
                disabled={fetching}
                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 bg-cyan-400/10 px-2 py-1 rounded-md border border-cyan-400/20"
              >
                {fetching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                Get Free Proxies
              </button>
              <button 
                onClick={() => fetchFreeProxies(true)}
                disabled={fetching}
                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20"
              >
                {fetching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                Bulk Generate (Cloud)
              </button>
            </div>

            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Proxy List</label>
              <span className="text-xs text-neutral-500">{proxyList.split('\n').filter(l => l.trim()).length} / 500</span>
            </div>
            <textarea 
              value={proxyList}
              onChange={(e) => setProxyList(e.target.value)}
              className="w-full h-48 bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-neutral-300 font-mono focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all resize-none"
              placeholder="192.168.1.1:8080&#10;10.0.0.1:1080:user:pass"
            ></textarea>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                Import CSV
              </button>
              <button 
                onClick={handleCheck}
                disabled={checking || !proxyList.trim()}
                className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all shadow-[0_0_15px_rgba(8,145,178,0.5)]"
              >
                {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {checking ? 'Checking...' : 'Start Check'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <div className="text-neutral-500 text-xs mb-1">Active Workers</div>
              <div className="text-2xl font-semibold text-white flex items-center gap-2">
                12 <Activity className="w-4 h-4 text-cyan-500" />
              </div>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <div className="text-neutral-500 text-xs mb-1">Proxy Gateway</div>
              <div className="text-sm font-semibold text-emerald-400">
                {proxies.some(p => p.status === 'Alive') ? 'Running on :8888' : 'Idle (No proxies)'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50 flex-shrink-0">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" /> Validation Results
              </h2>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-md">HTTP</span>
                <span className="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-md">SOCKS5</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar">
              {proxies.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-4">
                  <Globe className="w-12 h-12 opacity-20" />
                  <p className="text-sm">No proxies validated yet. Enter list to begin.</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left relative">
                  <thead className="text-xs text-neutral-400 bg-neutral-950/90 uppercase border-b border-neutral-800 sticky top-0 z-20 backdrop-blur-sm">
                    <tr>
                      <th className="px-4 py-3">Proxy</th>
                      <th className="px-4 py-3">Protocol</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Latency</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Connect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proxies.map((p, i) => (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-neutral-300">{p.ip}:{p.port}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-xs border border-neutral-700 bg-neutral-800 text-neutral-300">
                            {p.protocol}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center text-[10px]">{p.country}</span>
                        </td>
                        <td className="px-4 py-3 text-neutral-400">
                          <span className={p.latency < 100 ? 'text-emerald-400' : p.latency < 250 ? 'text-yellow-400' : 'text-red-400'}>
                            {p.latency}ms
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${p.status === 'Alive' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {p.status === 'Alive' ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> : <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>}
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {p.status === 'Alive' ? (
                            <button
                              onClick={() => {
                                setSelectedProxy(p);
                                setShowConnectModal(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-600/20 hover:border-cyan-500/40 transition-all group"
                            >
                              <Smartphone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                              Connect
                            </button>
                          ) : (
                            <span className="text-xs text-neutral-600">—</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex justify-between items-center text-xs text-neutral-500">
              <span>Showing {proxies.length} entries</span>
              <button className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium">
                Export Working <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Connect to Phone Modal */}
      <ConnectProxyModal
        proxy={selectedProxy}
        isOpen={showConnectModal}
        onClose={() => {
          setShowConnectModal(false);
          setSelectedProxy(null);
        }}
      />
    </div>
  );
}
