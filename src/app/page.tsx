'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Tilt3DCard from '@/components/Tilt3DCard';
import ThreeLogoHero from '@/components/ThreeLogoHero';
import ShowroomCodex from '@/components/ShowroomCodex';
import Icon3D from '@/components/Icon3D';
import YouTubeCarousel3D from '@/components/YouTubeCarousel3D';
import {
  LORE_CHAPTERS,
  HIERARCHY_TIERS,
  WARDROBE_ITEMS,
  OFFICIAL_MEDIA_TRACKS,
  WAR_ARCHIVES,
  STREAMER_ROSTER,
} from '@/data/4bloods-data';
import {
  Play,
  Radio,
  MapPin,
  ExternalLink,
  Search,
  Tv,
  RotateCw,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Shield,
  Box,
  Disc3,
  Film,
  Columns2,
  Sun,
  Moon,
  Sparkles,
  Users,
} from 'lucide-react';

// Optimized Lightweight Fan Art visuals per rank/character
const DEFAULT_SHOWCASE_FANARTS: Record<string, string> = {
  'Nahmier Davies': '/assets/generated/fanart_roxwood.webp',
  'Jane Elisha': '/assets/generated/fanart_council.webp',
  'Asep Teriyaki': '/assets/generated/fanart_west_to_ssr.webp',
  'Ilham Joseph': '/assets/generated/fanart_council.webp',
  'Louis Ven': '/assets/generated/fanart_roxwood.webp',
  'Deja Amari': '/assets/generated/fanart_west_to_ssr.webp',
};

