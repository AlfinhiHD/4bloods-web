'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ThreeLogoHero from '@/components/ThreeLogoHero';
import Icon3D from '@/components/Icon3D';
import {
  LORE_CHAPTERS,
  HIERARCHY_TIERS,
  OFFICIAL_MEDIA_TRACKS,
  STREAMER_ROSTER,
} from '@/data/4bloods-data';
import {
  Play,
  Tv,
  BookOpen,
  Users,
  Compass,
  ExternalLink,
  Shield,
  Film,
  Disc3,
  Sparkles,
  ChevronRight,
  ArrowRight,
  X,
  Flame,
  Award,
  Radio,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

function YouTubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// Curated high-impact YouTube videos from top 4Bloods creators (reserving 1 for Brando as allowed)
interface HighlightVideo {
  id: string;
  videoId: string;
  title: string;
  creator: string;
  handle: string;
  rank: string;
  category: 'TURF DEFENSE' | 'WAR POV' | 'COMMUNITY' | 'TACTICAL' | 'OG LEGEND';
  thumb: string;
  badge: string;
  description: string;
}

const HIGHLIGHT_VIDEOS: HighlightVideo[] = [
  {
    id: 'nahmier-roxwood',
    videoId: 'ylYwKzRaYeQ',
    title: 'ROXWOOD SEMAKIN MEMANAS INIKAH SAATNYA?! BHB BERSIAPLAH',
    creator: 'Nahmier Davies',
    handle: '@NAHMIER',
    rank: 'UNDER OG // HOOD PRESIDENT',
    category: 'TURF DEFENSE',
    thumb: '/assets/streams/nahmier_roxwood.jpg',
    badge: 'HOT TRENDING',
    description: 'Komando lapangan Nahmier mempertahankan kedaulatan teritori Roxwood saat tensi memuncak antarfaksi besar.',
  },
  {
    id: 'asep-top1',
    videoId: 'UG1hYx8jSeA',
    title: 'THIS IS ASEP 4BLOODS — TOP 1 WARRANT LOS SANTOS',
    creator: 'Asep Teriyaki',
    handle: '@BarevsKi',
    rank: 'UNDER OG',
    category: 'WAR POV',
    thumb: '/assets/streams/asep_top1.jpg',
    badge: 'MOST WANTED',
    description: 'Aksi kejar-kejaran intens di Los Santos saat Asep memuncaki status buronan nomor satu di kepolisian kota.',
  },
  {
    id: 'louis-dakwah',
    videoId: 'OIM_8ZymT60',
    title: 'SANTRI LV BERI DAKWAH KE ANAK-ANAK 4BLOODS',
    creator: 'Louis Ven',
    handle: '@AkbarRangers',
    rank: 'ORIGINAL GANGSTER (OG)',
    category: 'COMMUNITY',
    thumb: '/assets/streams/war_mx69.jpg',
    badge: 'ICONIC RP',
    description: 'Momen kultural khas 4Bloods: wejangan dan diplomasi santai namun penuh wibawa dari sang Supreme Strategist.',
  },
  {
    id: 'sumbul-garda',
    videoId: 'UWzNP0fxL_A',
    title: 'SUMBUL SIAP MENJADI GARDA TERDEPAN 4BLOODS',
    creator: 'Muhammad Sumbul',
    handle: '@Ritsutakaa',
    rank: 'ORIGINAL GANGSTER (OG)',
    category: 'TACTICAL',
    thumb: '/assets/streams/deja_charity.jpg',
    badge: 'VANGUARD',
    description: 'Kesiagaan armada perang 4Bloods di garis depan menyambut segala potensi gesekan di jalanan Roxwood.',
  },
  {
    id: 'allstar-20v20',
    videoId: 'a3NgNy4NDMU',
    title: 'AFTERNOON LEAGUE WAR!! 4BLOODS VS ALLSTAR (20 VS 20 ALLCLASS)',
    creator: 'Ackai / War Archive',
    handle: '@Ackaiii',
    rank: 'UNDER OG',
    category: 'WAR POV',
    thumb: '/assets/streams/war_allstar.jpg',
    badge: '20V20 TOURNAMENT',
    description: 'Pertempuran terorganisir 20 lawan 20 kelas all-out yang memperlihatkan kedisiplinan dan koordinasi taktis 4Bloods.',
  },
  {
    id: '51reaver-pecah',
    videoId: '9hhP8B0dDN8',
    title: 'PERANG PANAS!! 4BLOODS VS 51REAVER PECAH DI ROXWOOD',
    creator: 'Jane Elisha',
    handle: '@Deciii08',
    rank: 'UNDER OG',
    category: 'TURF DEFENSE',
    thumb: '/assets/streams/war_51reaver.jpg',
    badge: 'CLUTCH DEFENSE',
    description: 'Baku tembak jarak dekat mempertahankan blok pemukiman Roxwood dari serbuan skuad rival 51Reaver.',
  },
  {
    id: 'ilham-return',
    videoId: 'LwzAe09GEH8',
    title: 'ILHAM THE RED BANDANA — 4BLOOD IS BACK LETS GO!',
    creator: 'Ilham Joseph (Windah Basudara)',
    handle: '@brandochillgames',
    rank: 'ORIGINAL GANGSTER (OG)',
    category: 'OG LEGEND',
    thumb: '/assets/streams/ilham_back.jpg',
    badge: 'LEGENDARY COMEBACK',
    description: 'Momen legendaris kembalinya sang pendiri Ilham ke Los Santos, menyatukan kembali ribuan pendukung bendera merah.',
  },
  {
    id: 'nahmier-cayo',
    videoId: 'fToo-U7hAs8',
    title: 'MISI MEMPEREBUTKAN PULAU CAYO!! KOMANDO PENUH 4BLOODS',
    creator: 'Nahmier Davies',
    handle: '@NAHMIER',
    rank: 'UNDER OG // HOOD PRESIDENT',
    category: 'TACTICAL',
    thumb: '/assets/streams/nahmier_cayo.jpg',
    badge: 'SPECIAL OPERATION',
    description: 'Operasi amfibi gabungan merebut kendali pulau Cayo Perico dengan manuver serentak armada tempur 4Bloods.',
  },
];

// High Council / Founding Pillars spotlight
const KEY_PILLARS = [
  {
    name: 'Ilham Joseph',
    rank: 'ORIGINAL GANGSTER (OG)',
    role: 'Founding Father // The Red Bandana',
    handle: '@brandochillgames',
    avatar: '/assets/avatars/UCzjGSL8HMCRUi1sWH5VYGjQ.jpg',
    fanart: '/assets/generated/fanart_council.webp',
    bio: 'Simbol kepemimpinan moral dan magnet utama persatuan keluarga besar 4Bloods sejak era awal West Side Los Santos.',
  },
  {
    name: 'Louis Ven',
    rank: 'ORIGINAL GANGSTER (OG)',
    role: 'Supreme Strategist & Diplomat',
    handle: '@AkbarRangers',
    avatar: '/assets/avatars/UC79cKOK5rTIABhvXxeINdHw.jpg',
    fanart: '/assets/generated/fanart_roxwood.webp',
    bio: 'Pilar strategi jangka panjang, negosiasi antarfaksi tingkat tinggi, dan penasihat dewan kehormatan 4Bloods.',
  },
  {
    name: 'Muhammad Sumbul',
    rank: 'ORIGINAL GANGSTER (OG)',
    role: 'Vanguard Commander // Frontline Shield',
    handle: '@Ritsutakaa',
    avatar: '/assets/avatars/UCYjUv-UeZ36z6-qE1V2sL8g.jpg',
    fanart: '/assets/generated/fanart_west_to_ssr.webp',
    bio: 'Panglima garda terdepan dengan loyalitas baja yang memimpin pertahanan turf dan perlindungan keluarga.',
  },
  {
    name: 'Deja Amari',
    rank: 'ORIGINAL GANGSTER (OG)',
    role: 'Tactical Operations & Community Pillar',
    handle: '@DEJ4AA',
    avatar: '/assets/avatars/UC0l8qL2FpYxO8cM7QkZ_zpw.jpg',
    fanart: '/assets/generated/fanart_west_to_ssr.webp',
    bio: 'Penggerak koordinasi operasional taktis, kegiatan amal sosial, dan perekat solidaritas seluruh divisi 4Bloods.',
  },
  {
    name: 'Nahmier Davies',
    rank: 'UNDER OG // HOOD PRESIDENT',
    role: 'Field Commander & Hood Marshal',
    handle: '@NAHMIER',
    avatar: '/assets/avatars/UCRWc_9hD6v-7v2BqV0_8Y0Q.jpg',
    fanart: '/assets/generated/fanart_roxwood.webp',
    bio: 'Panglima operasional harian di Roxwood, memegang komando mutlak lapangan saat pertempuran dan patroli teritori.',
  },
  {
    name: 'Asep Teriyaki',
    rank: 'UNDER OG // TACTICAL STRIKE',
    role: 'Top 1 Warrant // Gunner Specialist',
    handle: '@BarevsKi',
    avatar: '/assets/avatars/UCjM9N0F9P_a7jQ5QZ3k1k_w.jpg',
    fanart: '/assets/generated/fanart_west_to_ssr.webp',
    bio: 'Eksekutor lapangan paling berbahaya dengan presisi tembakan tinggi, disegani kawan maupun lawan di Los Santos.',
  },
];

export default function OverviewPortalPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [heroLogoOption, setHeroLogoOption] = useState<'ORI' | '3D' | 'V1'>('ORI');
  const [videoFilter, setVideoFilter] = useState<'ALL' | 'TURF DEFENSE' | 'WAR POV' | 'COMMUNITY' | 'TACTICAL'>('ALL');
  const [videoModal, setVideoModal] = useState<{ videoId: string; title: string; streamer: string } | null>(null);

  // Live Streamers Data
  const [streamers, setStreamers] = useState<any[]>(STREAMER_ROSTER);
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [isStreamersLoading, setIsStreamersLoading] = useState<boolean>(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('4bg_theme') || localStorage.getItem('4bs_cam_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    } catch {}

    setIsStreamersLoading(true);
    fetch('/api/streamers')
      .then((res) => (res.ok ? res.json() : null))
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
      .catch(() => {})
      .finally(() => setIsStreamersLoading(false));
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

  const filteredVideos = useMemo(() => {
    if (videoFilter === 'ALL') return HIGHLIGHT_VIDEOS;
    return HIGHLIGHT_VIDEOS.filter((v) => v.category === videoFilter);
  }, [videoFilter]);

  const liveStreamersList = useMemo(() => {
    return streamers.filter((s) => s.isLive);
  }, [streamers]);

  return (
    <div
      className={`min-h-screen font-body transition-colors duration-300 selection:bg-red-600 selection:text-white ${
        isDark ? 'bg-[#080507] text-[#EDE7DE]' : 'bg-[#FAF8F5] text-zinc-900'
      }`}
    >
      <Navbar
        liveCount={liveCount}
        isLoadingLive={isStreamersLoading}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* =====================================================================
          HERO SECTION — 4BLOODS SYNDICATE SHOWCASE
      ===================================================================== */}
      <section
        className={`relative min-h-[92vh] pt-24 pb-16 flex flex-col justify-center overflow-hidden border-b ${
          isDark
            ? 'bg-[#090306] border-red-500/25'
            : 'bg-gradient-to-b from-[#FAF8F5] via-[#EDE7DE] to-[#F5F0E8] border-zinc-300'
        }`}
      >
        {/* Ambient Hero Backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/assets/hero_bg.webp"
            alt="Hero Background"
            className={`w-full h-full object-cover object-center ${
              isDark ? 'opacity-70 brightness-90 contrast-105' : 'opacity-25 brightness-105'
            }`}
          />
          <div
            className={`absolute inset-0 ${
              isDark
                ? 'bg-gradient-to-b from-black/60 via-black/40 to-[#080507]'
                : 'bg-gradient-to-b from-white/70 via-white/50 to-[#FAF8F5]'
            }`}
          />
          <div
            className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none ${
              isDark ? 'bg-red-600/20' : 'bg-red-500/10'
            }`}
          />
          <div
            className={`absolute top-1/2 -right-32 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none ${
              isDark ? 'bg-red-900/25' : 'bg-red-400/10'
            }`}
          />
        </div>

        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 relative z-10 w-full py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Col: Core Narrative & Actions (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/15 border border-red-500/30 text-red-500 text-xs font-mono-tech font-bold uppercase tracking-widest backdrop-blur-md">
                  <Flame className="w-3.5 h-3.5" />
                  <span>THE 4BLOODS SYNDICATE // IME ROLEPLAY</span>
                </div>
                {liveCount !== null && liveCount > 0 && (
                  <Link
                    href="/cam"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-xs font-mono-tech font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>{liveCount} STREAMER SEDANG LIVE</span>
                  </Link>
                )}
              </div>

              <div className="space-y-2">
                <h1
                  className={`font-display text-5xl sm:text-7xl xl:text-8xl tracking-wider uppercase leading-[0.92] ${
                    isDark ? 'text-white' : 'text-zinc-950'
                  }`}
                >
                  FOUR BLOODS <span className="text-red-600 drop-shadow-[0_0_35px_rgba(220,38,38,0.35)]">GANG</span>
                </h1>
                <p className="font-mono-tech text-xs sm:text-sm tracking-[0.25em] text-red-500 font-bold uppercase">
                  PORTOFOLIO SINDIKAT, ARSIP WIKI &amp; DIREKTORI RESMI
                </p>
              </div>

              <p
                className={`text-sm sm:text-base font-mono-tech leading-relaxed max-w-2xl ${
                  isDark ? 'text-zinc-300' : 'text-zinc-700'
                }`}
              >
                Pusat data terpadu keluarga besar <strong>Four Bloods Gang (4BG)</strong> di server <strong>IME Roleplay</strong>:
                arsip sejarah 3 chapter, struktur dewan pendiri (High Council), kompilasi video perang teramai di YouTube,
                koleksi musik anthem, serta direktori 54 kreator resmi.
              </p>

              {/* Action Buttons Hub */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/wiki"
                  className="px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-[0_0_25px_rgba(220,38,38,0.45)] hover:scale-105"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>JELAJAHI BLOODS WIKI (01)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/community"
                  className={`px-6 py-3.5 font-mono-tech text-xs font-bold uppercase tracking-widest flex items-center gap-2.5 transition-all border ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 text-white border-white/20 hover:border-red-500'
                      : 'bg-white hover:bg-zinc-100 text-zinc-900 border-zinc-300 shadow-sm'
                  }`}
                >
                  <Users className="w-4 h-4 text-red-500" />
                  <span>COMMUNITY &amp; ACHIEVEMENTS (02)</span>
                </Link>

                <Link
                  href="/cam"
                  className={`px-5 py-3.5 font-mono-tech text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all border ${
                    isDark
                      ? 'bg-black/60 hover:bg-red-600 text-zinc-300 hover:text-white border-white/15'
                      : 'bg-zinc-100 hover:bg-red-600 hover:text-white text-zinc-800 border-zinc-300'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  <span>MULTI-POV CAM</span>
                </Link>
              </div>

              {/* Quick Jump Pills */}
              <div className="pt-4 flex flex-wrap items-center gap-2 text-xs font-mono-tech">
                <span className={`text-[11px] uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  LOMPAT KE HIGHLIGHT:
                </span>
                <a
                  href="#metrics"
                  className={`px-2.5 py-1 border transition-colors ${
                    isDark ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white' : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black'
                  }`}
                >
                  #PORTOFOLIO
                </a>
                <a
                  href="#council"
                  className={`px-2.5 py-1 border transition-colors ${
                    isDark ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white' : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black'
                  }`}
                >
                  #DEWAN-OG
                </a>
                <a
                  href="#eras"
                  className={`px-2.5 py-1 border transition-colors ${
                    isDark ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white' : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black'
                  }`}
                >
                  #3-CHAPTER
                </a>
                <a
                  href="#youtube-war"
                  className={`px-2.5 py-1 border transition-colors ${
                    isDark ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white' : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black'
                  }`}
                >
                  #REKAMAN-VIRAL
                </a>
                <a
                  href="#media-culture"
                  className={`px-2.5 py-1 border transition-colors ${
                    isDark ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white' : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black'
                  }`}
                >
                  #MUSIK-MERCH
                </a>
              </div>
            </div>

            {/* Right Col: Interactive 3D Emblem Stage (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div
                className={`relative w-full max-w-md aspect-square rounded-full flex items-center justify-center p-6 border ${
                  isDark
                    ? 'bg-gradient-to-b from-[#180A10]/80 to-[#0A0407]/90 border-red-500/30 shadow-[0_0_60px_rgba(220,38,38,0.25)]'
                    : 'bg-gradient-to-b from-white to-zinc-100 border-zinc-300 shadow-2xl'
                }`}
              >
                {heroLogoOption === '3D' ? (
                  <ThreeLogoHero isDark={isDark} className="w-full h-full" />
                ) : heroLogoOption === 'V1' ? (
                  <img
                    src="/assets/generated/crest_v1_3d.webp"
                    alt="4Bloods Crest V1"
                    className="w-4/5 h-4/5 object-contain drop-shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-in fade-in"
                  />
                ) : (
                  <img
                    src="/assets/logo_v2.png"
                    alt="4Bloods Official Crest"
                    className="w-4/5 h-4/5 object-contain drop-shadow-[0_0_35px_rgba(220,38,38,0.5)] animate-in fade-in"
                  />
                )}

                {/* Subtle spinning glow ring */}
                <div className="absolute inset-0 rounded-full border border-red-500/20 pointer-events-none" />
              </div>

              {/* Logo Variant Switcher */}
              <div
                className={`mt-4 inline-flex items-center gap-1 p-1 border rounded-xs font-mono-tech text-[10px] ${
                  isDark ? 'bg-black/60 border-white/15' : 'bg-white border-zinc-300 shadow-sm'
                }`}
              >
                <button
                  onClick={() => setHeroLogoOption('ORI')}
                  className={`px-2.5 py-1 uppercase font-bold cursor-pointer transition-all ${
                    heroLogoOption === 'ORI'
                      ? 'bg-red-600 text-white'
                      : isDark
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  LOGO RESMI
                </button>
                <button
                  onClick={() => setHeroLogoOption('3D')}
                  className={`px-2.5 py-1 uppercase font-bold cursor-pointer transition-all ${
                    heroLogoOption === '3D'
                      ? 'bg-red-600 text-white'
                      : isDark
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  INTERACTIVE 3D
                </button>
                <button
                  onClick={() => setHeroLogoOption('V1')}
                  className={`px-2.5 py-1 uppercase font-bold cursor-pointer transition-all ${
                    heroLogoOption === 'V1'
                      ? 'bg-red-600 text-white'
                      : isDark
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  CREST CLASSIC
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          HIGHLIGHT 01: SYNDICATE PORTFOLIO BENTO METRICS (PORTO 4BLOODS)
      ===================================================================== */}
      <section
        id="metrics"
        className={`py-20 border-b ${
          isDark ? 'bg-[#0B0609] border-white/10' : 'bg-[#F4EFEA] border-zinc-300'
        }`}
      >
        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 space-y-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="text-xs font-mono-tech text-red-500 font-bold uppercase tracking-[0.25em] flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>HIGHLIGHT 01 // PORTOFOLIO &amp; SKALA KEKUATAN</span>
              </div>
              <h2
                className={`font-display text-4xl sm:text-6xl uppercase tracking-wider ${
                  isDark ? 'text-white' : 'text-zinc-950'
                }`}
              >
                FACTION <span className="text-red-600">PORTFOLIO</span>
              </h2>
            </div>
            <p className={`text-xs sm:text-sm font-mono-tech max-w-lg ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Rekam jejak dominasi faksi: dari jumlah kreator siaran langsung terbanyak di IME,
              komunitas beranggotakan ribuan warga, hingga supremasi teritori South Side Roxwood.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 01: Streamers */}
            <div
              className={`p-6 border flex flex-col justify-between transition-all hover:-translate-y-1 ${
                isDark
                  ? 'bg-[#12080C] border-red-500/25 shadow-lg hover:border-red-500/60'
                  : 'bg-white border-zinc-300 shadow-md hover:shadow-xl'
              }`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-red-600/15 text-red-500 flex items-center justify-center">
                  <Tv className="w-5 h-5" />
                </div>
                <div className="font-display text-4xl sm:text-5xl text-red-600 leading-none">54</div>
                <div className="font-display text-xl uppercase tracking-wider">OFFICIAL STREAMERS</div>
                <p className={`text-xs font-mono-tech ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Roster terverifikasi YouTuber dan kreator siaran langsung keluarga besar 4Bloods.
                </p>
              </div>
              <Link
                href="/community"
                className="mt-4 pt-3 border-t border-current/10 inline-flex items-center gap-1.5 text-xs font-mono-tech font-bold text-red-500 hover:underline"
              >
                <span>LIHAT DIREKTORI</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 02: Discord Army */}
            <div
              className={`p-6 border flex flex-col justify-between transition-all hover:-translate-y-1 ${
                isDark
                  ? 'bg-[#12080C] border-red-500/25 shadow-lg hover:border-red-500/60'
                  : 'bg-white border-zinc-300 shadow-md hover:shadow-xl'
              }`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/15 text-indigo-500 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div className="font-display text-4xl sm:text-5xl text-indigo-500 leading-none">7.2K+</div>
                <div className="font-display text-xl uppercase tracking-wider">DISCORD CITIZENS</div>
                <p className={`text-xs font-mono-tech ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Komunitas gang terbesar di IME Roleplay dengan aktivitas pengumuman dan voice aktif.
                </p>
              </div>
              <a
                href="https://discord.gg/4bloods"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 pt-3 border-t border-current/10 inline-flex items-center gap-1.5 text-xs font-mono-tech font-bold text-indigo-500 hover:underline"
              >
                <span>GABUNG DISCORD</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Card 03: Territory */}
            <div
              className={`p-6 border flex flex-col justify-between transition-all hover:-translate-y-1 ${
                isDark
                  ? 'bg-[#12080C] border-red-500/25 shadow-lg hover:border-red-500/60'
                  : 'bg-white border-zinc-300 shadow-md hover:shadow-xl'
              }`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-amber-600/15 text-amber-500 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="font-display text-4xl sm:text-5xl text-amber-500 leading-none">POSTAL 620</div>
                <div className="font-display text-xl uppercase tracking-wider">ROXWOOD SOVEREIGN</div>
                <p className={`text-xs font-mono-tech ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Teritori kedaulatan utama 4Bloods di South Side Roxwood dengan pos patroli 24 jam.
                </p>
              </div>
              <Link
                href="/wiki"
                className="mt-4 pt-3 border-t border-current/10 inline-flex items-center gap-1.5 text-xs font-mono-tech font-bold text-amber-500 hover:underline"
              >
                <span>PETA &amp; SEJARAH HOOD</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 04: Wars & Tournaments */}
            <div
              className={`p-6 border flex flex-col justify-between transition-all hover:-translate-y-1 ${
                isDark
                  ? 'bg-[#12080C] border-red-500/25 shadow-lg hover:border-red-500/60'
                  : 'bg-white border-zinc-300 shadow-md hover:shadow-xl'
              }`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-rose-600/15 text-rose-500 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="font-display text-4xl sm:text-5xl text-rose-500 leading-none">15+ WARS</div>
                <div className="font-display text-xl uppercase tracking-wider">RECORDED CONFLICTS</div>
                <p className={`text-xs font-mono-tech ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Catatan kemenangan pertempuran aliansi, League War 20v20, hingga operasi pulau Cayo.
                </p>
              </div>
              <Link
                href="/wiki"
                className="mt-4 pt-3 border-t border-current/10 inline-flex items-center gap-1.5 text-xs font-mono-tech font-bold text-rose-500 hover:underline"
              >
                <span>ARSIP PERANG</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 05: Culture & Media */}
            <div
              className={`p-6 border flex flex-col justify-between transition-all hover:-translate-y-1 ${
                isDark
                  ? 'bg-[#12080C] border-red-500/25 shadow-lg hover:border-red-500/60'
                  : 'bg-white border-zinc-300 shadow-md hover:shadow-xl'
              }`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600/15 text-emerald-500 flex items-center justify-center">
                  <Disc3 className="w-5 h-5" />
                </div>
                <div className="font-display text-4xl sm:text-5xl text-emerald-500 leading-none">5 TRACKS</div>
                <div className="font-display text-xl uppercase tracking-wider">OFFICIAL MUSIC</div>
                <p className={`text-xs font-mono-tech ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Anthem resmi, musik video sinematik, dan diss track psywar yang mendominasi skena.
                </p>
              </div>
              <Link
                href="/community"
                className="mt-4 pt-3 border-t border-current/10 inline-flex items-center gap-1.5 text-xs font-mono-tech font-bold text-emerald-500 hover:underline"
              >
                <span>DISKOGRAFI &amp; MERCH</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          HIGHLIGHT 02: HIGH COUNCIL & FOUNDING PILLARS SPOTLIGHT (PORTO & WIKI)
      ===================================================================== */}
      <section
        id="council"
        className={`py-24 border-b relative overflow-hidden ${
          isDark ? 'bg-[#080406] border-white/10' : 'bg-[#FAF8F5] border-zinc-300'
        }`}
      >
        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 space-y-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <Icon3D src="/assets/generated/icons3d/icon_hierarchy.webp" alt="3D Crown Emblem" />
              <div className="space-y-1">
                <div className="text-xs font-mono-tech text-red-500 font-bold uppercase tracking-[0.25em]">
                  HIGHLIGHT 02 // TOKOH UTAMA &amp; DEWAN PENDIRI
                </div>
                <h2
                  className={`font-display text-4xl sm:text-6xl uppercase tracking-wider ${
                    isDark ? 'text-white' : 'text-zinc-950'
                  }`}
                >
                  HIGH COUNCIL <span className="text-red-600">SPOTLIGHT</span>
                </h2>
              </div>
            </div>

            <Link
              href="/wiki"
              className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
            >
              <span>BUKA STRUKTUR LENGKAP 54 ANGGOTA DI WIKI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 6 Key Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {KEY_PILLARS.map((pillar) => (
              <div
                key={pillar.name}
                className={`relative border overflow-hidden transition-all group flex flex-col justify-between ${
                  isDark
                    ? 'bg-[#100609] border-red-500/25 hover:border-red-500/60 shadow-lg'
                    : 'bg-white border-zinc-300 shadow-md hover:shadow-xl hover:border-red-400'
                }`}
              >
                <div className="relative h-44 overflow-hidden border-b border-current/10">
                  <img
                    src={pillar.fanart}
                    alt={pillar.name}
                    className="w-full h-full object-cover object-top opacity-85 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${
                      isDark ? 'from-[#100609] via-transparent to-black/40' : 'from-white via-transparent to-black/20'
                    }`}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-mono-tech font-bold uppercase tracking-wider">
                      {pillar.rank}
                    </span>
                  </div>
                </div>

                <div className="p-6 pt-0 -mt-8 relative z-10 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-500 shadow-xl mb-3 bg-black">
                      <img
                        src={pillar.avatar}
                        alt={pillar.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/logo_v2.png';
                        }}
                      />
                    </div>
                    <h3 className={`font-display text-2xl uppercase tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {pillar.name}
                    </h3>
                    <p className="text-xs font-mono-tech text-red-500 font-bold">{pillar.role}</p>
                    <p className={`text-xs font-mono-tech leading-relaxed pt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {pillar.bio}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-current/10 flex items-center justify-between text-xs font-mono-tech text-zinc-500">
                    <span>{pillar.handle}</span>
                    <span className="text-[10px] uppercase font-bold text-red-500">IME ROLEPLAY</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Direct CTA Banner to Wiki Hierarchy */}
          <div
            className={`p-6 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDark ? 'bg-red-950/20 border-red-500/30' : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="space-y-1">
              <h4 className={`font-display text-2xl uppercase ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                PENASARAN DENGAN SISTEM TIER 1 SAMPAI TIER 6?
              </h4>
              <p className={`text-xs font-mono-tech ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Pelajari hierarki dewan: Tier 1 Original Gangster, Tier 2 Under OG, Tier 3 Young Bloods, Tier 4 Member, Tier 5 Prospect, dan Tier 6 W-Hotdog Screening.
              </p>
            </div>
            <Link
              href="/wiki"
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-wider shrink-0 transition-all flex items-center gap-2"
            >
              <span>EKSPLORASI HIERARKI LENGKAP</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          HIGHLIGHT 03: 3 ERAS TIMELINE SNAPSHOT (WIKI HIGHLIGHT)
      ===================================================================== */}
      <section
        id="eras"
        className={`py-24 border-b relative ${
          isDark ? 'bg-[#0A0508] border-white/10' : 'bg-[#F2ECE4] border-zinc-300'
        }`}
      >
        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 space-y-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <Icon3D src="/assets/generated/icons3d/icon_chronicles.webp" alt="3D Chronicles Flag" />
              <div className="space-y-1">
                <div className="text-xs font-mono-tech text-red-500 font-bold uppercase tracking-[0.25em]">
                  HIGHLIGHT 03 // ARSIP SEJARAH TIGA CHAPTER
                </div>
                <h2
                  className={`font-display text-4xl sm:text-6xl uppercase tracking-wider ${
                    isDark ? 'text-white' : 'text-zinc-950'
                  }`}
                >
                  THE THREE <span className="text-red-600">CHAPTERS</span>
                </h2>
              </div>
            </div>

            <Link
              href="/wiki"
              className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
            >
              <span>BACA DOKUMEN SEJARAH LENGKAP DI WIKI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3 Era Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {LORE_CHAPTERS.map((ch, idx) => (
              <div
                key={ch.id}
                className={`border overflow-hidden flex flex-col justify-between transition-all group ${
                  isDark
                    ? 'bg-[#12070B] border-red-500/25 hover:border-red-500/60 shadow-lg'
                    : 'bg-white border-zinc-300 shadow-md hover:shadow-xl hover:border-red-400'
                }`}
              >
                <div className="relative h-52 overflow-hidden border-b border-current/10">
                  <img
                    src={ch.mapImage}
                    alt={ch.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${
                      isDark ? 'from-[#12070B] via-transparent to-black/50' : 'from-white via-transparent to-black/30'
                    }`}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-mono-tech font-bold uppercase tracking-widest">
                      CHAPTER {ch.roman}
                    </span>
                    <span className="px-2 py-0.5 bg-black/70 text-white text-[10px] font-mono-tech">
                      {ch.era}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4">
                    <span className="text-xs font-mono-tech font-bold text-red-500 uppercase">
                      POSTAL {ch.postalCode} // {ch.turfName}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className={`font-display text-2xl uppercase tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {ch.title}
                    </h3>
                    <p className={`text-xs font-mono-tech italic ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      &ldquo;{ch.quote}&rdquo;
                    </p>
                    <p className={`text-xs font-mono-tech leading-relaxed pt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {ch.summary}
                    </p>
                  </div>

                  {/* Milestones list */}
                  <div className="pt-3 border-t border-current/10 space-y-2">
                    <div className="text-[10px] font-mono-tech font-bold text-red-500 uppercase">
                      PERISTIWA KUNCI:
                    </div>
                    {ch.milestones.slice(0, 2).map((m, mIdx) => (
                      <div key={mIdx} className="flex items-start gap-2 text-xs font-mono-tech">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>
                          <strong>{m.label}</strong>: {m.detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          HIGHLIGHT 04: CURATED YOUTUBE WAR CINEMA & VIRAL HIGHLIGHTS
          Researched popular videos across multiple 4Bloods creators
      ===================================================================== */}
      <section
        id="youtube-war"
        className={`py-24 border-b relative ${
          isDark ? 'bg-[#090306] border-red-500/25' : 'bg-[#FAF8F5] border-zinc-300'
        }`}
      >
        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 space-y-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <Icon3D src="/assets/generated/icons3d/icon_archives.webp" alt="3D War Cinema VHS" />
              <div className="space-y-1">
                <div className="text-xs font-mono-tech text-red-500 font-bold uppercase tracking-[0.25em]">
                  HIGHLIGHT 04 // REKAMAN PERANG &amp; MOMEN TERAMAI DI YOUTUBE
                </div>
                <h2
                  className={`font-display text-4xl sm:text-6xl uppercase tracking-wider ${
                    isDark ? 'text-white' : 'text-zinc-950'
                  }`}
                >
                  WAR CINEMA &amp; <span className="text-red-600">VIRAL REELS</span>
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'ALL', label: 'SEMUA VIDEO (8)' },
                  { id: 'TURF DEFENSE', label: 'TURF DEFENSE' },
                  { id: 'WAR POV', label: 'WAR POV' },
                  { id: 'COMMUNITY', label: 'COMMUNITY & RP' },
                  { id: 'TACTICAL', label: 'TACTICAL OPS' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setVideoFilter(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-mono-tech font-bold uppercase border cursor-pointer transition-colors ${
                    videoFilter === tab.id
                      ? 'bg-red-600 text-white border-red-500 shadow-md'
                      : isDark
                        ? 'bg-black/60 text-zinc-400 border-white/10 hover:text-white'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() =>
                  setVideoModal({
                    videoId: video.videoId,
                    title: video.title,
                    streamer: `${video.creator} // ${video.rank}`,
                  })
                }
                className={`border overflow-hidden cursor-pointer group flex flex-col justify-between transition-all hover:-translate-y-1 ${
                  isDark
                    ? 'bg-[#100609] border-red-500/25 hover:border-red-500 shadow-lg'
                    : 'bg-white border-zinc-300 shadow-md hover:shadow-xl hover:border-red-400'
                }`}
              >
                {/* Thumbnail Frame */}
                <div className="relative aspect-video bg-black overflow-hidden border-b border-current/10">
                  <img
                    src={video.thumb}
                    alt={video.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/assets/streams/war_allstar.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />

                  {/* Play Overlay Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-mono-tech font-bold uppercase">
                      {video.badge}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono-tech text-red-500 font-bold uppercase truncate">
                      {video.category} • {video.creator}
                    </div>
                    <h3
                      className={`font-display text-lg uppercase tracking-wider line-clamp-2 leading-tight group-hover:text-red-500 transition-colors ${
                        isDark ? 'text-white' : 'text-zinc-900'
                      }`}
                    >
                      {video.title}
                    </h3>
                    <p className={`text-[11px] font-mono-tech line-clamp-2 pt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {video.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-current/10 flex items-center justify-between text-xs font-mono-tech">
                    <span className="text-[10px] text-zinc-500">{video.handle}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-bold">
                      <YouTubeIcon className="w-3.5 h-3.5" />
                      PUTAR VIDEO
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Direct CTA to War Archives in Wiki */}
          <div
            className={`p-6 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDark ? 'bg-red-950/20 border-red-500/30' : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="space-y-1">
              <h4 className={`font-display text-2xl uppercase ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                ARSIP PERANG LENGKAP DENGAN DOKUMEN TANGGAL &amp; TAKTIK
              </h4>
              <p className={`text-xs font-mono-tech ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Eksplorasi dokumentasi kronologis perang antarfaksi di Roxwood dan Los Santos secara mendalam di Bloods Wiki.
              </p>
            </div>
            <Link
              href="/wiki"
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-wider shrink-0 transition-all flex items-center gap-2"
            >
              <span>BUKA WAR ARCHIVES DI WIKI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          HIGHLIGHT 05: CULTURE, ANTHEMS & STREETWEAR (COMMUNITY HIGHLIGHT)
      ===================================================================== */}
      <section
        id="media-culture"
        className={`py-24 border-b relative ${
          isDark ? 'bg-[#0B0609] border-white/10' : 'bg-[#F2ECE4] border-zinc-300'
        }`}
      >
        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 space-y-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <Icon3D src="/assets/generated/icons3d/icon_records.webp" alt="3D Vinyl & Sound" />
              <div className="space-y-1">
                <div className="text-xs font-mono-tech text-red-500 font-bold uppercase tracking-[0.25em]">
                  HIGHLIGHT 05 // BUDAYA, ANTHEM &amp; IDENTITAS KARYA
                </div>
                <h2
                  className={`font-display text-4xl sm:text-6xl uppercase tracking-wider ${
                    isDark ? 'text-white' : 'text-zinc-950'
                  }`}
                >
                  MUSIC &amp; <span className="text-red-600">STREETWEAR</span>
                </h2>
              </div>
            </div>

            <Link
              href="/community"
              className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
            >
              <span>EKSPLORASI SHOWROOM &amp; DISKOGRAFI LENGKAP</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 2 Big Feature Cards: Music vs Merch */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Box 1: Music Spotlight */}
            <div
              className={`p-8 border flex flex-col justify-between space-y-6 ${
                isDark ? 'bg-[#12070C] border-red-500/25' : 'bg-white border-zinc-300 shadow-md'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono-tech font-bold text-red-500 uppercase">
                  <Disc3 className="w-4 h-4 animate-spin" />
                  <span>OFFICIAL DISCOGRAPHY &amp; ANTHEMS</span>
                </div>
                <h3 className={`font-display text-3xl uppercase tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  THIS IS 4BLOODS &amp; DRILL BEATS
                </h3>
                <p className={`text-xs sm:text-sm font-mono-tech leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  Kompilasi karya musik orisinal yang mendefinisikan jiwa jalanan 4Bloods: dari anthem persaudaraan legendaris hingga diss track yang membakar semangat di pertempuran.
                </p>

                {/* Track mini list */}
                <div className="space-y-2 pt-2">
                  {OFFICIAL_MEDIA_TRACKS.slice(0, 3).map((track) => (
                    <div
                      key={track.id}
                      onClick={() =>
                        setVideoModal({
                          videoId: track.videoId,
                          title: track.title,
                          streamer: track.artist,
                        })
                      }
                      className={`p-3 border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isDark ? 'bg-black/40 border-white/10 hover:border-red-500' : 'bg-zinc-50 border-zinc-200 hover:border-red-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </div>
                        <div>
                          <div className={`text-xs font-mono-tech font-bold uppercase ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {track.title}
                          </div>
                          <div className="text-[10px] font-mono-tech text-red-500">
                            {track.type} • {track.duration}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono-tech text-zinc-500">PUTAR</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/community"
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>BUKA DISKOGRAFI RESMI DI COMMUNITY HUB</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Box 2: 3D Apparel & Showroom */}
            <div
              className={`p-8 border flex flex-col justify-between space-y-6 ${
                isDark ? 'bg-[#12070C] border-red-500/25' : 'bg-white border-zinc-300 shadow-md'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono-tech font-bold text-red-500 uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>3D WARDROBE &amp; MERCH SHOWROOM</span>
                </div>
                <h3 className={`font-display text-3xl uppercase tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  CRIMSON APPAREL &amp; STREETWEAR CODEX
                </h3>
                <p className={`text-xs sm:text-sm font-mono-tech leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  Seragam identitas kebanggaan keluarga: Red Paisley Bandana, Varsity Jackets, Roxwood Heavy Hoodies, dan Tactical Workshirts yang dikenakan setiap anggota in-game.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className={`p-4 border text-center space-y-2 ${isDark ? 'bg-black/40 border-white/10' : 'bg-zinc-50 border-zinc-200'}`}>
                    <img
                      src="/assets/generated/merch_bandana.webp"
                      alt="Bandana"
                      className="w-20 h-20 mx-auto object-contain drop-shadow-md"
                    />
                    <div className="text-xs font-mono-tech font-bold uppercase">RED BANDANA</div>
                    <span className="text-[9px] font-mono-tech text-red-500 uppercase">TIER 1 ICONIC</span>
                  </div>
                  <div className={`p-4 border text-center space-y-2 ${isDark ? 'bg-black/40 border-white/10' : 'bg-zinc-50 border-zinc-200'}`}>
                    <img
                      src="/assets/generated/merch_hoodie.webp"
                      alt="Hoodie"
                      className="w-20 h-20 mx-auto object-contain drop-shadow-md"
                    />
                    <div className="text-xs font-mono-tech font-bold uppercase">ROXWOOD HOODIE</div>
                    <span className="text-[9px] font-mono-tech text-red-500 uppercase">HEAVY FLEECE</span>
                  </div>
                </div>
              </div>

              <Link
                href="/community"
                className={`w-full py-3 font-mono-tech text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                  isDark
                    ? 'bg-white/10 hover:bg-white text-white hover:text-black border-white/20'
                    : 'bg-zinc-100 hover:bg-zinc-900 text-zinc-900 hover:text-white border-zinc-300'
                }`}
              >
                <span>LIHAT 3D SHOWROOM DI COMMUNITY HUB</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          HIGHLIGHT 06: CREATOR RADAR & MULTI-POV LIVE CAM GATEWAY
      ===================================================================== */}
      <section
        className={`py-20 border-b ${
          isDark ? 'bg-[#080305] border-red-500/30' : 'bg-gradient-to-b from-[#F2ECE4] to-[#FAF8F5] border-zinc-300'
        }`}
      >
        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 space-y-8">
          <div className="p-8 sm:p-12 border bg-gradient-to-r from-red-950/40 via-red-900/20 to-black/60 border-red-500/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono-tech font-bold text-red-400 uppercase tracking-widest">
                <Tv className="w-4 h-4 text-red-500" />
                <span>4BLOODS REAL-TIME MULTI-POV SURVEILLANCE</span>
              </div>
              <h3 className="font-display text-3xl sm:text-5xl uppercase tracking-wider text-white">
                PANTAU SELURUH PERSPEKTIF <span className="text-red-500">LIVE</span> DI 4BLOODS CAM
              </h3>
              <p className="text-xs sm:text-sm font-mono-tech text-zinc-300 leading-relaxed">
                Tonton multi-kamera real-time hingga 4 sudut pandang streamer sekaligus (Quad-Cam), pantau status siaran langsung 54 kreator, dan rasakan atmosfer operasi keluarga 4Bloods.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                href="/cam"
                className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(220,38,38,0.6)]"
              >
                <Tv className="w-4 h-4" />
                <span>BUKA 4BLOODS CAM SEKARANG</span>
              </Link>
              <Link
                href="/community"
                className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-mono-tech text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-white/20"
              >
                <Users className="w-4 h-4" />
                <span>DIREKTORI 54 STREAMER</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          FOOTER — OFFICIAL ECOSYSTEM FOOTER
      ===================================================================== */}
      <footer
        className={`py-14 border-t ${
          isDark ? 'bg-[#060305] border-white/10 text-zinc-400' : 'bg-[#EAE4DC] border-zinc-300 text-zinc-700'
        }`}
      >
        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 space-y-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-current/10">
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo_v2.png"
                alt="4Bloods"
                className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(220,38,38,0.4)]"
              />
              <div>
                <div className={`font-display text-2xl uppercase tracking-wider ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  FOUR BLOODS GANG
                </div>
                <div className="text-[10px] font-mono-tech text-red-500 font-bold uppercase">
                  IME ROLEPLAY // SOUTH SIDE ROXWOOD
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono-tech uppercase font-bold">
              <Link href="/" className="hover:text-red-500 transition-colors">
                OVERVIEW
              </Link>
              <Link href="/wiki" className="hover:text-red-500 transition-colors">
                BLOODS WIKI
              </Link>
              <Link href="/community" className="hover:text-red-500 transition-colors">
                COMMUNITY HUB
              </Link>
              <Link href="/cam" className="hover:text-red-500 transition-colors">
                4BLOODS CAM
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-tech">
            <p>
              &copy; {new Date().getFullYear()} 4Bloods Gang (4BG). Arsip Portofolio &amp; Wiki Komunitas IME Roleplay.
            </p>
            <p className="text-[11px] text-zinc-500">
              Dikurasi untuk seluruh keluarga besar dan warga setia bendera merah.
            </p>
          </div>
        </div>
      </footer>

      {/* Fullscreen Video Modal */}
      {videoModal && (
        <div
          onClick={() => setVideoModal(null)}
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full bg-[#0B0709] border border-white/20 overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-3.5 bg-[#120B0E] border-b border-white/10 flex items-center justify-between">
              <div>
                <h4 className="font-display text-xl sm:text-2xl text-white tracking-wider truncate max-w-2xl">
                  {videoModal.title}
                </h4>
                <p className="text-xs font-mono-tech text-red-400">{videoModal.streamer}</p>
              </div>
              <button
                onClick={() => setVideoModal(null)}
                className="p-2 bg-white/5 hover:bg-red-600 text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoModal.videoId}?autoplay=1`}
                title={videoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
            <div className="p-4 bg-[#0B0709] border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono-tech text-zinc-400">
                Memutar rekaman arsip YouTube
              </span>
              <a
                href={`https://www.youtube.com/watch?v=${videoModal.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase flex items-center gap-2"
              >
                <YouTubeIcon className="w-4 h-4" />
                <span>BUKA DI YOUTUBE</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
