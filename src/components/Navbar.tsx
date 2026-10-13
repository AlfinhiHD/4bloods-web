'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tv, Menu, X, Sun, Moon, BookOpen, Users, Compass } from 'lucide-react';

interface NavbarProps {
  liveCount?: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export default function Navbar({
  liveCount = 0,
  theme = 'dark',
  onToggleTheme,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

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

  const isWiki = pathname?.startsWith('/wiki');
  const isCommunity = pathname?.startsWith('/community');
  const isHome = pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 border-b transition-colors duration-200 ${
        isDark
          ? scrolled
            ? 'bg-[#080507]/95 backdrop-blur-2xl border-red-500/25 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.85)]'
            : 'bg-[#080507]/85 backdrop-blur-xl border-white/10 py-3.5'
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

        {/* Center: 2 Big Major Menus Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {/* Menu 01: 4Bloods Wiki & History */}
          <Link
            href="/wiki"
            className={`px-4 py-2 text-xs font-mono-tech font-bold tracking-widest uppercase transition-all flex items-center gap-2 border ${
              isWiki
                ? 'bg-red-600/15 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                : isDark
                  ? 'bg-transparent border-white/10 text-zinc-300 hover:text-white hover:border-red-500/50 hover:bg-white/[0.04]'
                  : 'bg-transparent border-zinc-200 text-zinc-700 hover:text-red-600 hover:border-red-300 hover:bg-red-50'
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${isWiki ? 'text-red-500' : 'text-zinc-400'}`} />
            <span className="text-red-500 text-[10px]">01 //</span>
            <span>4BLOODS WIKI</span>
          </Link>

          {/* Menu 02: Community & Achievements Hub */}
          <Link
            href="/community"
            className={`px-4 py-2 text-xs font-mono-tech font-bold tracking-widest uppercase transition-all flex items-center gap-2 border ${
              isCommunity
                ? 'bg-red-600/15 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                : isDark
                  ? 'bg-transparent border-white/10 text-zinc-300 hover:text-white hover:border-red-500/50 hover:bg-white/[0.04]'
                  : 'bg-transparent border-zinc-200 text-zinc-700 hover:text-red-600 hover:border-red-300 hover:bg-red-50'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${isCommunity ? 'text-red-500' : 'text-zinc-400'}`} />
            <span className="text-red-500 text-[10px]">02 //</span>
            <span>COMMUNITY HUB</span>
          </Link>

          {/* Home Link (if not on home) */}
          {!isHome && (
            <Link
              href="/"
              className={`px-3 py-2 text-xs font-mono-tech font-bold tracking-widest uppercase transition-all flex items-center gap-1.5 ${
                isDark
                  ? 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>OVERVIEW</span>
            </Link>
          )}
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
          className={`md:hidden border-b px-4 pt-4 pb-6 mt-3 space-y-2.5 ${
            isDark ? 'bg-[#0A0708] border-red-500/30' : 'bg-white border-zinc-300'
          }`}
        >
          <Link
            href="/wiki"
            onClick={() => setMobileOpen(false)}
            className={`block px-4 py-3 text-xs font-mono-tech font-bold border ${
              isWiki
                ? 'bg-red-600/20 border-red-500 text-white'
                : isDark
                  ? 'bg-[#120B0E] border-white/10 text-zinc-200'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-800'
            }`}
          >
            <div className="text-red-500 text-[10px]">MENU 01</div>
            <div className="text-sm font-display tracking-wider">4BLOODS WIKI & ARCHIVE</div>
            <div className="text-[10px] font-mono-tech text-zinc-400 font-normal">
              Origin, 3 Chapters, Hierarchy & War Chronicles
            </div>
          </Link>

          <Link
            href="/community"
            onClick={() => setMobileOpen(false)}
            className={`block px-4 py-3 text-xs font-mono-tech font-bold border ${
              isCommunity
                ? 'bg-red-600/20 border-red-500 text-white'
                : isDark
                  ? 'bg-[#120B0E] border-white/10 text-zinc-200'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-800'
            }`}
          >
            <div className="text-red-500 text-[10px]">MENU 02</div>
            <div className="text-sm font-display tracking-wider">COMMUNITY & ACHIEVEMENTS</div>
            <div className="text-[10px] font-mono-tech text-zinc-400 font-normal">
              Skala Komunitas, Social Hub, Discography & 54 Streamers
            </div>
          </Link>

          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={`block px-4 py-2.5 text-xs font-mono-tech font-bold border ${
              isDark
                ? 'bg-black/40 border-white/10 text-zinc-400'
                : 'bg-zinc-100 border-zinc-200 text-zinc-600'
            }`}
          >
            OVERVIEW PORTAL // HOME
          </Link>

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="w-full px-3.5 py-2.5 bg-zinc-900 text-amber-400 border border-white/15 text-xs font-mono-tech font-bold uppercase flex items-center justify-between mt-2"
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
