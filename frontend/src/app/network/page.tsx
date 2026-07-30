"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Shield, Zap, Activity, MapPin, Layers, Plus, Server, Key, Settings, Loader2, CheckCircle2, X, Search, Radar, Crosshair } from 'lucide-react';

import dynamic from 'next/dynamic';

const SatelliteMap = dynamic(() => import('@/components/network/SatelliteMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-neutral-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-neutral-800" /></div>
});

export default function NetworkPage() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [trackingIp, setTrackingIp] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [trackedProxies, setTrackedProxies] = useState<any[]>([
    { ip: '1.1.1.1', lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'US' },
    { ip: '8.8.8.8', lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'DE' }
  ]);

  const nodes = [
    { id: 'PF-NA-01', location: 'New York, US', load: 42, status: 'Healthy', ping: '12ms', lat: 40.7128, lng: -74.0060 },
    { id: 'PF-EU-04', location: 'Frankfurt, DE', load: 68, status: 'Healthy', ping: '28ms', lat: 50.1109, lng: 8.6821 },
    { id: 'PF-AS-02', location: 'Singapore, SG', load: 15, status: 'Healthy', ping: '115ms', lat: 1.3521, lng: 103.8198 },
    { id: 'PF-UK-01', location: 'London, GB', load: 89, status: 'Degraded', ping: '32ms', lat: 51.5074, lng: -0.1278 },
  ];

  const handleTrackIp = async () => {
    if (!trackingIp) return;
    setIsLocating(true);
    try {
      const res = await fetch(`http://ip-api.com/json/${trackingIp}`);
      const data = await res.json();
      if (data.status === 'success') {
        const newProxy = {
          ip: trackingIp,
          lat: data.lat,
          lng: data.lon,
          city: data.city,
          country: data.countryCode,
          timestamp: new Date().toLocaleTimeString()
        };
        setTrackedProxies(prev => [newProxy, ...prev]);
        setTrackingIp('');
        setIsTrackingOpen(false);
      } else {
        alert("Could not locate IP: " + data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLocating(false);
    }
  };

  const handleStartDeployment = () => {
    setIsDeploying(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsDeploying(false);
          setWizardStep(4);
        }, 500);
      }
      setDeployProgress(progress);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-cyan-500/30 overflow-hidden font-sans">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="absolute right-0 top-0 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-emerald-500 opacity-5 blur-[120px]"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Global Network</h1>
            <p className="text-neutral-400 text-sm">Monitor ProxyForge edge nodes and global routing health in real-time.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsTrackingOpen(true)}
              className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 text-cyan-400 hover:bg-neutral-800 px-4 py-2 rounded-lg text-sm font-bold transition-all"
            >
              <Radar className="w-4 h-4" /> Track Proxy IP
            </button>
            <button 
              onClick={() => { setIsWizardOpen(true); setWizardStep(1); }}
              className="flex items-center gap-2 bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <Plus className="w-4 h-4" /> Provision Node
            </button>
          </div>
        </div>

        {/* Real-time Satellite Map */}
        <div className="w-full h-[500px] bg-neutral-900 border border-neutral-800 rounded-2xl mb-8 relative overflow-hidden group shadow-2xl">
          <SatelliteMap proxies={trackedProxies} nodes={nodes} />

          {/* Interface HUD Overlay */}
          <div className="absolute top-6 left-6 z-30 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md border border-neutral-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Orbital Feed</span>
              </div>
              <div className="space-y-1">
                <div className="text-[9px] text-neutral-500 font-mono">SENSOR: ACTIVE</div>
                <div className="text-[9px] text-neutral-500 font-mono">SOURCE: ESRI WORLD IMAGERY</div>
                <div className="text-[9px] text-cyan-400 font-mono">LATENCY: SYNCED</div>
              </div>
            </div>
          </div>

          {/* Tracking List Overlay */}
          <div className="absolute bottom-6 left-6 z-30 w-64 max-h-48 overflow-y-auto scrollbar-hide">
            <div className="space-y-2">
              {trackedProxies.map((p, i) => (
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key={i} className="bg-black/40 backdrop-blur-md border border-neutral-800/50 p-2 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-[10px] font-bold">{p.country}</div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-white">{p.ip}</div>
                    <div className="text-[9px] text-neutral-500">{p.city}</div>
                  </div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_5px_#34d399]"></div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-6 right-6 text-[10px] font-mono text-neutral-500 bg-black/60 px-3 py-1.5 rounded-lg border border-neutral-800 backdrop-blur-md">
            SATELLITE MESH TRACKER V2.1 // ORBITAL SYNC ACTIVE
          </div>
          
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-40 bg-[size:100%_2px,3px_100%]"></div>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {nodes.map((node, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-neutral-800 rounded-lg group-hover:bg-neutral-700 transition-colors">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${node.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {node.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{node.id}</h3>
              <p className="text-xs text-neutral-500 mb-4">{node.location}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter text-neutral-500">
                  <span>Load Factor</span>
                  <span className={node.load > 80 ? 'text-amber-400' : 'text-neutral-300'}>{node.load}%</span>
                </div>
                <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${node.load > 80 ? 'bg-amber-500' : 'bg-cyan-500'}`} style={{ width: `${node.load}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {node.ping}</span>
                  <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Active</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Track Proxy Modal */}
      <AnimatePresence>
        {isTrackingOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTrackingOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-500/10 rounded-xl">
                  <Crosshair className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Satellite Tracking</h2>
                  <p className="text-xs text-neutral-500">Locate any proxy IP on the global mesh.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">Proxy IP Address</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={trackingIp}
                      onChange={(e) => setTrackingIp(e.target.value)}
                      placeholder="e.g. 157.245.12.84" 
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 text-sm text-neutral-300 focus:ring-2 focus:ring-cyan-500/50 outline-none" 
                    />
                  </div>
                </div>
                <button 
                  onClick={handleTrackIp}
                  disabled={isLocating || !trackingIp}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Locate Proxy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deployment Wizard Modal (Restored from previous version) */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isDeploying && setIsWizardOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Server className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Edge Node Provisioning</h2>
                    <p className="text-xs text-neutral-500">Step {wizardStep} of 3</p>
                  </div>
                </div>
                {!isDeploying && (
                  <button onClick={() => setIsWizardOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="p-8">
                {wizardStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div>
                      <h3 className="text-white font-semibold mb-4">Server Connection</h3>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">Public IP Address</label>
                          <input type="text" placeholder="e.g. 157.245.12.84" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 px-4 text-sm text-neutral-300 focus:ring-2 focus:ring-cyan-500/50 outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">Node Label / ID</label>
                          <input type="text" placeholder="e.g. LONDON-EDGE-01" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 px-4 text-sm text-neutral-300 focus:ring-2 focus:ring-cyan-500/50 outline-none" />
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setWizardStep(2)} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)]">
                      Continue to Auth
                    </button>
                  </motion.div>
                )}
                {/* Steps 2-4 logic remains here as implemented previously... */}
                {wizardStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div>
                      <h3 className="text-white font-semibold mb-4 text-center">Security Authentication</h3>
                      <div className="flex gap-2 p-1 bg-neutral-950 rounded-lg border border-neutral-800 mb-6">
                        <button className="flex-1 py-2 text-xs font-bold bg-neutral-800 text-white rounded-md">SSH Key</button>
                        <button className="flex-1 py-2 text-xs font-bold text-neutral-500">Root Password</button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">Private Key Content</label>
                        <textarea placeholder="-----BEGIN OPENSSH PRIVATE KEY-----" className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 px-4 text-xs font-mono text-neutral-400 focus:ring-2 focus:ring-cyan-500/50 outline-none resize-none" />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setWizardStep(1)} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-xl transition-all">Back</button>
                      <button onClick={() => setWizardStep(3)} className="flex-[2] bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)]">Verify & Configure</button>
                    </div>
                  </motion.div>
                )}
                {wizardStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-center">
                    {!isDeploying ? (
                      <>
                        <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl mb-6">
                          <Settings className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-[spin_10s_linear_infinite]" />
                          <h3 className="text-white font-semibold mb-2 text-lg">Finalize Deployment</h3>
                          <button onClick={handleStartDeployment} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4">
                            <Zap className="w-5 h-5 fill-current" /> Deploy to Edge
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-8 space-y-6">
                        <div className="relative w-32 h-32 mx-auto">
                          <div className="absolute inset-0 border-4 border-neutral-800 rounded-full"></div>
                          <motion.div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold font-mono">{Math.round(deployProgress)}%</span>
                          </div>
                        </div>
                        <h4 className="text-white font-bold">Provisioning Edge Stack...</h4>
                      </div>
                    )}
                  </motion.div>
                )}
                {wizardStep === 4 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-6">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Node Deployment Successful</h3>
                    <button onClick={() => setIsWizardOpen(false)} className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-xl transition-all">Return to Dashboard</button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
