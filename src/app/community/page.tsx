'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import StickyAudioPlayer from '@/components/StickyAudioPlayer';
import ShowroomCodex from '@/components/ShowroomCodex';
import Tilt3DCard from '@/components/Tilt3DCard';
import {
  Users,
  Tv,
  Disc3,
  Play,
  ExternalLink,
  Search,
  Award,
  Sparkles,
  Calendar,
  Share2,
  CheckCircle,
  MessageSquare,
  Shield,
  X,
  Radio,
  ShoppingBag,
  Film,
  Flame,
  Eye,
  TrendingUp,
  Star,
  Crown,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

// Authentic Social SVG Icons
function YouTubeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

import curatedData from '@/data/community/curated.json';
import ytData from '@/data/community/youtube.json';
import igData from '@/data/community/instagram.json';
import ttData from '@/data/community/tiktok.json';
import dcData from '@/data/community/discord.json';
import ltData from '@/data/community/linktree.json';
import musicData from '@/data/community/music.json';
import rosterData from '@/data/roster.json';

export default function CommunityPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [streamers, setStreamers] = useState<any[]>(rosterData);
  const [liveCount, setLiveCount] = useState<number>(1);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterFilter, setRosterFilter] = useState<'ALL' | 'LIVE' | 'OG' | 'Under OG' | 'Young Bloods' | 'Member'>('ALL');
  const [rosterSort, setRosterSort] = useState<'live' | 'rank' | 'name' | 'subs'>('live');

  // Music Player
  const [trackFilter, setTrackFilter] = useState<'ALL' | 'MV' | 'DISS'>('ALL');
  const [selectedTrackId, setSelectedTrackId] = useState<string>(musicData[0]?.id || '');

  // Modals
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    title: string;
    subtitle?: string;
  } | null>(null);
  const [videoModal, setVideoModal] = useState<{
    videoId: string;
    title: string;
    streamer: string;
  } | null>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('4bg_theme') || localStorage.getItem('4bs_cam_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    } catch {}

    fetch('/api/streamers')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.streamers) {
          setStreamers(data.streamers);
          setLiveCount(data.liveCount || 0);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.style.colorScheme = 'light';
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('4bg_theme', next);
      localStorage.setItem('4bs_cam_theme', next);
    } catch {}
  };

  const filteredTracks = musicData.filter((track: any) => {
    if (trackFilter === 'MV') return track.type !== 'DISS TRACK';
    if (trackFilter === 'DISS') return track.type === 'DISS TRACK';
    return true;
  });

  const activeTrack =
    filteredTracks.find((t: any) => t.id === selectedTrackId) ||
    filteredTracks[0] ||
    musicData[0];

  const filteredRoster = useMemo(() => {
    let list = [...streamers];
    const q = rosterSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((m: any) =>
        m.name?.toLowerCase().includes(q) ||
        (m.handle && m.handle.toLowerCase().includes(q)) ||
        (m.role && m.role.toLowerCase().includes(q))
      );
    }
    if (rosterFilter === 'LIVE') list = list.filter((m: any) => Boolean(m.isLive));
    else if (rosterFilter === 'OG') list = list.filter((m: any) => m.rank === 'OG');
    else if (rosterFilter === 'Under OG') list = list.filter((m: any) => m.rank === 'Under OG');
    else if (rosterFilter === 'Young Bloods') list = list.filter((m: any) => m.rank === 'Young Bloods');
    else if (rosterFilter === 'Member') list = list.filter((m: any) => m.rank === 'Member');

    const rankWeight: Record<string, number> = {
      OG: 1,
      'Under OG': 2,
      'Young Bloods': 3,
      Member: 4,
    };

    list.sort((a: any, b: any) => {
      if (rosterSort === 'live') {
        if (Boolean(a.isLive) !== Boolean(b.isLive)) return a.isLive ? -1 : 1;
        if (a.isLive && b.isLive) return (b.viewerCount || 0) - (a.viewerCount || 0);
        return (rankWeight[a.rank] || 9) - (rankWeight[b.rank] || 9);
      }
      if (rosterSort === 'rank') {
        return (rankWeight[a.rank] || 9) - (rankWeight[b.rank] || 9);
      }
      if (rosterSort === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (rosterSort === 'subs') {
        return (b.subscribers || 0) - (a.subscribers || 0);
      }
      return 0;
    });

    return list;
  }, [streamers, rosterSearch, rosterFilter, rosterSort]);

  const liveMembers = useMemo(() => streamers.filter((s: any) => s.isLive), [streamers]);

  return (
    <div
      className={`theme-smooth min-h-screen relative selection:bg-red-600 selection:text-white ${
        isDark ? 'bg-[#070506] text-[#F4F4F6]' : 'bg-[#F4F1EC] text-[#141113]'
      }`}
    >
      <Navbar liveCount={liveCount} theme={theme} onToggleTheme={toggleTheme} />
      <StickyAudioPlayer isDark={isDark} />

      {/* Hero Community & Scale */}
      <section
        className={`relative pt-32 pb-20 border-b overflow-hidden ${
          isDark
            ? 'bg-[#090306] border-red-500/25'
            : 'bg-gradient-to-b from-[#FAF8F5] via-[#EDE7DE] to-[#F5F0E8] border-zinc-200'
        }`}
      >
        {/* Cinematic Atmospheric Turf & Council Backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/assets/generated/fanart_council.webp"
            alt="Council Backdrop"
            className={`w-full h-full object-cover object-center ${
              isDark ? 'opacity-30 brightness-70 contrast-120 blur-[0.5px]' : 'opacity-15 brightness-95'
            }`}
          />
          <div
            className={`absolute inset-0 ${
              isDark
                ? 'bg-gradient-to-b from-[#090306]/80 via-[#090306]/70 to-[#090306]'
                : 'bg-gradient-to-b from-white/85 via-white/70 to-[#FAF8F5]'
            }`}
          />
          <div
            style={{
              background:
                'radial-gradient(circle at 65% 35%, rgba(220,38,38,0.22) 0%, rgba(9,3,6,0.92) 75%)',
            }}
            className="absolute inset-0 pointer-events-none"
          />
          <div className="absolute inset-0 bg-film-grain opacity-50" />
          <div
            className={`absolute inset-0 ${
              isDark ? 'bg-tactical-grid opacity-20' : 'bg-cam-light-grid opacity-25'
            }`}
          />
          <div
            className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[130px] pointer-events-none ${
              isDark ? 'bg-red-600/15' : 'bg-red-500/5'
            }`}
          />
          <div
            className={`absolute top-1/2 -right-24 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none ${
              isDark ? 'bg-red-900/25' : 'bg-red-400/10'
            }`}
          />
        </div>

        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 relative z-10 space-y-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/15 border border-red-500/30 text-red-500 text-xs font-mono-tech font-bold tracking-widest uppercase backdrop-blur-md">
                <Users className="w-3.5 h-3.5" />
                <span>COMMUNITY ECOSYSTEM & ACHIEVEMENTS // IME RP</span>
              </div>
              <h1
                className={`font-display text-5xl sm:text-7xl lg:text-8xl tracking-wider uppercase leading-[0.92] ${
                  isDark ? 'text-white' : 'text-zinc-950'
                }`}
              >
                THE <span className="text-red-600 drop-shadow-[0_0_35px_rgba(220,38,38,0.35)]">4BLOODS</span> ARMY
              </h1>
              <p
                className={`text-sm sm:text-base font-mono-tech leading-relaxed max-w-2xl ${
                  isDark ? 'text-zinc-300' : 'text-zinc-700'
                }`}
              >
                Pusat data terverifikasi skala komunitas 4Bloods: 54 streamer aktif, Discord beranggotakan 7.200+ warga,
                hub YouTube @4blood-plug, rilis pers Instagram @4bloodmedia, serta catatan pencapaian turnamen & charity sosial.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={curatedData.socialHub.discord.invite}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-mono-tech text-xs font-bold uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-[0_0_25px_rgba(88,101,242,0.35)] hover:scale-105"
              >
                <MessageSquare className="w-4 h-4" />
                <span>JOIN DISCORD ({dcData.members ? `${dcData.members.toLocaleString('id-ID')}` : '7.2K+'})</span>
              </a>

              <Link
                href="/cam"
                className="px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-[0_0_25px_rgba(220,38,38,0.45)] hover:scale-105"
              >
                <Tv className="w-4 h-4" />
                <span>4BLOODS CAM ({liveCount} LIVE)</span>
              </Link>
            </div>
          </div>

          {/* Luxury Bento Metric Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Card 01: Discord */}
            <div className={`relative p-5 sm:p-6 border overflow-hidden rounded-xs transition-all duration-300 group hover:-translate-y-1 ${
              isDark
                ? 'bg-gradient-to-br from-[#180A10]/95 via-[#100508]/90 to-[#090306]/95 border-red-500/25 hover:border-red-500/60 shadow-[0_12px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(88,101,242,0.25)]'
                : 'bg-white border-zinc-300 shadow-md hover:shadow-xl hover:border-red-500'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#5865F2] via-red-500 to-transparent group-hover:h-1 transition-all" />
              <div className="absolute -right-3 -bottom-3 text-white/[0.04] group-hover:text-white/[0.08] transition-colors pointer-events-none">
                <MessageSquare className="w-20 h-20" />
              </div>
              <div className="relative z-10 space-y-2">
                <div className="text-[10px] font-mono-tech text-red-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2]" />
                  <span>DISCORD COMMUNITY</span>
                </div>
                <div className={`font-display text-3xl sm:text-4xl tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {dcData.members ? dcData.members.toLocaleString('id-ID') : '7.229'}
                </div>
                <div className="text-[11px] font-mono-tech text-zinc-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{dcData.online ? dcData.online.toLocaleString('id-ID') : '1.019'} Online Sekarang</span>
                </div>
              </div>
            </div>

            {/* Card 02: YouTube Plug */}
            <div className={`relative p-5 sm:p-6 border overflow-hidden rounded-xs transition-all duration-300 group hover:-translate-y-1 ${
              isDark
                ? 'bg-gradient-to-br from-[#180A10]/95 via-[#100508]/90 to-[#090306]/95 border-red-500/25 hover:border-red-500/60 shadow-[0_12px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(220,38,38,0.3)]'
                : 'bg-white border-zinc-300 shadow-md hover:shadow-xl hover:border-red-500'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-red-500 to-transparent group-hover:h-1 transition-all" />
              <div className="absolute -right-3 -bottom-3 text-red-600/[0.05] group-hover:text-red-600/[0.1] transition-colors pointer-events-none">
                <YouTubeIcon className="w-20 h-20" />
              </div>
              <div className="relative z-10 space-y-2">
                <div className="text-[10px] font-mono-tech text-red-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <span>YOUTUBE @4BLOOD-PLUG</span>
                </div>
                <div className={`font-display text-3xl sm:text-4xl tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {ytData.channel?.subscribersText || '8.99K'}
                </div>
                <div className="text-[11px] font-mono-tech text-zinc-400">
                  {ytData.channel?.videoCountText || '16 videos'} // 628K+ views
                </div>
              </div>
            </div>

            {/* Card 03: Instagram */}
            <div className={`relative p-5 sm:p-6 border overflow-hidden rounded-xs transition-all duration-300 group hover:-translate-y-1 ${
              isDark
                ? 'bg-gradient-to-br from-[#180A10]/95 via-[#100508]/90 to-[#090306]/95 border-red-500/25 hover:border-red-500/60 shadow-[0_12px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(236,72,153,0.25)]'
                : 'bg-white border-zinc-300 shadow-md hover:shadow-xl hover:border-red-500'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 via-red-500 to-transparent group-hover:h-1 transition-all" />
              <div className="absolute -right-3 -bottom-3 text-pink-500/[0.05] group-hover:text-pink-500/[0.1] transition-colors pointer-events-none">
                <InstagramIcon className="w-20 h-20" />
              </div>
              <div className="relative z-10 space-y-2">
                <div className="text-[10px] font-mono-tech text-red-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                  <span>INSTAGRAM @4BLOODMEDIA</span>
                </div>
                <div className={`font-display text-3xl sm:text-4xl tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {igData.followers ? `${igData.followers.toLocaleString('id-ID')}` : '4.394'}
                </div>
                <div className="text-[11px] font-mono-tech text-zinc-400">
                  {igData.posts || 30} Official Press Releases
                </div>
              </div>
            </div>

            {/* Card 04: TikTok */}
            <div className={`relative p-5 sm:p-6 border overflow-hidden rounded-xs transition-all duration-300 group hover:-translate-y-1 ${
              isDark
                ? 'bg-gradient-to-br from-[#180A10]/95 via-[#100508]/90 to-[#090306]/95 border-red-500/25 hover:border-red-500/60 shadow-[0_12px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(220,38,38,0.25)]'
                : 'bg-white border-zinc-300 shadow-md hover:shadow-xl hover:border-red-500'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-pink-500 to-transparent group-hover:h-1 transition-all" />
              <div className="absolute -right-3 -bottom-3 text-white/[0.04] group-hover:text-white/[0.08] transition-colors pointer-events-none">
                <Film className="w-20 h-20" />
              </div>
              <div className="relative z-10 space-y-2">
                <div className="text-[10px] font-mono-tech text-red-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>TIKTOK @4BLOODMEDIA</span>
                </div>
                <div className={`font-display text-3xl sm:text-4xl tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {ttData.followers ? `${ttData.followers.toLocaleString('id-ID')}` : '2.577'}
                </div>
                <div className="text-[11px] font-mono-tech text-zinc-400">
                  {ttData.likes ? `${ttData.likes.toLocaleString('id-ID')} Likes` : '27.3K Likes'}
                </div>
              </div>
            </div>

            {/* Card 05: Roster Kreator */}
            <div className={`relative p-5 sm:p-6 border col-span-2 md:col-span-1 overflow-hidden rounded-xs transition-all duration-300 group hover:-translate-y-1 ${
              isDark
                ? 'bg-gradient-to-br from-[#200A13]/95 via-[#14050B]/90 to-[#0A0306]/95 border-red-500/35 hover:border-red-500/80 shadow-[0_12px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]'
                : 'bg-white border-zinc-300 shadow-md hover:shadow-xl hover:border-red-500'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-amber-500 to-transparent group-hover:h-1 transition-all" />
              <div className="absolute -right-3 -bottom-3 text-red-600/[0.06] group-hover:text-red-600/[0.12] transition-colors pointer-events-none">
                <Radio className="w-20 h-20" />
              </div>
              <div className="relative z-10 space-y-2">
                <div className="text-[10px] font-mono-tech text-red-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  <span>ROSTER KREATOR</span>
                </div>
                <div className={`font-display text-3xl sm:text-4xl tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  54 STREAMER
                </div>
                <div className="text-[11px] font-mono-tech text-zinc-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <span className="text-red-400 font-bold">{liveCount} Live Sekarang</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Hub Cards */}
      <section className="max-w-[1520px] mx-auto px-4 sm:px-8 py-14 space-y-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wider uppercase">
            PORTAL & SALURAN RESMI (OFFICIAL CHANNELS)
          </h2>
          <p className="text-xs font-mono-tech text-zinc-400 mt-1">
            Akses langsung ke seluruh kanal komunikasi resmi ekosistem Four Bloods Gang.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* YouTube Hub */}
          <div className="p-6 border border-white/10 bg-[#0E070A] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center">
                <YouTubeIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl text-white tracking-wider">YOUTUBE HUB</h3>
                <p className="text-xs font-mono-tech text-red-400 font-bold">@4blood-plug</p>
              </div>
              <p className="text-xs font-mono-tech text-zinc-400 leading-relaxed">
                Kanal arsip resmi gathering, anniversary multi-hari, turnamen internal Valorant, dan live podcast member.
              </p>
            </div>
            <a
              href="https://www.youtube.com/@4blood-plug"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 text-xs font-mono-tech font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <span>BUKA CHANNEL</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Instagram Media */}
          <div className="p-6 border border-white/10 bg-[#0E070A] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-pink-600/20 text-pink-500 flex items-center justify-center">
                <InstagramIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl text-white tracking-wider">INSTAGRAM MEDIA</h3>
                <p className="text-xs font-mono-tech text-pink-400 font-bold">@4bloodmedia</p>
              </div>
              <p className="text-xs font-mono-tech text-zinc-400 leading-relaxed">
                Rilis resmi (Official Statement), sinematik patroli armada merah di Roxwood, dan dokumentasi apparel kolaborasi.
              </p>
            </div>
            <a
              href="https://www.instagram.com/4bloodmedia/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-pink-600/15 hover:bg-pink-600 text-pink-400 hover:text-white border border-pink-500/40 text-xs font-mono-tech font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <span>BUKA INSTAGRAM</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* TikTok Highlights */}
          <div className="p-6 border border-white/10 bg-[#0E070A] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl text-white tracking-wider">TIKTOK HYPE</h3>
                <p className="text-xs font-mono-tech text-cyan-400 font-bold">@4bloodmedia</p>
              </div>
              <p className="text-xs font-mono-tech text-zinc-400 leading-relaxed">
                Kompilasi momen tembak-menembak tol, clutch war Cayo Perico, dan sound drill kebanggaan 4Bloods.
              </p>
            </div>
            <a
              href="https://www.tiktok.com/@4bloodmedia"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-cyan-600/15 hover:bg-cyan-600 text-cyan-400 hover:text-white border border-cyan-500/40 text-xs font-mono-tech font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <span>BUKA TIKTOK</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Linktree Directory */}
          <div className="p-6 border border-white/10 bg-[#0E070A] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl text-white tracking-wider">LINKTREE HUB</h3>
                <p className="text-xs font-mono-tech text-emerald-400 font-bold">linktr.ee/4bloods</p>
              </div>
              <p className="text-xs font-mono-tech text-zinc-400 leading-relaxed">
                Direktori kontak resmi 33 kanal streamer/petinggi (Luis, Sumbul, Deja, Asep, Nahmier, dll.) dan Discord resmi.
              </p>
            </div>
            <a
              href="https://linktr.ee/4bloods"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/40 text-xs font-mono-tech font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <span>BUKA LINKTREE</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Verified Achievements & Milestones */}
      <section className="max-w-[1520px] mx-auto px-4 sm:px-8 py-14 space-y-8 border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wider uppercase">
              PENCAPAIAN TERVERIFIKASI (VERIFIED ACHIEVEMENTS)
            </h2>
            <p className="text-xs font-mono-tech text-zinc-400 mt-1">
              Catatan milestone nyata yang didukung oleh tautan rekaman VOD dan kegiatan resmi.
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono-tech font-bold uppercase">
            100% VERIFIED RECORDS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {curatedData.verifiedAchievements.map((ach: any) => (
            <div
              key={ach.id}
              className="p-6 border border-white/10 bg-[#0E070A] space-y-3 hover:border-red-500/40 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono-tech text-red-500 font-bold uppercase tracking-widest">
                    {ach.category}
                  </span>
                  <span className="text-[10px] font-mono-tech text-zinc-500">{ach.date}</span>
                </div>
                <h3 className="font-display text-xl text-white tracking-wider uppercase">
                  {ach.title}
                </h3>
                <p className="text-xs font-mono-tech text-zinc-400 leading-relaxed">
                  {ach.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono-tech text-red-400 font-bold">
                  {ach.views}
                </span>
                <a
                  href={ach.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono-tech text-zinc-300 hover:text-white uppercase"
                >
                  <span>BUKTI VOD</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest VODs from YouTube @4blood-plug */}
      {ytData.videos && ytData.videos.length > 0 && (
        <section className="max-w-[1520px] mx-auto px-4 sm:px-8 py-14 space-y-8 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wider uppercase">
                REKAMAN TERBARU @4BLOOD-PLUG
              </h2>
              <p className="text-xs font-mono-tech text-zinc-400 mt-1">
                Video dan rekaman live stream resmi dari kanal komunitas YouTube.
              </p>
            </div>
            <a
              href="https://www.youtube.com/@4blood-plug/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono-tech text-red-500 hover:underline uppercase"
            >
              <span>LIHAT SEMUA ({ytData.videos.length} VIDEO)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ytData.videos.slice(0, 8).map((vid: any) => (
              <div
                key={vid.id}
                onClick={() =>
                  setVideoModal({
                    videoId: vid.id,
                    title: vid.title,
                    streamer: '@4blood-plug',
                  })
                }
                className="p-3 border border-white/10 bg-[#0E070A] hover:border-red-500/50 cursor-pointer transition-all space-y-2 group"
              >
                <div className="relative aspect-video overflow-hidden bg-black">
                  <img
                    src={vid.thumb}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {vid.duration && (
                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 text-[10px] font-mono-tech text-white">
                      {vid.duration}
                    </span>
                  )}
                </div>
                <h4 className="font-display text-base text-white line-clamp-2 group-hover:text-red-500 transition-colors">
                  {vid.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] font-mono-tech text-zinc-500 pt-1 border-t border-white/10">
                  <span suppressHydrationWarning>{vid.viewCount ? `${Number(vid.viewCount).toLocaleString('id-ID')} views` : vid.views || 'VOD Stream'}</span>
                  <span>{vid.publishedAt ? vid.publishedAt.slice(0, 10) : vid.published || ''}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Social Releases (Instagram & TikTok) */}
      <section className="max-w-[1520px] mx-auto px-4 sm:px-8 py-14 space-y-8 border-t border-white/10">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wider uppercase">
            RILIS & REELS MEDIA TERPILIH
          </h2>
          <p className="text-xs font-mono-tech text-zinc-400 mt-1">
            Sorotan pengumuman faksi dari Instagram @4bloodmedia dan TikTok @4bloodmedia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {curatedData.featuredSocialReels.map((reel: any) => (
            <div
              key={reel.id}
              className="p-6 border border-white/10 bg-[#0E070A] space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-red-600/20 text-red-400 text-[9px] font-mono-tech font-bold uppercase">
                    {reel.platform} // {reel.tag}
                  </span>
                  <span className="text-[10px] font-mono-tech text-zinc-500">{reel.date}</span>
                </div>
                <h3 className="font-display text-xl text-white tracking-wider uppercase">
                  {reel.title}
                </h3>
                <p className="text-xs font-mono-tech text-zinc-400 leading-relaxed">
                  {reel.summary}
                </p>
              </div>

              <a
                href={reel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pt-4 border-t border-white/10 inline-flex items-center justify-between text-xs font-mono-tech text-red-400 hover:text-white uppercase"
              >
                <span>LIHAT POST DI {reel.platform}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Official Discography & Vinyl Deck */}
      <section className="max-w-[1520px] mx-auto px-4 sm:px-8 py-14 space-y-8 border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wider uppercase">
              4BG RECORDS // VINYL DECK & DISS TRACKS
            </h2>
            <p className="text-xs font-mono-tech text-zinc-400 mt-1">
              Karya musik orisinal berstandar hip-hop gangsta & drill yang diproduksi komunitas 4Bloods.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'MV', 'DISS'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTrackFilter(filter)}
                className={`px-3 py-1.5 text-xs font-mono-tech font-bold uppercase border cursor-pointer ${
                  trackFilter === filter
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-black/40 text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Active Vinyl Player */}
        <div className="p-8 border border-white/15 bg-[#0E070A] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-red-500/30 animate-spin [animation-duration:12s]" />
              <img
                src={activeTrack.thumb}
                alt={activeTrack.title}
                className="w-56 h-56 sm:w-72 sm:h-72 object-cover rounded-full border-4 border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.4)]"
              />
              <div className="absolute w-12 h-12 rounded-full bg-black border-2 border-white/30 flex items-center justify-center">
                <Disc3 className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-mono-tech font-bold uppercase">
              {activeTrack.type} // {activeTrack.duration}
            </span>
            <h3 className="font-display text-3xl sm:text-4xl text-white tracking-wider uppercase">
              {activeTrack.title}
            </h3>
            <p className="text-xs font-mono-tech text-red-400 font-bold">
              ARTIST: {activeTrack.artist}
            </p>
            <p className="text-xs sm:text-sm font-mono-tech text-zinc-300 leading-relaxed">
              {activeTrack.description}
            </p>

            <div className="pt-2">
              <button
                onClick={() =>
                  setVideoModal({
                    videoId: activeTrack.videoId,
                    title: activeTrack.title,
                    streamer: activeTrack.artist,
                  })
                }
                className="px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>TONTON MV RESMI (YOUTUBE)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tracklist Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {filteredTracks.map((t: any) => {
            const isSelected = t.id === selectedTrackId;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTrackId(t.id)}
                className={`p-3 border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-red-600/15 border-red-500'
                    : 'bg-[#0E070A] border-white/10 hover:border-red-500/40'
                }`}
              >
                <div className="font-display text-base text-white line-clamp-1">{t.title}</div>
                <div className="text-[10px] font-mono-tech text-zinc-400 mt-1 flex justify-between">
                  <span>{t.type}</span>
                  <span>{t.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Official 3D Showroom & Merch Codex */}
      <section className="border-t border-white/10">
        <ShowroomCodex isDark={isDark} onOpenLightbox={setLightboxImage} />
      </section>

      {/* 54 Official Streamers Directory */}
      <section className="max-w-[1520px] mx-auto px-4 sm:px-8 py-16 space-y-8 border-t border-white/10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/15 border border-red-500/30 text-red-500 text-xs font-mono-tech font-bold uppercase tracking-widest">
              <Tv className="w-3.5 h-3.5" />
              <span>OFFICIAL CONTENT CREATOR ROSTER</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl text-white tracking-wider uppercase">
              54 OFFICIAL STREAMERS DIRECTORY
            </h2>
            <p className="text-xs sm:text-sm font-mono-tech text-zinc-400">
              Daftar seluruh kreator resmi 4Bloods di YouTube beserta status siaran langsung real-time keluarga besar Four Bloods Gang.
            </p>
          </div>

          {/* Quick Metrics Counter */}
          <div className="flex items-center gap-3 font-mono-tech text-xs">
            <div className="px-3.5 py-2 bg-red-600/20 border border-red-500/40 text-red-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-bold">{liveMembers.length} SEDANG LIVE</span>
            </div>
            <div className="px-3.5 py-2 bg-white/5 border border-white/10 text-zinc-300 hidden sm:flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span>54 ANGGOTA KELUARGA</span>
            </div>
          </div>
        </div>

        {/* Filter, Sort & Search Control Bar */}
        <div className="p-4 bg-black/60 border border-white/15 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama, handle (@oxidstudios), atau in-game role..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/80 border border-white/15 text-xs font-mono-tech text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
              {rosterSearch && (
                <button
                  onClick={() => setRosterSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sorting Buttons */}
            <div className="flex items-center gap-2 font-mono-tech text-xs">
              <span className="text-zinc-500 text-[11px] uppercase flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" />
                <span>URUTKAN:</span>
              </span>
              {(
                [
                  { id: 'live', label: 'STATUS LIVE' },
                  { id: 'rank', label: 'HIERARKI' },
                  { id: 'name', label: 'NAMA' },
                  { id: 'subs', label: 'SUBSCRIBERS' },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setRosterSort(s.id)}
                  className={`px-2.5 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase border cursor-pointer transition-colors ${
                    rosterSort === s.id
                      ? 'bg-red-600/30 text-red-400 border-red-500'
                      : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'ALL', label: `SEMUA (${streamers.length})` },
                  { id: 'LIVE', label: `🔴 LIVE (${liveMembers.length})` },
                  { id: 'OG', label: '👑 OG' },
                  { id: 'Under OG', label: '⚡ UNDER OG' },
                  { id: 'Young Bloods', label: '🛡️ YOUNG BLOODS' },
                  { id: 'Member', label: 'MEMBER' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setRosterFilter(f.id)}
                  className={`px-3 py-1.5 text-xs font-mono-tech font-bold uppercase border cursor-pointer transition-all ${
                    rosterFilter === f.id
                      ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                      : 'bg-black/50 text-zinc-400 border-white/10 hover:text-white hover:border-white/20'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono-tech text-zinc-500">
              Menampilkan {filteredRoster.length} dari {streamers.length} kreator
            </span>
          </div>
        </div>

        {/* Streamers Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredRoster.map((member: any) => {
            const isLive = Boolean(member.isLive);

            // Rank border color (purely RP hierarchy)
            let rankRing = 'border-white/10';
            if (member.rank === 'OG') rankRing = 'border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.25)]';
            else if (member.rank === 'Under OG') rankRing = 'border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.25)]';
            else if (member.rank === 'Young Bloods') rankRing = 'border-cyan-400/60';

            return (
              <div
                key={member.channelId || member.name}
                className={`relative border overflow-hidden transition-all duration-300 group flex flex-col justify-between ${
                  isLive
                    ? 'bg-gradient-to-br from-[#1C080E]/95 via-[#110508]/90 to-[#0A0205] border-red-500/80 shadow-[0_10px_35px_rgba(220,38,38,0.25)] hover:border-red-400 hover:-translate-y-1'
                    : isDark
                      ? 'bg-[#0B0608] border-white/10 hover:border-red-500/50 hover:bg-[#12070C] hover:-translate-y-0.5'
                      : 'bg-white border-zinc-200 shadow-sm hover:shadow-lg'
                }`}
              >
                {/* Top Accent Strip */}
                {isLive ? (
                  <div className="h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 animate-pulse" />
                ) : (
                  <div className="h-0.5 bg-gradient-to-r from-red-600/40 via-transparent to-transparent group-hover:h-1 group-hover:from-red-500 transition-all" />
                )}

                <div className="p-5 space-y-4">
                  {/* Top Header: Avatar + Live Badge / Rank */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-full overflow-hidden bg-black border-2 ${rankRing}`}>
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
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-600 border-2 border-black flex items-center justify-center">
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
                        <span className="text-[10px] font-mono-tech text-zinc-500 uppercase px-2 py-0.5 bg-white/5 border border-white/5">
                          OFFLINE
                        </span>
                      )}

                      <span className="px-2 py-0.5 bg-red-600/20 text-red-400 text-[9px] font-mono-tech font-bold uppercase">
                        {member.rank}
                      </span>
                    </div>
                  </div>

                  {/* Creator Identity */}
                  <div className="space-y-1">
                    <h3 className="font-display text-xl sm:text-2xl text-white tracking-wider group-hover:text-red-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-[11px] font-mono-tech text-red-400 font-medium">
                      {member.handle || '@creator'}
                    </p>
                    <p className="text-xs font-mono-tech text-zinc-400 line-clamp-2 pt-0.5">
                      {member.role}
                    </p>
                  </div>

                  {/* Clean Channel Info Row */}
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono-tech">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <YouTubeIcon className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-zinc-300 font-medium">{member.handle || '@youtube'}</span>
                      </span>
                      {member.subscribersText && (
                        <span className="text-[11px] text-zinc-400 font-mono-tech">
                          {member.subscribersText}
                        </span>
                      )}
                    </div>

                    {/* Active Live Stream Title Callout */}
                    {isLive && member.streamTitle && (
                      <div className="p-2.5 bg-red-950/60 border border-red-500/40 space-y-1">
                        <div className="text-[10px] font-mono-tech text-red-400 font-bold flex items-center justify-between">
                          <span>🔴 STREAMING SEKARANG</span>
                          {member.viewerCount && (
                            <span className="text-white flex items-center gap-1">
                              <Eye className="w-3 h-3 text-red-400" />
                              {Number(member.viewerCount).toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono-tech text-zinc-200 line-clamp-2 leading-tight">
                          &ldquo;{member.streamTitle}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 pt-0 flex items-center gap-2">
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
                      className="flex-1 py-2.5 bg-white/5 hover:bg-red-600 hover:text-white text-zinc-300 font-mono-tech text-xs uppercase tracking-wider border border-white/10 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <YouTubeIcon className="w-3.5 h-3.5" />
                      <span>KANAL YOUTUBE</span>
                    </a>
                  )}

                  {member.featuredVideoId && (
                    <button
                      onClick={() =>
                        setVideoModal({
                          videoId: member.featuredVideoId,
                          title: member.featuredTitle || member.name,
                          streamer: member.name,
                        })
                      }
                      className="p-2.5 bg-black/60 hover:bg-red-600 hover:text-white border border-white/15 text-zinc-400 transition-colors"
                      title="Lihat Rekaman VOD Pilihan"
                    >
                      <Film className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-xl flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full bg-[#0B0709] border border-white/20 overflow-hidden"
          >
            <div className="px-5 py-3.5 bg-[#120B0E] border-b border-white/10 flex items-center justify-between">
              <div>
                <h4 className="font-display text-2xl text-white tracking-wider">
                  {lightboxImage.title}
                </h4>
                {lightboxImage.subtitle && (
                  <p className="text-xs font-mono-tech text-red-400">{lightboxImage.subtitle}</p>
                )}
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-2 bg-white/5 hover:bg-red-600 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-black flex items-center justify-center max-h-[80vh]">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="max-h-[72vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Video Modal */}
      {videoModal && (
        <div
          onClick={() => setVideoModal(null)}
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-xl flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full bg-[#0B0709] border border-red-500/50 overflow-hidden shadow-[0_0_60px_rgba(220,38,38,0.3)]"
          >
            <div className="px-5 py-3.5 bg-[#120B0E] border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono-tech text-red-500 font-bold uppercase tracking-widest">
                  {videoModal.streamer}
                </span>
                <h4 className="font-display text-2xl text-white tracking-wider">
                  {videoModal.title}
                </h4>
              </div>
              <button
                onClick={() => setVideoModal(null)}
                className="p-2 bg-white/5 hover:bg-red-600 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoModal.videoId}?autoplay=1&rel=0`}
                title={videoModal.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
