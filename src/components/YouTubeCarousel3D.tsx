'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  Play,
  Tv,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowUpDown,
  Maximize2,
  Grid,
  Layers,
  Sparkles,
} from 'lucide-react';
import Icon3D from './Icon3D';

function YouTubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export interface YouTubeCreator {
  channelId: string;
  name: string;
  rank: string;
  role?: string;
  handle?: string;
  subscribers?: number;
  subscribersText?: string;
  avatar?: string;
  banner?: string;
  isLive?: boolean;
  videoId?: string;
  streamTitle?: string;
  viewerCount?: number;
  featuredVideoId?: string;
  featuredTitle?: string;
}

interface YouTubeCarousel3DProps {
  streamers: YouTubeCreator[];
  isDark?: boolean;
  onOpenVideo?: (video: { videoId: string; title: string; streamer: string }) => void;
  title?: string;
  subtitle?: string;
  sectionBadge?: string;
}

export default function YouTubeCarousel3D({
  streamers,
  isDark = true,
  onOpenVideo,
  title = '54 OFFICIAL STREAMERS',
  subtitle = 'Daftar seluruh kreator resmi 4Bloods di YouTube beserta status siaran langsung real-time keluarga besar Four Bloods Gang.',
  sectionBadge = 'OFFICIAL CONTENT CREATOR ROSTER',
}: YouTubeCarousel3DProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'LIVE' | 'OG' | 'Under OG' | 'Young Bloods' | 'Member'>('ALL');
  const [sort, setSort] = useState<'subs' | 'live' | 'rank' | 'name'>('subs');
  const [viewMode, setViewMode] = useState<'carousel3d' | 'grid'>('carousel3d');
  const [activeIndex, setActiveIndex] = useState(0);
  const [popoutMember, setPopoutMember] = useState<YouTubeCreator | null>(null);

  // Touch gesture state for 3D carousel
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Filter & Sort Streamers
  const filteredList = useMemo(() => {
    let list = [...streamers];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.handle && m.handle.toLowerCase().includes(q)) ||
          (m.role && m.role.toLowerCase().includes(q)) ||
          m.rank.toLowerCase().includes(q)
      );
    }

    if (filter === 'LIVE') list = list.filter((m) => Boolean(m.isLive));
    else if (filter === 'OG') list = list.filter((m) => m.rank === 'OG');
    else if (filter === 'Under OG') list = list.filter((m) => m.rank === 'Under OG');
    else if (filter === 'Young Bloods') list = list.filter((m) => m.rank === 'Young Bloods');
    else if (filter === 'Member') list = list.filter((m) => m.rank === 'Member');

    const rankWeight: Record<string, number> = {
      OG: 1,
      'Under OG': 2,
      'Young Bloods': 3,
      Member: 4,
    };

    list.sort((a, b) => {
      if (sort === 'subs') {
        const subDiff = (b.subscribers || 0) - (a.subscribers || 0);
        if (subDiff !== 0) return subDiff;
        return a.name.localeCompare(b.name);
      }
      if (sort === 'live') {
        if (Boolean(a.isLive) !== Boolean(b.isLive)) return a.isLive ? -1 : 1;
        if (a.isLive && b.isLive) return (b.viewerCount || 0) - (a.viewerCount || 0);
        return (b.subscribers || 0) - (a.subscribers || 0);
      }
      if (sort === 'rank') {
        const rankDiff = (rankWeight[a.rank] || 9) - (rankWeight[b.rank] || 9);
        if (rankDiff !== 0) return rankDiff;
        return (b.subscribers || 0) - (a.subscribers || 0);
      }
      if (sort === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return list;
  }, [streamers, search, filter, sort]);

  // Keep active index within bounds
  useEffect(() => {
    if (activeIndex >= filteredList.length) {
      setActiveIndex(Math.max(0, filteredList.length - 1));
    }
  }, [filteredList.length, activeIndex]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (filteredList.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + filteredList.length) % filteredList.length);
  }, [filteredList.length]);

  const handleNext = useCallback(() => {
    if (filteredList.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % filteredList.length);
  }, [filteredList.length]);

  // Keyboard navigation
  useEffect(() => {
    if (viewMode !== 'carousel3d') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, handlePrev, handleNext]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const deltaX = touchStartX.current - touchEndX.current;
    if (deltaX > 45) {
      handleNext();
    } else if (deltaX < -45) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Helper to format subscribers with zero ellipsis truncation
  const getSubscribersDisplay = (member: YouTubeCreator) => {
    if (member.subscribersText) return member.subscribersText;
    if (typeof member.subscribers === 'number' && member.subscribers > 0) {
      if (member.subscribers >= 1000000) {
        return `${(member.subscribers / 1000000).toFixed(2).replace(/\.00$/, '')}M subscribers`;
      }
      if (member.subscribers >= 1000) {
        return `${(member.subscribers / 1000).toFixed(1).replace(/\.0$/, '')}K subscribers`;
      }
      return `${member.subscribers.toLocaleString('id-ID')} subscribers`;
    }
    return 'Official Creator';
  };

  const liveCount = streamers.filter((m) => m.isLive).length;

  return (
    <div className="space-y-8">
      {/* Header & Controls Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <Icon3D src="/assets/generated/icons3d/icon_roster.webp" alt="3D Studio Mic" />
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/15 border border-red-500/30 text-red-500 text-xs font-mono-tech font-bold uppercase tracking-widest">
              <Tv className="w-3.5 h-3.5" />
              <span>{sectionBadge}</span>
            </div>
            <h2
              className={`font-display text-3xl sm:text-5xl uppercase tracking-wider ${
                isDark ? 'text-white' : 'text-zinc-900'
              }`}
            >
              {title}
            </h2>
            <p className={`text-xs sm:text-sm font-mono-tech ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {subtitle}
            </p>
          </div>
        </div>

        {/* Quick View Mode Toggle & Live Counter */}
        <div className="flex flex-wrap items-center gap-3 font-mono-tech text-xs">
          <div className={`flex items-center border p-0.5 rounded-sm transition-colors ${
            isDark ? 'border-white/15 bg-black/40' : 'border-zinc-300 bg-zinc-100'
          }`}>
            <button
              onClick={() => setViewMode('carousel3d')}
              className={`px-3 py-1.5 flex items-center gap-1.5 font-bold uppercase text-[11px] cursor-pointer transition-all ${
                viewMode === 'carousel3d'
                  ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                  : isDark
                    ? 'text-zinc-400 hover:text-white'
                    : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3D CAROUSEL</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 flex items-center gap-1.5 font-bold uppercase text-[11px] cursor-pointer transition-all ${
                viewMode === 'grid'
                  ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                  : isDark
                    ? 'text-zinc-400 hover:text-white'
                    : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>GRID VIEW</span>
            </button>
          </div>

          <div className={`px-3.5 py-2 flex items-center gap-2 border font-mono-tech ${
            isDark ? 'bg-red-600/20 border-red-500/40 text-red-400' : 'bg-red-50 border-red-200 text-red-700 font-semibold'
          }`}>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold">{liveCount} SEDANG LIVE</span>
          </div>
        </div>
      </div>

      {/* Filter, Sort & Search Control Bar */}
      <div className={`p-4 border space-y-4 transition-colors ${
        isDark ? 'bg-black/60 border-white/15' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama, handle (@oxidstudios), atau role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveIndex(0);
              }}
              className={`w-full pl-10 pr-4 py-2.5 text-xs font-mono-tech border focus:outline-none focus:border-red-500 transition-colors ${
                isDark
                  ? 'bg-black/80 border-white/15 text-white placeholder-zinc-500'
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
              }`}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                  isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-800'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sorting Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono-tech text-xs">
            <span className={`text-[11px] uppercase flex items-center gap-1 ${
              isDark ? 'text-zinc-500' : 'text-zinc-600 font-medium'
            }`}>
              <ArrowUpDown className="w-3 h-3" />
              <span>URUTKAN:</span>
            </span>
            {(
              [
                { id: 'subs', label: 'SUBSCRIBERS' },
                { id: 'live', label: 'STATUS LIVE' },
                { id: 'rank', label: 'HIERARKI' },
                { id: 'name', label: 'NAMA' },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSort(s.id);
                  setActiveIndex(0);
                }}
                className={`px-2.5 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase border cursor-pointer transition-colors ${
                  sort === s.id
                    ? isDark
                      ? 'bg-red-600/30 text-red-400 border-red-500'
                      : 'bg-red-600 text-white border-red-600 font-bold shadow-sm'
                    : isDark
                      ? 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:text-zinc-900 hover:bg-zinc-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Pills */}
        <div className={`flex flex-wrap items-center justify-between gap-2 pt-3 border-t ${
          isDark ? 'border-white/10' : 'border-zinc-200'
        }`}>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'ALL', label: `SEMUA (${streamers.length})` },
                { id: 'LIVE', label: `🔴 LIVE (${liveCount})` },
                { id: 'OG', label: '👑 OG' },
                { id: 'Under OG', label: '⚡ UNDER OG' },
                { id: 'Young Bloods', label: '🛡️ YOUNG BLOODS' },
                { id: 'Member', label: 'MEMBER' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFilter(f.id);
                  setActiveIndex(0);
                }}
                className={`px-3 py-1.5 text-xs font-mono-tech font-bold uppercase border cursor-pointer transition-all ${
                  filter === f.id
                    ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                    : isDark
                      ? 'bg-black/50 text-zinc-400 border-white/10 hover:text-white hover:border-white/20'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className={`text-[11px] font-mono-tech ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
            Menampilkan {filteredList.length} dari {streamers.length} kreator
          </span>
        </div>
      </div>

      {/* ===================================================================
          MODE A: 3D INTERACTIVE CAROUSEL STAGE
          Cards arranged in 3D arc space; selected card pops out towards viewer
      =================================================================== */}
      {viewMode === 'carousel3d' && (
        <div className="space-y-6">
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative w-full overflow-hidden py-8 sm:py-14 select-none min-h-[580px] sm:min-h-[640px] flex items-center justify-center border transition-colors ${
              isDark
                ? 'bg-radial from-[#1A0A10]/60 via-[#0B0407]/90 to-[#040103] border-red-500/25 shadow-2xl'
                : 'bg-gradient-to-b from-stone-100 via-stone-200/60 to-stone-100 border-zinc-300 shadow-xl'
            }`}
            style={{ perspective: '1200px' }}
          >
            {/* Ambient Background Glow for 3D Stage */}
            <div className={`absolute inset-0 pointer-events-none bg-gradient-to-b ${
              isDark ? 'from-transparent via-red-950/15 to-transparent' : 'from-transparent via-red-100/30 to-transparent'
            }`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[100px] pointer-events-none ${
              isDark ? 'bg-red-600/10' : 'bg-red-500/10'
            }`} />

            {/* Left / Right Floating Navigation Chevrons */}
            <button
              onClick={handlePrev}
              disabled={filteredList.length <= 1}
              className={`absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-40 p-3 sm:p-4 rounded-full border transition-all cursor-pointer hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${
                isDark
                  ? 'bg-black/85 hover:bg-red-600 text-white border-white/20 hover:border-red-500 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
                  : 'bg-white/95 hover:bg-red-600 text-zinc-800 hover:text-white border-zinc-300 hover:border-red-500 shadow-xl'
              }`}
              title="Kreator Sebelumnya (Panah Kiri)"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={handleNext}
              disabled={filteredList.length <= 1}
              className={`absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 p-3 sm:p-4 rounded-full border transition-all cursor-pointer hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${
                isDark
                  ? 'bg-black/85 hover:bg-red-600 text-white border-white/20 hover:border-red-500 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
                  : 'bg-white/95 hover:bg-red-600 text-zinc-800 hover:text-white border-zinc-300 hover:border-red-500 shadow-xl'
              }`}
              title="Kreator Berikutnya (Panah Kanan)"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Render 3D Cards in Stage */}
            {filteredList.length === 0 ? (
              <div className={`text-center p-8 font-mono-tech text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Tidak ada kreator yang sesuai dengan kriteria pencarian.
              </div>
            ) : (
              <div
                className="relative w-[310px] sm:w-[380px] h-[520px] sm:h-[560px]"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {filteredList.map((member, idx) => {
                  const total = filteredList.length;
                  let offset = idx - activeIndex;

                  // Handle circular wrapping for smooth carousel feel
                  if (offset < -Math.floor(total / 2)) offset += total;
                  if (offset > Math.floor(total / 2)) offset -= total;

                  // Only render cards within viewable distance (-2 to +2)
                  const isVisible = Math.abs(offset) <= 2;
                  if (!isVisible) return null;

                  const isSelected = offset === 0;
                  const isLive = Boolean(member.isLive);

                  // 3D Spatial Transform Matrix
                  let translateX = 0;
                  let translateZ = 0;
                  let rotateY = 0;
                  let scale = 1;
                  let opacity = 1;
                  let zIndex = 10;

                  if (isSelected) {
                    translateX = 0;
                    translateZ = 80;
                    rotateY = 0;
                    scale = 1.05;
                    opacity = 1;
                    zIndex = 30;
                  } else if (offset === -1) {
                    translateX = -95;
                    translateZ = -70;
                    rotateY = 28;
                    scale = 0.88;
                    opacity = 0.75;
                    zIndex = 20;
                  } else if (offset === 1) {
                    translateX = 95;
                    translateZ = -70;
                    rotateY = -28;
                    scale = 0.88;
                    opacity = 0.75;
                    zIndex = 20;
                  } else if (offset === -2) {
                    translateX = -175;
                    translateZ = -160;
                    rotateY = 42;
                    scale = 0.75;
                    opacity = 0.4;
                    zIndex = 10;
                  } else if (offset === 2) {
                    translateX = 175;
                    translateZ = -160;
                    rotateY = -42;
                    scale = 0.75;
                    opacity = 0.4;
                    zIndex = 10;
                  }

                  // Rank border color
                  let rankRing = isDark ? 'border-white/10' : 'border-zinc-300';
                  if (member.rank === 'OG') rankRing = 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]';
                  else if (member.rank === 'Under OG') rankRing = 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]';
                  else if (member.rank === 'Young Bloods') rankRing = 'border-cyan-400/80';

                  const subscribersDisplay = getSubscribersDisplay(member);

                  return (
                    <div
                      key={member.channelId || member.name}
                      onClick={() => {
                        if (!isSelected) {
                          setActiveIndex(idx);
                        }
                      }}
                      style={{
                        transform: `translate3d(${translateX}%, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                        zIndex,
                        opacity,
                        transition: 'all 500ms cubic-bezier(0.25, 1, 0.5, 1)',
                      }}
                      className={`absolute inset-0 rounded-xs overflow-hidden border flex flex-col justify-between cursor-pointer select-none transition-shadow ${
                        isSelected
                          ? isDark
                            ? 'border-red-500 bg-[#0E0609] shadow-[0_20px_50px_rgba(220,38,38,0.45)] ring-2 ring-red-500/60'
                            : 'border-red-600 bg-white shadow-[0_20px_40px_rgba(220,38,38,0.25)] ring-2 ring-red-500'
                          : isDark
                            ? 'border-white/15 bg-[#090406]/95 hover:border-white/40 shadow-xl'
                            : 'border-zinc-200 bg-white/95 hover:border-zinc-400 shadow-md'
                      }`}
                    >
                      {/* Top Accent Strip */}
                      {isLive ? (
                        <div className="h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 animate-pulse shrink-0" />
                      ) : (
                        <div className="h-1 bg-gradient-to-r from-red-600/40 via-red-900/20 to-transparent shrink-0" />
                      )}

                      {/* Real YouTube Channel Banner Header */}
                      <div className={`relative h-28 sm:h-32 w-full overflow-hidden shrink-0 border-b ${
                        isDark ? 'bg-black/80 border-white/10' : 'bg-zinc-100 border-zinc-200'
                      }`}>
                        {member.banner ? (
                          <img
                            src={member.banner}
                            alt={`${member.name} Banner`}
                            className="w-full h-full object-cover object-center opacity-85 group-hover:opacity-100 transition-opacity"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${
                            isDark ? 'bg-gradient-to-r from-red-950/40 via-[#16080E] to-black' : 'bg-gradient-to-r from-red-100 via-zinc-100 to-zinc-200'
                          }`}>
                            <span className={`text-[10px] font-mono-tech tracking-widest uppercase ${
                              isDark ? 'text-white/30' : 'text-zinc-400 font-bold'
                            }`}>
                              4BLOODS CREATOR
                            </span>
                          </div>
                        )}
                        <div className={`absolute inset-0 bg-gradient-to-t via-transparent pointer-events-none ${
                          isDark ? 'from-[#0E0609] to-black/40' : 'from-white to-black/20'
                        }`} />

                        {/* Popout Zoom Action Button */}
                        {isSelected && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPopoutMember(member);
                            }}
                            className={`absolute top-2.5 right-2.5 p-1.5 text-[10px] font-mono-tech font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors shadow-lg ${
                              isDark
                                ? 'bg-black/80 hover:bg-red-600 text-white border border-white/20'
                                : 'bg-white/90 hover:bg-red-600 text-zinc-800 hover:text-white border border-zinc-300'
                            }`}
                            title="Buka Zoom / Dossier Kreator"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">ZOOM</span>
                          </button>
                        )}
                      </div>

                      {/* Card Content Body */}
                      <div className="p-4 sm:p-5 pt-0 space-y-3 -mt-10 relative z-10 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Avatar & Badges */}
                          <div className="flex items-end justify-between gap-3">
                            <div className="relative">
                              <div
                                className={`w-16 h-16 rounded-full overflow-hidden border-2 ${rankRing} shadow-2xl ${
                                  isDark ? 'bg-black' : 'bg-zinc-100'
                                }`}
                              >
                                <img
                                  src={member.avatar || '/assets/logo_v2.png'}
                                  alt={member.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/assets/logo_v2.png';
                                  }}
                                />
                              </div>
                              {isLive && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-600 border-2 border-black flex items-center justify-center">
                                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              {isLive ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white text-[10px] font-mono-tech font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(220,38,38,0.7)] animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                  <span>LIVE SEKARANG</span>
                                </span>
                              ) : (
                                <span className={`text-[10px] font-mono-tech uppercase px-2 py-0.5 border ${
                                  isDark ? 'text-zinc-400 bg-white/5 border-white/10' : 'text-zinc-600 bg-zinc-100 border-zinc-200'
                                }`}>
                                  OFFLINE
                                </span>
                              )}

                              <span className={`px-2 py-0.5 text-[9px] font-mono-tech font-bold uppercase border ${
                                isDark ? 'bg-red-600/20 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
                              }`}>
                                {member.rank}
                              </span>
                            </div>
                          </div>

                          {/* Identity */}
                          <div className="space-y-1 mt-3">
                            <h3 className={`font-display text-2xl sm:text-3xl tracking-wider leading-none ${
                              isDark ? 'text-white' : 'text-zinc-900'
                            }`}>
                              {member.name}
                            </h3>
                            <p className={`text-[11px] font-mono-tech font-medium ${
                              isDark ? 'text-red-400' : 'text-red-600'
                            }`}>
                              {member.handle || '@creator'}
                            </p>
                            {member.role && (
                              <p className={`text-xs font-mono-tech leading-snug break-words pt-0.5 ${
                                isDark ? 'text-zinc-400' : 'text-zinc-600'
                              }`}>
                                {member.role}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* VERIFIED SUBSCRIBER BANNER (ZERO ELLIPSIS GUARANTEED) */}
                        <div className={`space-y-2 pt-2 border-t ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
                          <div className={`w-full px-3 py-2 flex items-center justify-between gap-2 rounded-xs border ${
                            isDark ? 'bg-red-950/40 border-red-500/30' : 'bg-red-50/80 border-red-200'
                          }`}>
                            <span className={`flex items-center gap-1.5 text-xs font-mono-tech shrink-0 ${
                              isDark ? 'text-zinc-300' : 'text-zinc-700'
                            }`}>
                              <YouTubeIcon className="w-4 h-4 text-red-500 shrink-0" />
                              <span className={`font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>SUBSCRIBERS:</span>
                            </span>
                            <span className={`text-xs sm:text-sm font-mono-tech font-extrabold whitespace-nowrap shrink-0 tracking-wide ${
                              isDark ? 'text-white' : 'text-zinc-900'
                            }`}>
                              {subscribersDisplay}
                            </span>
                          </div>

                          {/* Live Stream Title Banner */}
                          {isLive && member.streamTitle && (
                            <div className={`p-2 border space-y-1 ${
                              isDark ? 'bg-red-950/70 border-red-500/50' : 'bg-red-50 border-red-200'
                            }`}>
                              <div className={`text-[10px] font-mono-tech font-bold flex items-center justify-between ${
                                isDark ? 'text-red-400' : 'text-red-700'
                              }`}>
                                <span>🔴 STREAMING SEKARANG</span>
                                {member.viewerCount && (
                                  <span className={`flex items-center gap-1 ${isDark ? 'text-white' : 'text-zinc-900 font-bold'}`}>
                                    <Eye className="w-3 h-3 text-red-500" />
                                    {Number(member.viewerCount).toLocaleString('id-ID')}
                                  </span>
                                )}
                              </div>
                              <p className={`text-[11px] font-mono-tech line-clamp-2 leading-tight ${
                                isDark ? 'text-zinc-200' : 'text-zinc-800'
                              }`}>
                                &ldquo;{member.streamTitle}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex items-center gap-2">
                          {isLive ? (
                            <a
                              href={`https://www.youtube.com/watch?v=${member.videoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>NONTON LIVE</span>
                            </a>
                          ) : (
                            <a
                              href={`https://www.youtube.com/channel/${member.channelId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex-1 py-2.5 font-mono-tech text-xs uppercase tracking-wider border flex items-center justify-center gap-1.5 transition-all ${
                                isDark
                                  ? 'bg-white/10 hover:bg-red-600 hover:text-white text-zinc-200 border-white/15'
                                  : 'bg-zinc-100 hover:bg-red-600 hover:text-white text-zinc-700 border-zinc-200 hover:border-red-600'
                              }`}
                            >
                              <YouTubeIcon className="w-3.5 h-3.5" />
                              <span>KANAL YOUTUBE</span>
                            </a>
                          )}

                          <Link
                            href={`/cam?watch=${member.channelId}`}
                            className={`p-2.5 border transition-colors ${
                              isDark
                                ? 'bg-black/80 hover:bg-white text-zinc-300 hover:text-black border-white/20'
                                : 'bg-zinc-100 hover:bg-zinc-900 text-zinc-700 hover:text-white border-zinc-200'
                            }`}
                            title="Buka di Multi-POV Cam"
                          >
                            <Tv className="w-4 h-4" />
                          </Link>

                          {member.featuredVideoId && onOpenVideo && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenVideo({
                                  videoId: member.featuredVideoId!,
                                  title: member.featuredTitle || member.name,
                                  streamer: member.name,
                                });
                              }}
                              className={`p-2.5 border transition-colors cursor-pointer ${
                                isDark
                                  ? 'bg-black/80 hover:bg-red-600 text-zinc-300 hover:text-white border-white/20'
                                  : 'bg-zinc-100 hover:bg-red-600 text-zinc-700 hover:text-white border-zinc-200'
                              }`}
                              title="Putar Cuplikan POV"
                            >
                              <Play className="w-4 h-4 fill-current" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Creator Thumbnails Filmstrip / Selector */}
          {filteredList.length > 0 && (
            <div className="space-y-2">
              <div className={`flex items-center justify-between text-xs font-mono-tech px-1 ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                <span className="flex items-center gap-1.5 uppercase font-bold text-red-500">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PILIH CEPAT KREATOR (KLIK UNTUK MEMUNCULKAN)</span>
                </span>
                <span>
                  {activeIndex + 1} / {filteredList.length}
                </span>
              </div>

              <div className={`flex items-center gap-2 overflow-x-auto p-2 border scrollbar-thin scrollbar-thumb-red-600 ${
                isDark ? 'bg-black/60 border-white/10' : 'bg-white/90 border-zinc-200 shadow-sm'
              }`}>
                {filteredList.map((m, i) => {
                  const isCur = i === activeIndex;
                  return (
                    <button
                      key={m.channelId}
                      onClick={() => setActiveIndex(i)}
                      className={`shrink-0 flex items-center gap-2 px-3 py-1.5 border rounded-xs cursor-pointer transition-all ${
                        isCur
                          ? isDark
                            ? 'bg-red-600/30 border-red-500 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)] scale-105'
                            : 'bg-red-600 border-red-600 text-white shadow-sm scale-105'
                          : isDark
                            ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/25'
                            : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-200'
                      }`}
                    >
                      <div className={`relative w-6 h-6 rounded-full overflow-hidden shrink-0 ${
                        isDark ? 'bg-black' : 'bg-zinc-200'
                      }`}>
                        <img
                          src={m.avatar || '/assets/logo_v2.png'}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                        {m.isLive && (
                          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-red-600 ring-1 ring-black" />
                        )}
                      </div>
                      <span className={`text-xs font-mono-tech font-bold whitespace-nowrap ${
                        isCur ? 'text-white' : isDark ? 'text-zinc-300' : 'text-zinc-800'
                      }`}>
                        {m.name}
                      </span>
                      {m.subscribersText && (
                        <span className={`text-[10px] font-mono-tech whitespace-nowrap ${
                          isDark ? 'text-zinc-400' : 'text-zinc-500'
                        }`}>
                          ({m.subscribersText.split(' ')[0]})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
          MODE B: RESPONSIVE GRID VIEW (BACKUP / ALL AT A GLANCE)
      =================================================================== */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredList.map((member) => {
            const isLive = Boolean(member.isLive);
            const subscribersDisplay = getSubscribersDisplay(member);

            let rankRing = isDark ? 'border-white/10' : 'border-zinc-300';
            if (member.rank === 'OG') rankRing = 'border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.25)]';
            else if (member.rank === 'Under OG') rankRing = 'border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.25)]';
            else if (member.rank === 'Young Bloods') rankRing = 'border-cyan-400/60';

            return (
              <div
                key={member.channelId || member.name}
                className={`relative border overflow-hidden transition-all duration-300 group flex flex-col justify-between ${
                  isLive
                    ? isDark
                      ? 'bg-gradient-to-br from-[#1C080E]/95 via-[#110508]/90 to-[#0A0205] border-red-500/80 shadow-[0_10px_35px_rgba(220,38,38,0.25)] hover:border-red-400 hover:-translate-y-1'
                      : 'bg-gradient-to-br from-red-50/90 via-white to-red-50/50 border-red-500/80 shadow-[0_10px_35px_rgba(220,38,38,0.15)] hover:border-red-500 hover:-translate-y-1'
                    : isDark
                      ? 'bg-[#0B0608] border-white/10 hover:border-red-500/50 hover:bg-[#12070C] hover:-translate-y-0.5'
                      : 'bg-white border-zinc-200 shadow-sm hover:shadow-lg hover:border-red-400 hover:-translate-y-0.5'
                }`}
              >
                {/* Top Accent Strip */}
                {isLive ? (
                  <div className="h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 animate-pulse" />
                ) : (
                  <div className="h-0.5 bg-gradient-to-r from-red-600/40 via-transparent to-transparent group-hover:h-1 group-hover:from-red-500 transition-all" />
                )}

                {/* Banner */}
                <div className={`relative h-24 sm:h-28 w-full overflow-hidden border-b shrink-0 ${
                  isDark ? 'bg-black/80 border-white/10' : 'bg-zinc-100 border-zinc-200'
                }`}>
                  {member.banner ? (
                    <img
                      src={member.banner}
                      alt={`${member.name} Banner`}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${
                      isDark ? 'bg-gradient-to-r from-red-950/40 via-[#16080E] to-black' : 'bg-gradient-to-r from-red-100 via-zinc-100 to-zinc-200'
                    }`}>
                      <span className={`text-[10px] font-mono-tech tracking-widest uppercase ${
                        isDark ? 'text-white/30' : 'text-zinc-400 font-bold'
                      }`}>
                        4BLOODS CREATOR
                      </span>
                    </div>
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-t via-transparent pointer-events-none ${
                    isDark ? 'from-[#0B0608] to-black/40' : 'from-white to-black/20'
                  }`} />
                </div>

                <div className="p-5 pt-0 space-y-4 -mt-10 relative z-10 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header: Avatar + Live Badge / Rank */}
                    <div className="flex items-end justify-between gap-3">
                      <div className="relative">
                        <div
                          className={`w-16 h-16 rounded-full overflow-hidden border-2 ${rankRing} shadow-2xl ${
                            isDark ? 'bg-black' : 'bg-zinc-100'
                          }`}
                        >
                          <img
                            src={member.avatar || '/assets/logo_v2.png'}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/logo_v2.png';
                            }}
                          />
                        </div>
                        {isLive && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-600 border-2 border-black flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-600 text-white text-[10px] font-mono-tech font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(220,38,38,0.6)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            <span>LIVE SEKARANG</span>
                          </span>
                        ) : (
                          <span className={`text-[10px] font-mono-tech uppercase px-2 py-0.5 border ${
                            isDark ? 'text-zinc-500 bg-white/5 border-white/5' : 'text-zinc-600 bg-zinc-100 border-zinc-200'
                          }`}>
                            OFFLINE
                          </span>
                        )}

                        <span className={`px-2 py-0.5 text-[9px] font-mono-tech font-bold uppercase border ${
                          isDark ? 'bg-red-600/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {member.rank}
                        </span>
                      </div>
                    </div>

                    {/* Creator Identity */}
                    <div className="space-y-1 mt-3">
                      <h3 className={`font-display text-xl sm:text-2xl tracking-wider transition-colors ${
                        isDark ? 'text-white group-hover:text-red-400' : 'text-zinc-900 group-hover:text-red-600'
                      }`}>
                        {member.name}
                      </h3>
                      <p className={`text-[11px] font-mono-tech font-medium ${
                        isDark ? 'text-red-400' : 'text-red-600'
                      }`}>
                        {member.handle || '@creator'}
                      </p>
                      {member.role && (
                        <p className={`text-xs font-mono-tech leading-snug break-words pt-0.5 ${
                          isDark ? 'text-zinc-400' : 'text-zinc-600'
                        }`}>
                          {member.role}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Clean Channel Info Row (ZERO ELLIPSIS SUBSCRIBERS) */}
                  <div className={`pt-3 border-t space-y-2 ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
                    <div className="flex items-center justify-between text-xs font-mono-tech gap-2">
                      <span className="flex items-center gap-1.5 truncate">
                        <YouTubeIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className={`truncate font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                          {member.handle || '@youtube'}
                        </span>
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-xs border whitespace-nowrap shrink-0 ${
                        isDark ? 'text-white bg-red-600/20 border-red-500/30' : 'text-red-700 bg-red-50 border-red-200'
                      }`}>
                        {subscribersDisplay}
                      </span>
                    </div>

                    {/* Active Live Stream Title Callout */}
                    {isLive && member.streamTitle && (
                      <div className={`p-2.5 border space-y-1 ${
                        isDark ? 'bg-red-950/60 border-red-500/40' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className={`text-[10px] font-mono-tech font-bold flex items-center justify-between ${
                          isDark ? 'text-red-400' : 'text-red-700'
                        }`}>
                          <span>🔴 STREAMING SEKARANG</span>
                          {member.viewerCount && (
                            <span className={`flex items-center gap-1 ${isDark ? 'text-white' : 'text-zinc-900 font-bold'}`}>
                              <Eye className="w-3 h-3 text-red-500" />
                              {Number(member.viewerCount).toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] font-mono-tech line-clamp-2 leading-tight ${
                          isDark ? 'text-zinc-200' : 'text-zinc-800'
                        }`}>
                          &ldquo;{member.streamTitle}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    {isLive ? (
                      <a
                        href={`https://www.youtube.com/watch?v=${member.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all hover:scale-[1.02]"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>NONTON LIVE</span>
                      </a>
                    ) : (
                      <a
                        href={`https://www.youtube.com/channel/${member.channelId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 py-2.5 font-mono-tech text-xs uppercase tracking-wider border flex items-center justify-center gap-1.5 transition-all ${
                          isDark
                            ? 'bg-white/5 hover:bg-red-600 hover:text-white text-zinc-300 border-white/10'
                            : 'bg-zinc-100 hover:bg-red-600 hover:text-white text-zinc-700 border-zinc-200 hover:border-red-600'
                        }`}
                      >
                        <YouTubeIcon className="w-3.5 h-3.5" />
                        <span>KANAL YOUTUBE</span>
                      </a>
                    )}

                    <Link
                      href={`/cam?watch=${member.channelId}`}
                      className={`p-2.5 border transition-colors ${
                        isDark
                          ? 'bg-white/5 hover:bg-white hover:text-black text-zinc-400 border-white/10'
                          : 'bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-600 border-zinc-200'
                      }`}
                      title="Tonton di 4Bloods Cam"
                    >
                      <Tv className="w-3.5 h-3.5" />
                    </Link>

                    {member.featuredVideoId && onOpenVideo && (
                      <button
                        onClick={() =>
                          onOpenVideo({
                            videoId: member.featuredVideoId!,
                            title: member.featuredTitle || member.name,
                            streamer: member.name,
                          })
                        }
                        className={`p-2.5 border transition-colors cursor-pointer ${
                          isDark
                            ? 'bg-white/5 hover:bg-red-600 hover:text-white text-zinc-400 border-white/10'
                            : 'bg-zinc-100 hover:bg-red-600 hover:text-white text-zinc-600 border-zinc-200'
                        }`}
                        title="Putar Cuplikan Unggulan"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================
          CINEMATIC DOSSIER POPOUT MODAL ("MUNCUL KELUAR")
      =================================================================== */}
      {popoutMember && (
        <div
          onClick={() => setPopoutMember(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-2xl border-2 border-red-500 overflow-hidden shadow-2xl ${
              isDark
                ? 'bg-[#0E0609] text-white shadow-[0_0_60px_rgba(220,38,38,0.5)]'
                : 'bg-white text-zinc-900 shadow-[0_20px_60px_rgba(0,0,0,0.3)]'
            }`}
          >
            {/* Top Close Button */}
            <button
              onClick={() => setPopoutMember(null)}
              className={`absolute top-3 right-3 z-20 p-2 cursor-pointer transition-colors border ${
                isDark
                  ? 'bg-black/80 hover:bg-red-600 text-white border-white/20'
                  : 'bg-white/90 hover:bg-red-600 text-zinc-800 hover:text-white border-zinc-300'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Banner */}
            <div className={`relative h-44 sm:h-52 w-full overflow-hidden ${isDark ? 'bg-black' : 'bg-zinc-100'}`}>
              {popoutMember.banner ? (
                <img
                  src={popoutMember.banner}
                  alt={popoutMember.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full ${
                  isDark ? 'bg-gradient-to-r from-red-950 via-[#180810] to-black' : 'bg-gradient-to-r from-red-100 via-zinc-100 to-zinc-200'
                }`} />
              )}
              <div className={`absolute inset-0 bg-gradient-to-t via-transparent pointer-events-none ${
                isDark ? 'from-[#0E0609] to-black/50' : 'from-white to-black/30'
              }`} />
            </div>

            {/* Dossier Content */}
            <div className={`p-6 pt-0 space-y-5 -mt-14 relative z-10 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              <div className="flex items-end justify-between gap-4">
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full overflow-hidden border-4 border-red-500 shadow-2xl ${
                    isDark ? 'bg-black' : 'bg-zinc-100'
                  }`}>
                    <img
                      src={popoutMember.avatar || '/assets/logo_v2.png'}
                      alt={popoutMember.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {popoutMember.isLive && (
                    <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-red-600 border-2 border-black flex items-center justify-center">
                      <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="px-3 py-1 bg-red-600 text-white font-mono-tech text-xs font-bold uppercase tracking-wider">
                    {popoutMember.rank}
                  </span>
                  <span className={`text-xs font-mono-tech ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    IME RP // 4BLOODS SYNDICATE
                  </span>
                </div>
              </div>

              <div>
                <h3 className={`font-display text-4xl sm:text-5xl uppercase tracking-wider ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}>
                  {popoutMember.name}
                </h3>
                <p className={`text-sm font-mono-tech font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  {popoutMember.handle || '@youtube_creator'}
                </p>
                {popoutMember.role && (
                  <p className={`text-xs font-mono-tech mt-1 leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {popoutMember.role}
                  </p>
                )}
              </div>

              {/* Prominent Subscriber Badge */}
              <div className={`p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark ? 'bg-red-950/40 border-red-500/40' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  <YouTubeIcon className="w-5 h-5 text-red-500 shrink-0" />
                  <span className={`font-mono-tech text-xs font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    VERIFIED SUBSCRIBERS:
                  </span>
                </div>
                <span className={`text-lg font-mono-tech font-extrabold whitespace-nowrap ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}>
                  {getSubscribersDisplay(popoutMember)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {popoutMember.isLive ? (
                  <a
                    href={`https://www.youtube.com/watch?v=${popoutMember.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.6)]"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>TONTON LIVE SEKARANG</span>
                  </a>
                ) : (
                  <a
                    href={`https://www.youtube.com/channel/${popoutMember.channelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <YouTubeIcon className="w-4 h-4" />
                    <span>BUKA KANAL YOUTUBE</span>
                  </a>
                )}

                <Link
                  href={`/cam?watch=${popoutMember.channelId}`}
                  className={`px-5 py-3 font-mono-tech text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
                    isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-black'
                  }`}
                >
                  <Tv className="w-4 h-4 text-red-600" />
                  <span>BUKA DI CAM</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
