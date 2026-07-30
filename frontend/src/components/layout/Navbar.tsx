"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Validator', href: '/' },
    { name: 'API Engine', href: '/api-engine' },
    { name: 'Network', href: '/network' },
    { name: 'Docs', href: '/docs' },
  ];

  return (
    <header className="relative z-50 border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Shield className="w-6 h-6 text-cyan-400" />
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            ProxyForge
          </span>
        </Link>
        
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors",
                pathname === item.href 
                  ? "text-cyan-400" 
                  : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Online
          </div>
        </div>
      </div>
    </header>
  );
}