export default function CompanyProfilePage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeChapterIdx, setActiveChapterIdx] = useState(2); // Default Chapter III (SSR)
  const [heroLogoOption, setHeroLogoOption] = useState<'ORI' | '3D' | 'V1'>('ORI');

  // Section 04: Vinyl Record Deck & Studio Tracklist State
  const [trackFilter, setTrackFilter] = useState<'ALL' | 'MV' | 'DISS'>('ALL');
  const [selectedTrackId, setSelectedTrackId] = useState<string>(OFFICIAL_MEDIA_TRACKS[0].id);

  // Section 05: War Cinema Screen & Tactical Tape Reel State
  const [warFilter, setWarFilter] = useState<'ALL' | 'WAR' | 'LORE'>('ALL');
  const [selectedWarId, setSelectedWarId] = useState<string>(WAR_ARCHIVES[0].id);

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

  // Live Streamers from our Strict Edge API
  const [streamers, setStreamers] = useState<any[]>(STREAMER_ROSTER);
  const [liveCount, setLiveCount] = useState<number>(1);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterFilter, setRosterFilter] = useState<
    'ALL' | 'LIVE' | 'OG' | 'Under OG' | 'Young Bloods'
  >('ALL');

  // Gang Structure Interactive Showcase State
  const [selectedShowcaseIdx, setSelectedShowcaseIdx] = useState<number>(0);
  const [showcaseTierFilter, setShowcaseTierFilter] = useState<string>('ALL');

  const isDark = theme === 'dark';

  useEffect(() => {
    try {
      const savedTheme =
        localStorage.getItem('4bg_theme') || localStorage.getItem('4bs_cam_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    } catch {}

    fetch('/api/streamers')
      .then((res) => {
        if (!res.ok) throw new Error('API route failed');
        return res.json();
      })
      .then((data) => {
        if (data?.streamers && Array.isArray(data.streamers)) {
          const count =
            data.liveCount !== undefined
              ? data.liveCount
              : data.streamers.filter((s: any) => s.isLive).length;
          setStreamers(data.streamers);
          setLiveCount(count);
        }
      })
      .catch(() => {
        // Client direct fallback to Firebase RTDB if Vercel serverless fails
        fetch('https://blood-186bd-default-rtdb.firebaseio.com/streamers.json')
          .then((r) => r.json())
          .then((fb) => {
            if (fb && typeof fb === 'object') {
              const liveCount = Object.values(fb).filter((v: any) => {
                const isStale =
                  v?.lastChecked &&
                  Date.now() - new Date(v.lastChecked).getTime() > 8 * 60 * 60 * 1000;
                return !isStale && Boolean(v?.isLive && v?.videoId);
              }).length;
              setLiveCount(liveCount);
              setStreamers((prev) =>
                prev.map((m) => {
                  const s = fb[m.channelId];
                  const isStale =
                    s?.lastChecked &&
                    Date.now() - new Date(s.lastChecked).getTime() > 8 * 60 * 60 * 1000;
                  const isLive = !isStale && Boolean(s?.isLive && s?.videoId);
                  return isLive
                    ? {
                        ...m,
                        isLive: true,
                        videoId: s.videoId,
                        streamTitle: s.title || m.streamTitle || null,
                        viewerCount: s.viewerCount || null,
                        startTimestamp: s.actualStartTime || null,
                      }
                    : { ...m, isLive: false, videoId: null, streamTitle: null, viewerCount: null };
                })
              );
            }
          })
          .catch(() => {});
      });
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

  const currentChapter = LORE_CHAPTERS[activeChapterIdx];
  const liveMembers = streamers.filter((s) => s.isLive);
  const totalLiveViewers = useMemo(() => {
    return streamers.reduce(
      (acc, s) => acc + (s.isLive && typeof s.viewerCount === 'number' ? s.viewerCount : 0),
      0
    );
  }, [streamers]);

  // Filtered MV & Diss Tracks
  const filteredTracks = OFFICIAL_MEDIA_TRACKS.filter((track) => {
    if (trackFilter === 'MV') return track.type !== 'DISS TRACK';
    if (trackFilter === 'DISS') return track.type === 'DISS TRACK';
    return true;
  });

  const activeTrack =
    filteredTracks.find((t) => t.id === selectedTrackId) ||
    filteredTracks[0] ||
    OFFICIAL_MEDIA_TRACKS[0];

  // Filtered War Tapes
  const filteredWarArchives = WAR_ARCHIVES.filter((war) => {
    if (warFilter === 'WAR') {
      return war.category.includes('WAR') || war.category.includes('PURSUIT');
    }
    if (warFilter === 'LORE') {
      return !war.category.includes('WAR') && !war.category.includes('PURSUIT');
    }
    return true;
  });

  const activeWarTape =
    filteredWarArchives.find((w) => w.id === selectedWarId) ||
    filteredWarArchives[0] ||
    WAR_ARCHIVES[0];

  // Filtered 54 Streamers (Prioritize subscribers sort)
  const filteredRoster = useMemo(() => {
    return streamers
      .filter((m) => {
        const q = rosterSearch.toLowerCase();
        const matchName =
          m.name.toLowerCase().includes(q) ||
          (m.handle && m.handle.toLowerCase().includes(q)) ||
          (m.role && m.role.toLowerCase().includes(q));
        if (!matchName) return false;
        if (rosterFilter === 'LIVE') return Boolean(m.isLive);
        if (rosterFilter === 'OG') return m.rank === 'OG';
        if (rosterFilter === 'Under OG') return m.rank === 'Under OG';
        if (rosterFilter === 'Young Bloods') return m.rank === 'Young Bloods';
        return true;
      })
      .sort((a, b) => {
        const subDiff = (b.subscribers || 0) - (a.subscribers || 0);
        if (subDiff !== 0) return subDiff;
        return a.name.localeCompare(b.name);
      });
  }, [streamers, rosterSearch, rosterFilter]);

  // Rank hierarchy priority ordering
  const RANK_PRIORITY: Record<string, number> = {
    'OG': 1,
    'Under OG': 2,
    'Young Bloods': 3,
    'Member': 4,
  };

  // Complete Syndicate Roster ordered by subscribers first (All 54 Members)
  const allSpotlightCreators = useMemo(() => {
    return [...streamers].sort((a, b) => {
      const subDiff = (b.subscribers || 0) - (a.subscribers || 0);
      if (subDiff !== 0) return subDiff;
      const pA = RANK_PRIORITY[a.rank] ?? 99;
      const pB = RANK_PRIORITY[b.rank] ?? 99;
      if (pA !== pB) return pA - pB;
      return a.name.localeCompare(b.name);
    });
  }, [streamers]);

  const showcaseList =
    showcaseTierFilter === 'ALL'
      ? allSpotlightCreators
      : allSpotlightCreators.filter((m: any) => m.rank === showcaseTierFilter);

  const activeShowcaseMember =
    showcaseList[selectedShowcaseIdx] || showcaseList[0] || allSpotlightCreators[0];

  const getMemberShowcaseArtwork = (member: any) => {
    if (!member) return '/assets/generated/fanart_council.webp';
    return (
      DEFAULT_SHOWCASE_FANARTS[member.name] ||
      (member.rank === 'OG'
        ? '/assets/generated/fanart_council.webp'
        : member.rank === 'Under OG'
          ? '/assets/generated/fanart_roxwood.webp'
          : '/assets/generated/fanart_west_to_ssr.webp')
    );
  };

  return (
    <div
      className={`theme-smooth min-h-screen relative selection:bg-red-600 selection:text-white ${
        isDark ? 'bg-[#070506] text-[#F4F4F6]' : 'bg-[#F4F1EC] text-[#141113]'
      }`}
    >
      {/* Clean Top Navbar */}
      <Navbar liveCount={liveCount} theme={theme} onToggleTheme={toggleTheme} />

      {/* Dedicated Bottom-Left Floating Theme Switcher (Separate from Music Player, Smooth Transition) */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 select-none">
        <button
          onClick={toggleTheme}
          className={`group p-1.5 border shadow-[0_15px_40px_rgba(0,0,0,0.65)] flex items-center gap-2 cursor-pointer backdrop-blur-xl ${
            isDark
              ? 'bg-[#120A0E]/95 border-red-500/40 text-white hover:border-red-500'
              : 'bg-white/95 border-zinc-300 text-zinc-900 hover:border-red-500'
          }`}
          title={isDark ? 'Ganti ke Light Mode (Transisi Halus)' : 'Ganti ke Dark Mode (Transisi Halus)'}
        >
          <span
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-transform duration-500 ${
              isDark
                ? 'bg-red-600 text-white rotate-0'
                : 'bg-amber-400 text-black rotate-180'
            }`}
          >
            {isDark ? <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </span>
          <div className="hidden sm:block pr-2.5 text-left">
            <div className="text-[8px] font-mono-tech text-red-500 font-bold uppercase tracking-widest leading-none">
              MODE TAMPILAN
            </div>
            <div className="text-[11px] font-mono-tech font-bold uppercase tracking-wider mt-0.5">
              {isDark ? 'DARK // OBSIDIAN' : 'LIGHT // STREET'}
            </div>
          </div>
        </button>
      </div>

      {/* =====================================================================
          HERO BANNER — EXACT 1 VIEWPORT HEIGHT (100dvh)
      ===================================================================== */}
      <section
        className={`relative min-h-[100dvh] lg:h-[100dvh] pt-16 sm:pt-20 flex flex-col justify-between overflow-hidden border-b ${
          isDark
            ? 'bg-[#090306] border-red-500/25'
            : 'bg-gradient-to-b from-[#FAF8F5] via-[#EDE7DE] to-[#F5F0E8] border-zinc-200'
        }`}
      >
        {/* Prominent High-Visibility Hero Wallpaper (Vivid, Clear & Cinematic) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/assets/hero_bg.webp"
            alt="Hero Background"
            className={`w-full h-full object-cover object-center ${
              isDark ? 'opacity-75 brightness-90 contrast-105' : 'opacity-40 brightness-100'
            }`}
          />
          <div
            className={`absolute inset-0 ${
              isDark
                ? 'bg-gradient-to-b from-black/60 via-black/40 to-[#090306]/95'
                : 'bg-gradient-to-b from-white/70 via-white/50 to-[#FAF8F5]'
            }`}
          />
          <div
            style={{
              background: isDark
                ? 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.05) 0%, rgba(9,3,6,0.7) 80%)'
                : 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0%, rgba(250,248,245,0.45) 80%)',
            }}
            className="absolute inset-0 pointer-events-none"
          />
          <div
            className={`absolute inset-0 ${
              isDark ? 'bg-tactical-grid opacity-15' : 'bg-cam-light-grid opacity-20'
            }`}
          />
          <div
            className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${
              isDark ? 'bg-red-600/15' : 'bg-red-500/5'
            }`}
          />
          <div
            className={`absolute top-1/2 -right-32 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none ${
              isDark ? 'bg-red-900/20' : 'bg-red-400/10'
            }`}
          />
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 max-w-[1520px] mx-auto px-4 sm:px-8 w-full my-auto py-3 sm:py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Column: Refined Editorial Typography & CTAs */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
              {/* Status Pill */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 border text-xs font-mono-tech tracking-wider uppercase backdrop-blur-md ${
                    isDark
                      ? 'bg-[#12080B]/90 border-red-500/30 text-zinc-200'
                      : 'bg-white/90 border-red-500/30 text-zinc-900 shadow-sm'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span className="font-bold text-red-500">IME RP</span>
                  <span className="text-zinc-500">//</span>
                  <span>SOUTH SIDE ROXWOOD 1051–1052</span>
                </div>

                {liveMembers.length > 0 && (
                  <Link
                    href="/cam"
                    className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/90 hover:bg-red-500 text-white text-[11px] font-mono-tech font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>{liveCount} STREAMER LIVE</span>
                    {totalLiveViewers > 0 && (
                      <span className="border-l border-white/30 pl-2 text-red-100 font-normal flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{totalLiveViewers.toLocaleString('id-ID')} PENONTON</span>
                      </span>
                    )}
                  </Link>
                )}
              </div>

              {/* Bold Headline & Clean Tagline */}
              <div className="space-y-3">
                <div className="text-[11px] sm:text-xs font-mono-tech text-red-500 font-bold tracking-[0.3em] uppercase">
                  FOUR BLOODS GANG (4BG) // OFFICIAL PORTAL
                </div>

                <h1
                  className={`font-display text-4xl sm:text-6xl md:text-7xl xl:text-[84px] leading-[0.92] tracking-wider uppercase ${
                    isDark ? 'text-white' : 'text-zinc-950'
                  }`}
                >
                  BLOOD IN,<br />
                  <span className="text-red-600 drop-shadow-[0_0_35px_rgba(220,38,38,0.35)]">
                    BLOOD OUT
                  </span>
                </h1>

                <p className="font-script text-xl sm:text-2xl lg:text-3xl text-red-500 drop-shadow-[0_2px_15px_rgba(220,38,38,0.4)] max-w-2xl mx-auto lg:mx-0">
                  &ldquo;Hidup dalam darah, berjalan bersama keluarga, dan mati demi 4Bloods.&rdquo;
                </p>
              </div>

              {/* Direct Action CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-0.5">
                <Link
                  href="/cam"
                  className="px-7 py-3.5 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs sm:text-sm font-bold tracking-[0.18em] uppercase transition-all shadow-[0_0_30px_rgba(220,38,38,0.35)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] flex items-center gap-2.5 cursor-pointer group"
                >
                  <Tv className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>BUKA 4BLOODS CAM ({liveCount > 0 ? `${liveCount} LIVE` : 'MULTI-POV'})</span>
                </Link>

                <button
                  onClick={() =>
                    setVideoModal({
                      videoId: 'wJyovquNR24',
                      title: 'THIS IS 4BLOODS (Official Music Video)',
                      streamer: '4BLOODS OFFICIAL ANTHEM // IME RP',
                    })
                  }
                  className={`px-6 py-3.5 border font-mono-tech text-xs sm:text-sm font-bold tracking-[0.16em] uppercase transition-colors flex items-center gap-2.5 cursor-pointer ${
                    isDark
                      ? 'bg-[#120A0D] hover:bg-white hover:text-black text-white border-white/15'
                      : 'bg-white hover:bg-zinc-900 hover:text-white text-zinc-900 border-zinc-300 shadow-sm'
                  }`}
                >
                  <Play className="w-4 h-4 text-red-500 fill-red-500" />
                  <span>TONTON MV ANTHEM</span>
                </button>
              </div>

              {/* Sleek Minimalist Metadata Bar */}
              <div
                className={`pt-3 sm:pt-4 flex items-center justify-center lg:justify-start gap-6 sm:gap-10 border-t ${
                  isDark ? 'border-white/10' : 'border-zinc-300/80'
                }`}
              >
                <div>
                  <div className="text-[10px] font-mono-tech text-red-500 font-bold uppercase tracking-widest">
                    TURF
                  </div>
                  <div
                    className={`font-display text-xl sm:text-2xl tracking-wide mt-0.5 ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    SSR 1051–1052
                  </div>
                </div>

                <div className={`w-px h-7 ${isDark ? 'bg-white/10' : 'bg-zinc-300'}`} />

                <div>
                  <div className="text-[10px] font-mono-tech text-red-500 font-bold uppercase tracking-widest">
                    KOMANDO
                  </div>
                  <div
                    className={`font-display text-xl sm:text-2xl tracking-wide mt-0.5 ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    HIGH COUNCIL
                  </div>
                </div>

                <div className={`w-px h-7 ${isDark ? 'bg-white/10' : 'bg-zinc-300'}`} />

                <div>
                  <div className="text-[10px] font-mono-tech text-red-500 font-bold uppercase tracking-widest">
                    ROSTER
                  </div>
                  <div
                    className={`font-display text-xl sm:text-2xl tracking-wide mt-0.5 ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    54 STREAMERS
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 4Bloods Vintage Heritage V1 Crest */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <ThreeLogoHero
                isDark={isDark}
                onClick={() =>
                  setLightboxImage({
                    src: '/assets/generated/crest_v1_3d.webp',
                    title: '4BLOODS GANG — 3D HERITAGE V1 EMBLEM',
                    subtitle: 'IME Roleplay // South Side Roxwood (Postal 1051–1052)',
                  })
                }
                className="w-64 h-64 sm:w-80 sm:h-80 md:w-[360px] md:h-[360px] lg:w-[420px] lg:h-[420px] xl:w-[460px] xl:h-[460px]"
              />

              {/* Dedicated Heritage V1 Label Badge */}
              <div
                className={`mt-3 inline-flex items-center gap-2 px-3 py-1 border backdrop-blur-md rounded-xs ${
                  isDark
                    ? 'bg-black/60 border-white/10 text-zinc-300'
                    : 'bg-white/80 border-zinc-300 text-zinc-800 shadow-sm'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] font-mono-tech font-bold uppercase tracking-widest text-red-500">
                  HERITAGE V1
                </span>
                <span className="text-zinc-500">//</span>
                <span className="text-[10px] font-mono-tech tracking-wider">
                  3D OFFICIAL CREST
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STREETWEAR MARQUEE TAPE — Sits exactly at bottom of 100dvh Hero */}
        <div className="relative z-10 w-full bg-red-600 text-white py-2 sm:py-2.5 border-t border-red-400/30 overflow-hidden select-none shrink-0">
          <div className="animate-marquee flex items-center gap-10 text-xs font-mono-tech font-bold tracking-[0.28em] uppercase">
            {Array.from({ length: 2 }).map((_, idx) => (
              <React.Fragment key={idx}>
                <span className="font-gothic text-base tracking-normal">4BG</span>
                <span>FOUR BLOODS GANG // IME ROLEPLAY</span>
                <span>✦</span>
                <span>SOUTH SIDE ROXWOOD // POSTAL 1051–1052</span>
                <span>✦</span>
                <span>BLOOD IN, BLOOD OUT</span>
                <span>✦</span>
                <span>54 OFFICIAL STREAMERS</span>
                <span>✦</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          TWO MAJOR GATEWAYS: 01 WIKI & ARCHIVE  vs  02 COMMUNITY & ACHIEVEMENTS
      ===================================================================== */}
      <section className={`py-16 border-b ${isDark ? 'bg-[#090507] border-white/10' : 'bg-[#F2ECE4] border-zinc-300'}`}>
        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono-tech text-red-500 font-bold uppercase tracking-[0.25em]">
                DUA PILAR UTAMA EKOSISTEM
              </div>
              <h2 className={`font-display text-4xl sm:text-5xl tracking-wider uppercase mt-1 ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                PILIH GERBANG <span className="text-red-600">4BLOODS</span>
              </h2>
            </div>
            <p className={`text-xs font-mono-tech max-w-md ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Eksplorasi arsip mendalam sejarah lore faksi di Wiki resmi, atau selami skala masif komunitas, pencapaian turnamen, dan media sosial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gateway 01: 4Bloods Wiki & History */}
            <Link
              href="/wiki"
              className={`group p-8 sm:p-10 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[320px] cursor-pointer ${
                isDark
                  ? 'bg-gradient-to-br from-[#1A080D] via-[#0E0407] to-black border-red-500/30 hover:border-red-500 hover:shadow-[0_0_40px_rgba(220,38,38,0.3)]'
                  : 'bg-white border-zinc-300 hover:border-red-500 shadow-md hover:shadow-xl'
              }`}
            >
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-mono-tech font-bold uppercase tracking-widest">
                    MENU 01 // ENSiKLOPEDIA
                  </span>
                  <span className="text-xs font-mono-tech text-red-500 font-bold">EST. 23 JUNI 2025</span>
                </div>
                <h3 className={`font-display text-4xl sm:text-5xl tracking-wider uppercase group-hover:text-red-500 transition-colors ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  4BLOODS WIKI & ARCHIVE
                </h3>
                <p className={`text-xs sm:text-sm font-mono-tech leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  Kisah awal mula pekerja burger (Ilham, Louis, Deja, Sumbul), migrasi 3 chapter (West Side &rarr; Jamestown &rarr; Roxwood), hierarki sindikat, kode etik Blood In Blood Out, serta arsip rekaman perang bersejarah.
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between relative z-10">
                <span className="text-xs font-mono-tech text-red-500 font-bold tracking-widest uppercase flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                  <span>MASUK KE WIKI & SEJARAH</span>
                  <span>&rarr;</span>
                </span>
                <span className="text-[10px] font-mono-tech text-zinc-500">ORIGIN · CHAPTERS · HIERARCHY · WARS</span>
              </div>
            </Link>

            {/* Gateway 02: Community & Achievements */}
            <Link
              href="/community"
              className={`group p-8 sm:p-10 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[320px] cursor-pointer ${
                isDark
                  ? 'bg-gradient-to-br from-[#1A080D] via-[#0E0407] to-black border-red-500/30 hover:border-red-500 hover:shadow-[0_0_40px_rgba(220,38,38,0.3)]'
                  : 'bg-white border-zinc-300 hover:border-red-500 shadow-md hover:shadow-xl'
              }`}
            >
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-mono-tech font-bold uppercase tracking-widest">
                    MENU 02 // KOMUNITAS & MEDIA
                  </span>
                  <span className="text-xs font-mono-tech text-red-500 font-bold">7.2K+ DISCORD · 54 STREAMERS</span>
                </div>
                <h3 className={`font-display text-4xl sm:text-5xl tracking-wider uppercase group-hover:text-red-500 transition-colors ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  COMMUNITY & ACHIEVEMENTS
                </h3>
                <p className={`text-xs sm:text-sm font-mono-tech leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  Skala komunitas nyata: 54 streamer aktif, hub YouTube @4blood-plug (1 Year Anniversary & Charity), Instagram @4bloodmedia, TikTok, discography vinyl lagu resmi, 3D merch lookbook, dan direktori kreator.
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between relative z-10">
                <span className="text-xs font-mono-tech text-red-500 font-bold tracking-widest uppercase flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                  <span>MASUK KE COMMUNITY HUB</span>
                  <span>&rarr;</span>
                </span>
                <span className="text-[10px] font-mono-tech text-zinc-500">METRICS · SOCIALS · DISCOGRAPHY · MERCH</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 01 — THE 3 CHAPTERS (DYNAMIC SATELLITE MAP BACKDROP)
          Layout Rhythm: Main Satellite Map on LEFT (7 Cols) | Era Dossier on RIGHT (5 Cols)
      ===================================================================== */}
      <section
        id="chronicles"
        className={`py-24 border-b relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-[#2D0610] via-[#160308] to-[#24050E] border-red-600/35'
            : 'bg-gradient-to-br from-[#FDE8EC] via-[#F6D2D9] to-[#FDE8EC] border-red-300'
        }`}
      >
        {/* Dynamic Section 01 Background Art: Active Chapter Map Mural + Tactical Grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div
            style={{
              background:
                'radial-gradient(circle at 20% 40%, rgba(220,38,38,0.24) 0%, rgba(220,38,38,0) 70%)',
            }}
            className="absolute inset-0 pointer-events-none"
          />
          <img
            src={currentChapter.mapImage}
            alt=""
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover ${
              isDark ? 'opacity-15 grayscale' : 'opacity-10 grayscale'
            }`}
          />
          <div
            className={`absolute inset-0 ${
              isDark ? 'bg-tactical-grid opacity-60' : 'bg-cam-light-grid opacity-60'
            }`}
          />
          <div
            className={`absolute -top-24 right-10 font-display text-[180px] sm:text-[240px] leading-none select-none ${
              isDark ? 'text-red-500/[0.08]' : 'text-red-900/[0.08]'
            }`}
          >
            {currentChapter.roman}
          </div>
        </div>

        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <Icon3D src="/assets/generated/icons3d/icon_territory.webp" alt="3D Territory Map" />
              <div>
              <div className="text-xs font-mono-tech font-bold text-red-500 tracking-[0.25em] uppercase mb-1">
                01 // SEJARAH TERITORI DI IME ROLEPLAY (CHAPTER I – III)
              </div>
              <h2
                className={`font-display text-5xl sm:text-7xl uppercase tracking-wider leading-none ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}
              >
                THE <span className="text-red-600">TERRITORY</span> ARCHIVES
              </h2>
              </div>
            </div>

            {/* Chapter Switcher Pills */}
            <div className="flex flex-wrap gap-2">
              {LORE_CHAPTERS.map((chap, idx) => {
                const active = idx === activeChapterIdx;
                return (
                  <button
                    key={chap.id}
                    onClick={() => setActiveChapterIdx(idx)}
                    className={`px-5 py-3 font-mono-tech text-xs font-bold tracking-widest uppercase border cursor-pointer flex items-center gap-2.5 ${
                      active
                        ? 'bg-red-600 text-white border-red-500 shadow-[0_0_25px_rgba(220,38,38,0.4)]'
                        : isDark
                          ? 'bg-[#120A0E]/90 text-zinc-300 border-white/15 hover:text-white'
                          : 'bg-white text-zinc-700 border-zinc-300 hover:border-red-500'
                    }`}
                  >
                    <span className="font-display text-base">{chap.roman}</span>
                    <span className="opacity-60">//</span>
                    <span>{chap.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT 7 COLS: Interactive 3D Satellite Turf Map */}
            <Tilt3DCard
              intensity={7}
              onClick={() =>
                setLightboxImage({
                  src: currentChapter.mapImage,
                  title: `${currentChapter.roman} — ${currentChapter.turfName}`,
                  subtitle: `${currentChapter.postalCode} // IME Roleplay`,
                })
              }
              className="lg:col-span-7 relative bg-black border border-red-500/40 overflow-hidden group cursor-pointer min-h-[380px] sm:min-h-[480px] shadow-2xl"
            >
              <img
                src={currentChapter.mapImage}
                alt={currentChapter.turfName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              <div
                style={{ transform: 'translateZ(30px)' }}
                className="absolute top-4 left-4 right-4 flex items-center justify-between"
              >
                <span className="px-3 py-1 bg-black/85 border border-red-500/50 text-red-400 text-xs font-mono-tech font-bold uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  {currentChapter.postalCode}
                </span>
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-mono-tech font-bold uppercase flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5" />
                  PERBESAR PETA
                </span>
              </div>

              <div
                style={{ transform: 'translateZ(35px)' }}
                className="absolute bottom-5 left-5 right-5"
              >
                <div className="text-xs font-mono-tech text-red-400 uppercase tracking-widest">
                  IME RP SATELLITE TURF // {currentChapter.era}
                </div>
                <h3 className="font-display text-4xl sm:text-6xl text-white uppercase tracking-wider mt-1">
                  {currentChapter.turfName}
                </h3>
              </div>
            </Tilt3DCard>

            {/* RIGHT 5 COLS: Action Photo + Narrative + Milestones */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-5">
              <div
                onClick={() =>
                  setLightboxImage({
                    src: currentChapter.actionImage,
                    title: currentChapter.title,
                    subtitle: currentChapter.subtitle,
                  })
                }
                className="relative h-52 sm:h-60 bg-black border border-red-500/40 overflow-hidden group cursor-pointer shadow-xl"
              >
                <img
                  src={currentChapter.actionImage}
                  alt={currentChapter.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-mono-tech font-bold">
                      {currentChapter.roman}
                    </span>
                    <h4 className="font-display text-3xl text-white uppercase tracking-wider mt-1">
                      {currentChapter.title}
                    </h4>
                  </div>
                  <img
                    src={currentChapter.logoUsed}
                    alt="Era Logo"
                    className="w-14 h-14 object-contain drop-shadow-lg"
                  />
                </div>
              </div>

              <div
                className={`border p-6 flex-1 flex flex-col justify-between space-y-4 ${
                  isDark
                    ? 'bg-[#120A0E]/90 border-red-500/25'
                    : 'bg-white/95 border-zinc-300 shadow-md'
                }`}
              >
                <div className="space-y-2">
                  <blockquote className="font-script text-2xl text-red-500 border-l-4 border-red-600 pl-3.5">
                    &ldquo;{currentChapter.quote}&rdquo;
                  </blockquote>
                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      isDark ? 'text-zinc-300' : 'text-zinc-700'
                    }`}
                  >
                    {currentChapter.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {currentChapter.milestones.map((ms, i) => (
                    <div
                      key={i}
                      className={`px-3.5 py-2 border flex items-center justify-between gap-3 ${
                        isDark
                          ? 'bg-black/75 border-white/10'
                          : 'bg-zinc-50 border-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono-tech text-xs font-bold text-red-500">
                          0{i + 1}
                        </span>
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            isDark ? 'text-white' : 'text-zinc-900'
                          }`}
                        >
                          {ms.label}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-mono-tech truncate max-w-[200px] ${
                          isDark ? 'text-zinc-400' : 'text-zinc-600'
                        }`}
                      >
                        {ms.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 02 — GANG STRUCTURE INTERACTIVE SHOWCASE
          Layout Rhythm FLIPPED: Selector Rail on LEFT (4 Cols) | Giant Character Stage on RIGHT (8 Cols)!
          Background: Crimson Bandana Mural & Diagonal Streetwear Slashes
      ===================================================================== */}
      <section
        id="hierarchy"
        className={`py-24 border-b relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-[#1B1626] via-[#251F33] to-[#181323] border-white/20'
            : 'bg-gradient-to-tr from-[#ECEAE4] via-[#DFDDD6] to-[#ECEAE4] border-zinc-300'
        }`}
      >
        {/* Rich Section 02 Background Art */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <img
            src="/assets/generated/fanart_west_to_ssr.webp"
            alt=""
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover ${
              isDark ? 'opacity-25' : 'opacity-[0.08]'
            }`}
          />
          <div
            className={`absolute inset-0 ${
              isDark ? 'bg-diagonal-slashes opacity-85' : 'bg-diagonal-slashes-light opacity-75'
            }`}
          />
          <div
            className={`absolute -bottom-10 left-8 font-gothic text-[200px] sm:text-[280px] leading-none select-none ${
              isDark ? 'text-red-600/[0.05]' : 'text-red-900/[0.05]'
            }`}
          >
            4BG
          </div>
        </div>

        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <Icon3D src="/assets/generated/icons3d/icon_hierarchy.webp" alt="3D Syndicate Crown" />
              <div>
              <div className="text-xs font-mono-tech font-bold text-red-500 tracking-[0.25em] uppercase mb-1">
                02 // STRUKTUR KOMANDO &amp; CHARACTER SHOWCASE (IME RP)
              </div>
              <h2
                className={`font-display text-5xl sm:text-7xl uppercase tracking-wider leading-none ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}
              >
                SYNDICATE <span className="text-red-600">HIERARCHY</span> SHOWCASE
              </h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: `ALL MEMBERS (${allSpotlightCreators.length})` },
                { id: 'OG', label: `TIER 01 // OG (${allSpotlightCreators.filter((m: any) => m.rank === 'OG').length})` },
                { id: 'Under OG', label: `TIER 02 // UNDER OG (${allSpotlightCreators.filter((m: any) => m.rank === 'Under OG').length})` },
                { id: 'Young Bloods', label: `TIER 03 // YOUNG BLOODS (${allSpotlightCreators.filter((m: any) => m.rank === 'Young Bloods').length})` },
                { id: 'Member', label: `TIER 04 // MEMBERS (${allSpotlightCreators.filter((m: any) => m.rank === 'Member').length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setShowcaseTierFilter(tab.id);
                    setSelectedShowcaseIdx(0);
                  }}
                  className={`px-3.5 py-2 text-xs font-mono-tech font-bold uppercase border cursor-pointer ${
                    showcaseTierFilter === tab.id
                      ? 'bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                      : isDark
                        ? 'bg-[#120A0E]/90 text-zinc-300 border-white/15 hover:text-white'
                        : 'bg-white text-zinc-700 border-zinc-300 hover:border-red-500'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6-Tier Architectural Command Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
            {HIERARCHY_TIERS.map((t) => (
              <div
                key={t.tier}
                className={`border px-3.5 py-3 flex flex-col justify-between hover:border-red-500/50 ${
                  isDark
                    ? 'bg-[#11090D]/90 border-white/15'
                    : 'bg-white/95 border-zinc-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech text-[10px] font-bold text-red-500">
                    TIER {t.tier}
                  </span>
                  <Shield className="w-3 h-3 text-red-500/60" />
                </div>
                <div
                  className={`font-display text-xl tracking-wider mt-1 ${
                    isDark ? 'text-white' : 'text-zinc-900'
                  }`}
                >
                  {t.code}
                </div>
                <div
                  className={`text-[10px] font-mono-tech truncate ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  {t.name}
                </div>
              </div>
            ))}
          </div>

          {/* ALTERNATED LAYOUT: Left 4 Cols Roster Selector | RIGHT 8 Cols Giant Character Stage */}
          {activeShowcaseMember && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* LEFT 4 COLUMNS: Interactive Character Selector Rail */}
              <div
                className={`lg:col-span-4 border flex flex-col justify-between overflow-hidden max-h-[580px] order-2 lg:order-1 ${
                  isDark
                    ? 'bg-[#0E080B]/95 border-white/15'
                    : 'bg-white/95 border-zinc-300 shadow-lg'
                }`}
              >
                <div
                  className={`px-4 py-3.5 border-b flex items-center justify-between ${
                    isDark ? 'bg-[#160C10] border-white/10' : 'bg-zinc-100 border-zinc-200'
                  }`}
                >
                  <span
                    className={`text-xs font-mono-tech font-bold uppercase tracking-wider ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    PILIH KARAKTER SHOWCASE ({showcaseList.length})
                  </span>
                  <span className="font-gothic text-lg text-red-500">4BG</span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {showcaseList.map((member: any, idx: number) => {
                    const isSelected = activeShowcaseMember?.channelId === member.channelId;
                    return (
                      <button
                        key={member.channelId}
                        onClick={() => setSelectedShowcaseIdx(idx)}
                        className={`w-full text-left p-3 border flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-red-600/15 border-red-500 shadow-[inset_4px_0_0_#dc2626]'
                            : isDark
                              ? 'bg-[#120A0E] border-white/10 hover:border-white/30'
                              : 'bg-zinc-50 border-zinc-200 hover:border-red-400'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={member.avatar || '/assets/logo_v2.png'}
                            alt={member.name}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/assets/logo_v2.png';
                            }}
                            className={`w-11 h-11 object-cover border shrink-0 ${
                              isSelected ? 'border-red-500' : 'border-zinc-400/30'
                            }`}
                          />
                          <div className="min-w-0">
                            <div
                              className={`font-display text-xl tracking-wider truncate leading-none ${
                                isDark ? 'text-white' : 'text-zinc-900'
                              }`}
                            >
                              {member.name}
                            </div>
                            <div
                              className={`text-[10px] font-mono-tech truncate mt-1 ${
                                isDark ? 'text-zinc-400' : 'text-zinc-500'
                              }`}
                            >
                              <span className="text-red-500 font-bold">{member.rank}</span>
                              {member.handle ? ` • ${member.handle}` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          {member.isLive && (
                            <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-mono-tech font-bold">
                              LIVE
                            </span>
                          )}
                          <ChevronRight
                            className={`w-4 h-4 ${
                              isSelected ? 'text-red-500' : 'text-zinc-500'
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div
                  className={`p-3 border-t text-[10px] font-mono-tech text-center ${
                    isDark
                      ? 'bg-[#080507] border-white/10 text-zinc-400'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                  }`}
                >
                  Artwork latar tiap anggota dapat diganti dengan Fan Art resmi komunitas 4Bloods.
                </div>
              </div>

              {/* RIGHT 8 COLUMNS: Giant Character & Fan Art Showcase Canvas (MAIN PREVIEW ON RIGHT) */}
              <div className="lg:col-span-8 relative bg-[#0C080A] border border-red-500/40 overflow-hidden min-h-[520px] sm:min-h-[580px] flex flex-col justify-between shadow-2xl order-1 lg:order-2">
                <div className="absolute inset-0 z-0">
                  <img
                    src={getMemberShowcaseArtwork(activeShowcaseMember)}
                    alt={activeShowcaseMember.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        '/assets/generated/fanart_council.webp';
                    }}
                    className="w-full h-full object-cover opacity-90 transition-all duration-700 brightness-105 contrast-105"
                  />
                  {/* Subtle readable gradient for text legibility without making the art dark */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070506]/95 via-[#070506]/35 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#070506]/75 via-[#070506]/20 to-transparent" />
                </div>

                {/* Top Showcase Bar */}
                <div className="relative z-10 p-5 sm:p-7 flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/80 border border-red-500/30 text-zinc-200 text-[10px] font-mono-tech backdrop-blur-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    <span className="font-bold text-red-500">DOSSIER</span>
                    <span className="text-zinc-500">•</span>
                    <span>{activeShowcaseMember.rank.toUpperCase()} ARCHIVE</span>
                  </div>

                  <div className="flex items-center gap-2 bg-black/80 p-1 border border-white/15 backdrop-blur-xs">
                    <button
                      onClick={() =>
                        setLightboxImage({
                          src: getMemberShowcaseArtwork(activeShowcaseMember),
                          title: `${activeShowcaseMember.name} — ${activeShowcaseMember.rank}`,
                          subtitle: `Arsip Visual 4Bloods // ${activeShowcaseMember.role || activeShowcaseMember.rank}`,
                        })
                      }
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600 border border-red-500/40 hover:border-red-500 text-zinc-200 hover:text-white text-[10px] font-mono-tech font-bold uppercase cursor-pointer flex items-center gap-1.5 transition-all"
                      title="Perbesar Artwork"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>PERBESAR ARTWORK</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Character Dossier Overlay */}
                <div className="relative z-10 p-6 sm:p-8 space-y-6 mt-auto text-white">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div className="flex items-end gap-5">
                      <div className="relative shrink-0">
                        <img
                          src={activeShowcaseMember.avatar || '/assets/logo_v2.png'}
                          alt={activeShowcaseMember.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/assets/logo_v2.png';
                          }}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover border-2 border-red-600 bg-zinc-900 shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                        />
                        <span className="absolute -top-2.5 -left-2.5 px-2 py-0.5 bg-red-600 text-white font-gothic text-sm">
                          4BG
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-red-600 text-white text-[10px] font-mono-tech font-bold uppercase tracking-widest">
                            {activeShowcaseMember.rank}
                          </span>
                          <span className="text-xs font-mono-tech text-zinc-300">
                            {activeShowcaseMember.handle || '@4bloods_member'}
                          </span>
                          {activeShowcaseMember.isLive && (
                            <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-mono-tech font-bold uppercase flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              <span>LIVE DI IME RP</span>
                              {typeof activeShowcaseMember.viewerCount === 'number' &&
                                activeShowcaseMember.viewerCount > 0 && (
                                  <span className="border-l border-white/30 pl-1.5 text-emerald-100 font-normal flex items-center gap-1">
                                    <Users className="w-2.5 h-2.5" />
                                    <span>
                                      {activeShowcaseMember.viewerCount.toLocaleString('id-ID')} PENONTON
                                    </span>
                                  </span>
                                )}
                            </span>
                          )}
                        </div>

                        <h3 className="font-display text-5xl sm:text-7xl text-white uppercase tracking-wider leading-none">
                          {activeShowcaseMember.name}
                        </h3>

                        <p className="font-script text-2xl text-red-400">
                          {activeShowcaseMember.role ||
                            `${activeShowcaseMember.rank} // Four Bloods Gang`}
                        </p>
                      </div>
                    </div>

                    {/* Prev / Next Character Showcase Controls */}
                    <div className="flex items-center gap-2 self-start sm:self-end">
                      <button
                        onClick={() =>
                          setSelectedShowcaseIdx(
                            (prev) => (prev - 1 + showcaseList.length) % showcaseList.length
                          )
                        }
                        className="p-3 bg-black/80 hover:bg-red-600 border border-white/15 text-white transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-2 bg-black/80 border border-white/15 text-xs font-mono-tech text-zinc-300">
                        {selectedShowcaseIdx + 1} / {showcaseList.length}
                      </span>
                      <button
                        onClick={() =>
                          setSelectedShowcaseIdx((prev) => (prev + 1) % showcaseList.length)
                        }
                        className="p-3 bg-black/80 hover:bg-red-600 border border-white/15 text-white transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Character Actions */}
                  <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {(activeShowcaseMember.isLive || activeShowcaseMember.featuredVideoId) && (
                        <button
                          onClick={() =>
                            setVideoModal({
                              videoId: activeShowcaseMember.isLive
                                ? activeShowcaseMember.videoId
                                : activeShowcaseMember.featuredVideoId,
                              title:
                                (activeShowcaseMember.isLive
                                  ? activeShowcaseMember.streamTitle
                                  : activeShowcaseMember.featuredTitle) ||
                                `${activeShowcaseMember.name} — 4Bloods IME RP POV`,
                              streamer: `${activeShowcaseMember.name} (${activeShowcaseMember.rank})`,
                            })
                          }
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-mono-tech font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          {activeShowcaseMember.isLive ? 'TONTON LIVE STREAM' : 'PUTAR POV UNGGULAN'}
                        </button>
                      )}

                      {activeShowcaseMember.isLive && (
                        <Link
                          href={`/cam?watch=${activeShowcaseMember.channelId}`}
                          className="px-4 py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-mono-tech font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                        >
                          <Tv className="w-3.5 h-3.5 text-red-600" />
                          BUKA DI MULTI-POV CAM
                        </Link>
                      )}

                      <a
                        href={
                          activeShowcaseMember.handle
                            ? `https://www.youtube.com/${activeShowcaseMember.handle}`
                            : `https://www.youtube.com/channel/${activeShowcaseMember.channelId}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 bg-black/80 hover:bg-white/10 border border-white/20 text-xs font-mono-tech text-zinc-200 flex items-center gap-2 cursor-pointer"
                      >
                        <span>YOUTUBE CHANNEL</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <span className="text-[11px] font-mono-tech text-zinc-400">
                      IME ROLEPLAY // SOUTH SIDE ROXWOOD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          SECTION 03 — OFFICIAL 3D SHOWROOM & APPAREL CODEX
          Marketplace Catalog & 3D Interactive Fitting Room Showcase
      ===================================================================== */}
      <ShowroomCodex isDark={isDark} onOpenLightbox={setLightboxImage} />

      {/* =====================================================================
          SECTION 04 — 4BLOODS RECORDS: SPINNING VINYL SLEEVE & STUDIO TRACKLIST
          Layout Rhythm: LEFT 5 Cols Spinning Vinyl Sleeve | Right 7 Cols Studio Tracklist
          Background: Warm Analog Recording Studio + Concentric Vinyl Grooves
      ===================================================================== */}
      <section
        id="records"
        className={`py-24 border-b relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-tr from-[#08080C] via-[#0E0C12] to-[#07060A] border-red-500/20'
            : 'bg-gradient-to-tr from-[#EDE9E1] via-[#E2DED5] to-[#EDE9E1] border-zinc-300'
        }`}
      >
        {/* Rich Section 04 Background Art: Concentric Vinyl Grooves + Blurred Track Cover */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <img
            src={activeTrack.thumb}
            alt=""
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover ${
              isDark ? 'opacity-15' : 'opacity-10'
            }`}
          />
          <div className="absolute inset-0 bg-vinyl-grooves opacity-85" />
          <div
            className={`absolute -bottom-14 right-10 font-display text-[170px] sm:text-[240px] leading-none select-none ${
              isDark ? 'text-red-500/[0.05]' : 'text-red-900/[0.05]'
            }`}
          >
            RECORDS
          </div>
        </div>

        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <Icon3D src="/assets/generated/icons3d/icon_records.webp" alt="3D Vinyl Record" />
              <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono-tech font-bold text-red-500 tracking-[0.25em] uppercase mb-1">
                <Disc3 className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>04 // 4BLOODS RECORDS — UNDERGROUND SOUNDTRACK &amp; DISS TRACKS</span>
              </div>
              <h2
                className={`font-display text-5xl sm:text-7xl uppercase tracking-wider leading-none ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}
              >
                OFFICIAL <span className="text-red-600">MV &amp; DISS TRACKS</span>
              </h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'ALL', label: 'ALL RELEASES (5)' },
                { id: 'MV', label: 'OFFICIAL MV & ANTHEMS (3)' },
                { id: 'DISS', label: 'WAR DISS TRACKS (2)' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTrackFilter(t.id as any);
                    const first = OFFICIAL_MEDIA_TRACKS.find((tr) =>
                      t.id === 'MV'
                        ? tr.type !== 'DISS TRACK'
                        : t.id === 'DISS'
                          ? tr.type === 'DISS TRACK'
                          : true
                    );
                    if (first) setSelectedTrackId(first.id);
                  }}
                  className={`px-4 py-2.5 text-xs font-mono-tech font-bold uppercase border cursor-pointer ${
                    trackFilter === t.id
                      ? 'bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                      : isDark
                        ? 'bg-[#120A0E]/90 text-zinc-300 border-white/15 hover:text-white'
                        : 'bg-white text-zinc-700 border-zinc-300 hover:border-red-500'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* LEFT 5 COLUMNS: Active Vinyl Record Sleeve & Direct MV Trigger */}
            <Tilt3DCard
              intensity={10}
              onClick={() =>
                setVideoModal({
                  videoId: activeTrack.videoId,
                  title: activeTrack.title,
                  streamer: `${activeTrack.artist} // ${activeTrack.type}`,
                })
              }
              className={`lg:col-span-5 border p-6 sm:p-8 flex flex-col justify-between cursor-pointer group relative overflow-hidden ${
                isDark
                  ? 'bg-[#0E080B]/95 border-red-500/40 shadow-2xl'
                  : 'bg-white/95 border-zinc-300 shadow-xl'
              }`}
            >
              <div className="relative my-4 flex items-center justify-center">
                <div
                  className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-zinc-950 border-4 border-zinc-800 shadow-2xl flex items-center justify-center translate-x-10 sm:translate-x-14 group-hover:translate-x-20 transition-transform duration-500 animate-spin"
                  style={{ animationDuration: '9s' }}
                >
                  <div className="w-44 h-44 rounded-full border border-white/10 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-red-600 border-4 border-black flex items-center justify-center">
                      <span className="font-gothic text-lg text-white">4BG</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 w-60 h-60 sm:w-68 sm:h-68 -translate-x-8 sm:-translate-x-10 bg-black border-2 border-white/20 shadow-[0_25px_50px_rgba(0,0,0,0.9)] overflow-hidden">
                  <img
                    src={activeTrack.thumb}
                    alt={activeTrack.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/assets/yt_this_is_4bloods.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 bg-red-600 text-white text-[10px] font-mono-tech font-bold uppercase">
                      {activeTrack.type}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-red-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.8)] group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-red-500/20">
                <div className="flex items-center justify-between text-xs font-mono-tech">
                  <span className="text-red-500 font-bold uppercase">{activeTrack.artist}</span>
                  <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                    DURASI: {activeTrack.duration}
                  </span>
                </div>
                <h3
                  className={`font-display text-4xl sm:text-5xl tracking-wider uppercase leading-none ${
                    isDark ? 'text-white' : 'text-zinc-900'
                  }`}
                >
                  {activeTrack.title}
                </h3>
                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    isDark ? 'text-zinc-300' : 'text-zinc-600'
                  }`}
                >
                  {activeTrack.description}
                </p>
                <div className="pt-2">
                  <span className="w-full py-3 bg-red-600 group-hover:bg-red-500 text-white text-xs font-mono-tech font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <Play className="w-4 h-4 fill-white" />
                    PUTAR VIDEO KLIP (MV) SEKARANG
                  </span>
                </div>
              </div>
            </Tilt3DCard>

            {/* RIGHT 7 COLUMNS: Interactive Studio Master Tracklist Ledger */}
            <div
              className={`lg:col-span-7 border flex flex-col justify-between ${
                isDark
                  ? 'bg-[#0D080B]/95 border-white/15'
                  : 'bg-white/95 border-zinc-300 shadow-lg'
              }`}
            >
              <div
                className={`px-6 py-4 border-b flex items-center justify-between ${
                  isDark ? 'bg-[#150C10] border-white/10' : 'bg-zinc-100 border-zinc-200'
                }`}
              >
                <span
                  className={`text-xs font-mono-tech font-bold uppercase tracking-widest ${
                    isDark ? 'text-white' : 'text-zinc-900'
                  }`}
                >
                  4BG MASTER RECORDINGS // TRACKLIST DECK
                </span>
                <span className="text-[11px] font-mono-tech text-red-500 font-bold">
                  KLIK BARIS UNTUK PREVIEW • KLIK PLAY UNTUK MV
                </span>
              </div>

              <div className="divide-y divide-current/10 flex-1">
                {filteredTracks.map((track, idx) => {
                  const isSelected = track.id === activeTrack.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => setSelectedTrackId(track.id)}
                      className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer ${
                        isSelected
                          ? isDark
                            ? 'bg-red-600/15 shadow-[inset_4px_0_0_#dc2626]'
                            : 'bg-red-50 shadow-[inset_4px_0_0_#dc2626]'
                          : isDark
                            ? 'hover:bg-white/[0.03]'
                            : 'hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span
                          className={`font-display text-3xl w-8 shrink-0 ${
                            isSelected
                              ? 'text-red-500'
                              : isDark
                                ? 'text-zinc-600'
                                : 'text-zinc-400'
                          }`}
                        >
                          0{idx + 1}
                        </span>

                        <img
                          src={track.thumb}
                          alt={track.title}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              '/assets/yt_this_is_4bloods.jpg';
                          }}
                          className="w-16 h-11 object-cover border border-red-500/30 shrink-0"
                        />

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-0.5 text-[9px] font-mono-tech font-bold uppercase ${
                                track.type === 'DISS TRACK'
                                  ? 'bg-red-600 text-white'
                                  : isDark
                                    ? 'bg-white/10 text-zinc-200'
                                    : 'bg-zinc-200 text-zinc-800'
                              }`}
                            >
                              {track.type}
                            </span>
                            <span
                              className={`text-[11px] font-mono-tech truncate ${
                                isDark ? 'text-zinc-400' : 'text-zinc-500'
                              }`}
                            >
                              {track.artist} {track.target ? `• ${track.target}` : ''}
                            </span>
                          </div>
                          <h4
                            className={`font-display text-2xl sm:text-3xl tracking-wider truncate mt-0.5 ${
                              isDark ? 'text-white' : 'text-zinc-900'
                            }`}
                          >
                            {track.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <span
                          className={`text-xs font-mono-tech ${
                            isDark ? 'text-zinc-400' : 'text-zinc-500'
                          }`}
                        >
                          {track.duration}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setVideoModal({
                              videoId: track.videoId,
                              title: track.title,
                              streamer: `${track.artist} // ${track.type}`,
                            });
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono-tech font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>PLAY MV</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                className={`px-6 py-3.5 border-t text-xs font-mono-tech flex flex-wrap items-center justify-between gap-2 ${
                  isDark
                    ? 'bg-[#080507] border-white/10 text-zinc-400'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                }`}
              >
                <span>INGIN DENGAR LAGU SAMBIL SCROLL?</span>
                <span className="text-red-500 font-bold">
                  TARIK TAB &ldquo;4BG SONG LIST&rdquo; DI SISI KANAN LAYAR →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 05 — IME RP WAR CINEMA & ARCHIVES
          Layout Rhythm: TOP WIDESCREEN CINEMA BANNER + BOTTOM HORIZONTAL VHS FILMSTRIP GRID
          Background: Tactical War Room Mural & Film Grain
      ===================================================================== */}
      <section
        id="archives"
        className={`py-24 border-b relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-[#100508] via-[#090306] to-[#0E0407] border-red-600/35'
            : 'bg-gradient-to-br from-[#FDF2F4] via-[#F8E2E6] to-[#FDF2F4] border-red-300'
        }`}
      >
        {/* Cinematic Turf Wallpaper (Vivid, Clear & Atmospheric Roxwood Scenery) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <img
            src="/assets/hood_roxwood.webp"
            alt="Cinematic Backdrop"
            className={`w-full h-full object-cover object-center ${
              isDark ? 'opacity-40 brightness-80 contrast-115' : 'opacity-[0.10] grayscale'
            }`}
          />
          <div
            style={{
              background:
                'radial-gradient(circle at 50% 35%, rgba(0,0,0,0.2) 0%, rgba(9,3,6,0.88) 75%)',
            }}
            className="absolute inset-0 pointer-events-none"
          />
          <div className="absolute inset-0 bg-film-grain opacity-45" />
        </div>

        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <Icon3D src="/assets/generated/icons3d/icon_archives.webp" alt="3D VHS Archive" />
              <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono-tech font-bold text-red-500 tracking-[0.25em] uppercase mb-1">
                <Film className="w-3.5 h-3.5" />
                <span>05 // DOKUMENTASI PERANG, KOMANDO &amp; SOLIDARITAS IME RP</span>
              </div>
              <h2
                className={`font-display text-5xl sm:text-7xl uppercase tracking-wider leading-none ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}
              >
                WAR CINEMA &amp; <span className="text-red-600">ARCHIVES</span>
              </h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'ALL', label: 'SEMUA REKAMAN (9)' },
                { id: 'WAR', label: 'WAR & PURSUIT POV' },
                { id: 'LORE', label: 'COMMAND & SOLIDARITY' },
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    setWarFilter(w.id as any);
                    const first = WAR_ARCHIVES.find((war) =>
                      w.id === 'WAR'
                        ? war.category.includes('WAR') || war.category.includes('PURSUIT')
                        : w.id === 'LORE'
                          ? !war.category.includes('WAR') && !war.category.includes('PURSUIT')
                          : true
                    );
                    if (first) setSelectedWarId(first.id);
                  }}
                  className={`px-4 py-2.5 text-xs font-mono-tech font-bold uppercase border cursor-pointer ${
                    warFilter === w.id
                      ? 'bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                      : isDark
                        ? 'bg-[#120A0E]/90 text-zinc-300 border-white/15 hover:text-white'
                        : 'bg-white text-zinc-700 border-zinc-300 hover:border-red-500'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* 1. TOP FULL-WIDTH WIDESCREEN FEATURED WAR CINEMA STAGE */}
          <div
            onClick={() =>
              setVideoModal({
                videoId: activeWarTape.videoId,
                title: activeWarTape.title,
                streamer: `${activeWarTape.streamer} // ${activeWarTape.rank}`,
              })
            }
            className={`border overflow-hidden grid grid-cols-1 lg:grid-cols-12 cursor-pointer group mb-6 ${
              isDark
                ? 'bg-[#0C070A]/95 border-red-500/45 shadow-[0_25px_70px_rgba(0,0,0,0.85)]'
                : 'bg-white border-zinc-300 shadow-2xl'
            }`}
          >
            {/* Widescreen Dossier Info on Left 5 Cols */}
            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between gap-6 order-2 lg:order-1">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-mono-tech font-bold uppercase tracking-widest">
                    FEATURED TAPE // {activeWarTape.category}
                  </span>
                  <span
                    className={`px-2.5 py-1 border text-[10px] font-mono-tech uppercase ${
                      isDark
                        ? 'bg-black/60 border-white/15 text-zinc-300'
                        : 'bg-zinc-100 border-zinc-300 text-zinc-700'
                    }`}
                  >
                    IME ROLEPLAY
                  </span>
                </div>

                <div>
                  <div className="text-xs font-mono-tech text-red-500 font-bold uppercase tracking-widest">
                    POV KOMANDO: {activeWarTape.streamer} ({activeWarTape.rank})
                  </div>
                  <h3
                    className={`font-display text-4xl sm:text-6xl tracking-wider uppercase leading-none mt-2 ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    {activeWarTape.title}
                  </h3>
                </div>

                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    isDark ? 'text-zinc-300' : 'text-zinc-600'
                  }`}
                >
                  Rekaman arsip pertempuran, pengawalan konvoi, dan solidaritas keluarga besar{' '}
                  <strong>Four Bloods Gang (4BG)</strong> di wilayah South Side Roxwood.
                </p>
              </div>

              <div className="pt-4 border-t border-current/10 flex flex-wrap items-center justify-between gap-3">
                <span className="px-6 py-3.5 bg-red-600 group-hover:bg-red-500 text-white text-xs font-mono-tech font-bold uppercase tracking-widest flex items-center gap-2.5 shadow-lg">
                  <Play className="w-4 h-4 fill-white" />
                  PUTAR REKAMAN LAYAR PENUH
                </span>
                <span className="font-gothic text-2xl text-red-600">4BG</span>
              </div>
            </div>

            {/* Widescreen 16:9 Cinema Frame on Right 7 Cols */}
            <div className="lg:col-span-7 relative aspect-video bg-black overflow-hidden order-1 lg:order-2">
              <img
                src={activeWarTape.thumb}
                alt={activeWarTape.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/streams/war_allstar.jpg';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent hidden lg:block" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-red-600 text-white flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.85)] group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-white ml-0.5" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. BOTTOM HORIZONTAL VHS TAPE SELECTOR STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredWarArchives.map((war, idx) => {
              const isSelected = war.id === activeWarTape.id;
              return (
                <div
                  key={war.id}
                  onClick={() => setSelectedWarId(war.id)}
                  className={`p-3 border flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-red-600/20 border-red-500 shadow-[inset_4px_0_0_#dc2626]'
                        : 'bg-red-50 border-red-500 shadow-[inset_4px_0_0_#dc2626]'
                      : isDark
                        ? 'bg-[#0E090C]/90 border-white/15 hover:border-red-500/50'
                        : 'bg-white/95 border-zinc-300 hover:border-red-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono-tech text-xs font-bold text-red-500 w-5 shrink-0">
                      0{idx + 1}
                    </span>
                    <img
                      src={war.thumb}
                      alt={war.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          '/assets/streams/war_allstar.jpg';
                      }}
                      className="w-20 h-12 object-cover border border-red-500/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[9px] font-mono-tech text-red-500 font-bold uppercase truncate">
                        {war.category} • {war.streamer}
                      </div>
                      <div
                        className={`font-display text-lg tracking-wider truncate ${
                          isDark ? 'text-white' : 'text-zinc-900'
                        }`}
                      >
                        {war.title}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoModal({
                        videoId: war.videoId,
                        title: war.title,
                        streamer: `${war.streamer} // ${war.rank}`,
                      });
                    }}
                    className="p-2 bg-red-600 hover:bg-red-500 text-white shrink-0 cursor-pointer"
                    title="Langsung Putar Video"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 06 — 54 OFFICIAL STREAMERS WALL (IME RP)
          Background: Roxwood Broadcast Matrix with Dual Crimson/Amber Spotlights
      ===================================================================== */}
      <section
        id="roster"
        className={`py-24 border-b relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-[#181422] via-[#221C2D] to-[#16121F] border-zinc-500/25'
            : 'bg-gradient-to-b from-[#EAE8E2] via-[#DFDCD5] to-[#E9E7E0] border-zinc-300'
        }`}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div
            className={`absolute inset-0 ${
              isDark ? 'bg-tactical-grid opacity-65' : 'bg-cam-light-grid opacity-65'
            }`}
          />
          <div
            style={{
              background: 'radial-gradient(circle, rgba(220,38,38,0.18) 0%, rgba(220,38,38,0) 70%)',
            }}
            className="absolute -top-24 left-1/3 w-[600px] h-[600px] rounded-full pointer-events-none"
          />
          <div
            className={`absolute bottom-0 right-10 font-display text-[180px] sm:text-[250px] leading-none select-none ${
              isDark ? 'text-red-500/[0.05]' : 'text-zinc-900/[0.04]'
            }`}
          >
            54 POV
          </div>
        </div>

        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 relative z-10">
          <YouTubeCarousel3D
            streamers={streamers}
            isDark={isDark}
            onOpenVideo={(v) => setVideoModal(v)}
            title="54 OFFICIAL STREAMERS"
            subtitle="Jaringan kreator resmi Four Bloods Gang di YouTube beserta status siaran langsung real-time di South Side Roxwood (IME RP)."
            sectionBadge="06 // JARINGAN KREATOR RESMI 4BLOODS DI IME RP"
          />
        </div>
      </section>

      {/* =====================================================================
          MONUMENTAL FOOTER & SIGNATURE BOTTOM BAR — FAN-MADE BY (FINN)EGAN DAVIS
      ===================================================================== */}
      <footer
        className={`border-t ${
          isDark ? 'bg-[#050304] border-white/10' : 'bg-[#120D10] border-zinc-300 text-white'
        }`}
      >
        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 py-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 border-b border-white/10">
          <div className="flex items-center gap-5">
            <img
              src="/assets/logo_v2.png"
              alt="4BG Emblem"
              className="w-16 h-16 object-contain drop-shadow-[0_0_25px_rgba(220,38,38,0.5)]"
            />
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="font-gothic text-3xl sm:text-4xl text-white">4BG</span>
                <span className="font-script text-2xl text-red-400">Four Bloods Gang</span>
              </div>
              <p className="text-xs font-mono-tech text-zinc-400 tracking-widest uppercase mt-1">
                IME ROLEPLAY (IME RP) // SOUTH SIDE ROXWOOD // POSTAL 1051–1052
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/cam"
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer"
            >
              <Tv className="w-4 h-4" />
              OPEN 4BLOODS CAM
            </Link>
          </div>
        </div>

        {/* Signature Bottom Bar: Fan-Made by (Finn)egan Davis */}
        <div className="bg-[#030203] py-5 px-4 sm:px-8">
          <div className="max-w-[1520px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-tech text-zinc-400">
            <div className="flex items-center gap-2 tracking-wider uppercase">
              <span className="w-2 h-2 bg-red-600 inline-block" />
              <span>IME ROLEPLAY // BLOOD IN, BLOOD OUT // FOUR BLOODS GANG ARCHIVE</span>
            </div>

            <div className="px-4 py-2 bg-white/[0.03] border border-white/10 text-zinc-300 tracking-wider">
              FAN-MADE OFFICIAL CONCEPT BY{' '}
              <span className="text-white">
                <strong className="font-extrabold text-red-500">Finn</strong>egan Davis
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          LIGHTBOX MODAL
      ===================================================================== */}
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
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/logo_v2.png';
                }}
                className="max-h-[72vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          FULLSCREEN VIDEO STREAM / MV MODAL
      ===================================================================== */}
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
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
