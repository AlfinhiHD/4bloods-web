'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tv, Menu, X, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  liveCount?: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export default function Navbar({
  liveCount = 1,
  theme = 'dark',
  onToggleTheme,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 16;
          setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isDark = theme === 'dark';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 border-b transition-colors duration-200 ${
        isDark
          ? scrolled
            ? 'bg-[#080507]/95 backdrop-blur-2xl border-red-500/25 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.85)]'
            : 'bg-[#080507]/80 backdrop-blur-xl border-white/10 py-3.5'
          : scrolled
            ? 'bg-white/95 backdrop-blur-2xl border-zinc-300 py-3 shadow-md'
            : 'bg-white/90 backdrop-blur-xl border-zinc-200 py-3.5'
      }`}
    >
      <div className="max-w-[1520px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-6">
        {/* Left: Official 4BG Brand Identity */}
        <Link href="/" className="flex items-center gap-3 group cursor-pointer shrink-0">
          <img
            src="/assets/logo_v2.png"
            alt="4BLOODS GANG"
            className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(220,38,38,0.4)] group-hover:scale-105 transition-transform duration-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`font-display text-xl sm:text-2xl tracking-wider uppercase group-hover:text-red-500 transition-colors leading-none ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}
              >
                4BLOODS GANG
              </span>
            </div>
            <p
              className={`text-[9px] font-mono-tech tracking-[0.2em] uppercase mt-1 ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}
            >
              IME ROLEPLAY // SOUTH SIDE ROXWOOD
            </p>
          </div>
        </Link>

        {/* Center: Spacious Editorial Index Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {[
            { href: '#chronicles', num: '01', label: 'TERRITORIES' },
            { href: '#hierarchy', num: '02', label: 'SYNDICATE' },
            { href: '#wardrobe', num: '03', label: '3D SHOWROOM' },
            { href: '#records', num: '04', label: 'VINYL & DISS' },
            { href: '#archives', num: '05', label: 'WAR CINEMA' },
            { href: '#roster', num: '06', label: '54 STREAMERS' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`px-3.5 py-2 text-[11px] font-mono-tech font-bold tracking-widest transition-all cursor-pointer uppercase flex items-center gap-1.5 ${
                isDark
                  ? 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  : 'text-zinc-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <span className="text-red-500/80 text-[9px]">{item.num}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Right: Dedicated Primary 4BLOODS CAM Launch Button */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            href="/cam"
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-mono-tech font-bold tracking-[0.18em] uppercase transition-all shadow-[0_0_25px_rgba(220,38,38,0.45)] flex items-center gap-2.5 cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <Tv className="w-3.5 h-3.5" />
            <span>4BLOODS CAM</span>
            {liveCount > 0 && (
              <span className="px-1.5 py-0.5 bg-black/40 text-white text-[10px]">
                {liveCount} LIVE
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/cam"
            className="px-3 py-2 bg-red-600 text-white text-[10px] font-mono-tech font-bold uppercase flex items-center gap-1.5"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>CAM ({liveCount})</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-2 border cursor-pointer ${
              isDark
                ? 'bg-zinc-900 border-white/15 text-white'
                : 'bg-zinc-100 border-zinc-300 text-zinc-900'
            }`}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className={`md:hidden border-b px-4 pt-4 pb-6 mt-3 space-y-2 ${
            isDark ? 'bg-[#0A0708] border-red-500/30' : 'bg-white border-zinc-300'
          }`}
        >
          {[
            { href: '#chronicles', label: '01 // THE TERRITORY ARCHIVES' },
            { href: '#hierarchy', label: '02 // SYNDICATE HIERARCHY SHOWCASE' },
            { href: '#wardrobe', label: '03 // OFFICIAL 3D LOOKBOOK SHOWROOM' },
            { href: '#records', label: '04 // 4BG RECORDS (MV & DISS TRACKS)' },
            { href: '#archives', label: '05 // WAR TAPES & CINEMA REELS' },
            { href: '#roster', label: '06 // 54 OFFICIAL STREAMERS' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-3.5 py-2.5 text-xs font-mono-tech font-bold border ${
                isDark
                  ? 'bg-[#120B0E] border-white/10 text-zinc-200'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-800'
              }`}
            >
              {item.label}
            </a>
          ))}

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="w-full px-3.5 py-2.5 bg-zinc-900 text-amber-400 border border-white/15 text-xs font-mono-tech font-bold uppercase flex items-center justify-between"
            >
              <span>GANTI TEMA TAMPILAN</span>
              <span className="flex items-center gap-1.5">
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {isDark ? 'LIGHT MODE' : 'DARK MODE'}
              </span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
