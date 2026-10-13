'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import StickyAudioPlayer from '@/components/StickyAudioPlayer';
import Tilt3DCard from '@/components/Tilt3DCard';
import {
  BookOpen,
  MapPin,
  Shield,
  Film,
  Play,
  X,
  Maximize2,
  ChevronRight,
  Sun,
  Moon,
  Tv,
  HelpCircle,
  Award,
  Scroll,
  Flame,
  Users,
  Target,
  Clock,
  Quote,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

import originData from '@/data/wiki/origin.json';
import chaptersData from '@/data/wiki/chapters.json';
import hierarchyData from '@/data/wiki/hierarchy.json';
import doctrineData from '@/data/wiki/doctrine.json';
import warsData from '@/data/wiki/wars.json';
import glossaryData from '@/data/wiki/glossary.json';

export default function WikiPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeChapterIdx, setActiveChapterIdx] = useState(2); // default Chapter III (SSR)
  const [activeTab, setActiveTab] = useState<'origin' | 'chapters' | 'hierarchy' | 'doctrine' | 'wars' | 'glossary'>('origin');
  const [warFilter, setWarFilter] = useState<'ALL' | 'WAR' | 'LORE'>('ALL');
  const [selectedWarId, setSelectedWarId] = useState<string>(warsData[0]?.id || '');
  const [glossarySearch, setGlossarySearch] = useState('');

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

  const currentChapter = chaptersData[activeChapterIdx] || chaptersData[0];

  const filteredWars = warsData.filter((war: any) => {
    if (warFilter === 'WAR') return war.category?.includes('WAR') || war.category?.includes('DEFENSE');
    if (warFilter === 'LORE') return !war.category?.includes('WAR') && !war.category?.includes('DEFENSE');
    return true;
  });

  const activeWarTape =
    filteredWars.find((w: any) => w.id === selectedWarId) ||
    filteredWars[0] ||
    warsData[0];

  const filteredGlossary = glossaryData.filter((item: any) => {
    const q = glossarySearch.toLowerCase();
    return item.term.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  return (
    <div
      className={`theme-smooth min-h-screen relative selection:bg-red-600 selection:text-white ${
        isDark ? 'bg-[#070506] text-[#F4F4F6]' : 'bg-[#F4F1EC] text-[#141113]'
      }`}
    >
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <StickyAudioPlayer isDark={isDark} />

      {/* Floating Theme Switcher */}
      <div className="fixed bottom-6 left-6 z-50 select-none">
        <button
          onClick={toggleTheme}
          className={`group p-1.5 border shadow-[0_15px_40px_rgba(0,0,0,0.65)] flex items-center gap-2 cursor-pointer backdrop-blur-xl ${
            isDark
              ? 'bg-[#120A0E]/95 border-red-500/40 text-white hover:border-red-500'
              : 'bg-white/95 border-zinc-300 text-zinc-900 hover:border-red-500'
          }`}
          title={isDark ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
        >
          <span
            className={`w-8 h-8 flex items-center justify-center transition-transform duration-500 ${
              isDark ? 'bg-red-600 text-white rotate-0' : 'bg-amber-400 text-black rotate-180'
            }`}
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </span>
          <div className="pr-2.5 text-left">
            <div className="text-[8px] font-mono-tech text-red-500 font-bold uppercase tracking-widest leading-none">
              TEMA WIKI
            </div>
            <div className="text-[11px] font-mono-tech font-bold uppercase tracking-wider mt-0.5">
              {isDark ? 'DARK // OBSIDIAN' : 'LIGHT // STREET'}
            </div>
          </div>
        </button>
      </div>

      {/* Hero Banner Wiki */}
      <section
        className={`relative pt-32 pb-16 border-b overflow-hidden ${
          isDark
            ? 'bg-[#090306] border-red-500/25'
            : 'bg-gradient-to-b from-[#FAF8F5] via-[#EDE7DE] to-[#F5F0E8] border-zinc-200'
        }`}
      >
        {/* Cinematic Atmospheric Turf & Lore Backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/assets/generated/fanart_west_to_ssr.webp"
            alt="Lore Backdrop"
            className={`w-full h-full object-cover object-center ${
              isDark ? 'opacity-35 brightness-75 contrast-120 blur-[0.5px]' : 'opacity-15 brightness-95'
            }`}
          />
          <div
            className={`absolute inset-0 ${
              isDark
                ? 'bg-gradient-to-b from-[#090306]/85 via-[#090306]/70 to-[#090306]'
                : 'bg-gradient-to-b from-white/85 via-white/70 to-[#FAF8F5]'
            }`}
          />
          <div
            style={{
              background:
                'radial-gradient(circle at 60% 40%, rgba(220,38,38,0.22) 0%, rgba(9,3,6,0.92) 75%)',
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

        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/15 border border-red-500/30 text-red-500 text-xs font-mono-tech font-bold tracking-widest uppercase backdrop-blur-md">
                <BookOpen className="w-3.5 h-3.5" />
                <span>OFFICIAL FACTION CODEX // EST. 23 JUNI 2025</span>
              </div>
              <h1
                className={`font-display text-5xl sm:text-7xl lg:text-8xl tracking-wider uppercase leading-[0.92] ${
                  isDark ? 'text-white' : 'text-zinc-950'
                }`}
              >
                4BLOODS <span className="text-red-600 drop-shadow-[0_0_35px_rgba(220,38,38,0.35)]">WIKI & ARCHIVE</span>
              </h1>
              <p
                className={`text-sm sm:text-base font-mono-tech leading-relaxed max-w-2xl ${
                  isDark ? 'text-zinc-300' : 'text-zinc-700'
                }`}
              >
                Dokumentasi ensiklopedia resmi Four Bloods Gang (4BG) di server IME Roleplay: dari awal mula
                pekerja pengantar burger, migrasi markas 3 babak, hierarki sindikat, kode etik darah, hingga rekaman perang bersejarah.
              </p>
            </div>

            {/* Tactical Syndicate Dossier Box */}
            <div
              className={`relative p-6 border min-w-[280px] sm:min-w-[340px] lg:min-w-[380px] space-y-4 rounded-xs overflow-hidden transition-all duration-300 shadow-[0_15px_40px_rgba(0,0,0,0.7)] ${
                isDark
                  ? 'bg-gradient-to-br from-[#1C0911]/95 via-[#12050B]/90 to-[#0A0205]/95 border-red-500/40 hover:border-red-500/70 shadow-[0_0_35px_rgba(220,38,38,0.2)]'
                  : 'bg-white border-zinc-300 shadow-xl'
              }`}
            >
              {/* Top Laser Accent */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-red-500 to-transparent" />

              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span className="text-[10px] font-mono-tech text-red-500 font-bold uppercase tracking-widest">
                    FACTION BRIEF // CODEX
                  </span>
                </div>
                <span className="text-[9px] font-mono-tech px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-500/30 uppercase">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono-tech">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-zinc-400">Nama Resmi:</span>
                  <span className={`font-bold font-mono ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    Four Bloods Gang (4BG)
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-zinc-400">Tanggal Berdiri:</span>
                  <span className="font-bold text-red-500 font-mono">
                    {originData.foundedDate}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-zinc-400">Wilayah Utama:</span>
                  <span className={`font-bold font-mono ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                    South Side Roxwood (1051–1052)
                  </span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-zinc-400">Semboyan:</span>
                  <span className="font-bold text-red-500 font-script text-base">
                    &ldquo;Blood In, Blood Out&rdquo;
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Wiki Section Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-10 border-t border-white/10 mt-10">
            {[
              { id: 'origin', label: '01 // THE GENESIS', icon: Scroll },
              { id: 'chapters', label: '02 // 3 CHAPTERS', icon: MapPin },
              { id: 'hierarchy', label: '03 // HIERARCHY', icon: Shield },
              { id: 'doctrine', label: '04 // KODE ETIK & WARNA', icon: Flame },
              { id: 'wars', label: '05 // WAR CHRONICLES', icon: Film },
              { id: 'glossary', label: '06 // GLOSSARY & ISTILAH', icon: HelpCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 text-xs font-mono-tech font-bold uppercase tracking-widest transition-all flex items-center gap-2 border cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                      : isDark
                        ? 'bg-black/40 border-white/10 text-zinc-300 hover:border-red-500/50 hover:text-white'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:border-red-300 hover:text-red-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tab 01: The Burger Boy Genesis */}
      {activeTab === 'origin' && (
        <section className="max-w-[1520px] mx-auto px-4 sm:px-8 py-14 space-y-12">
          {/* Main Cinematic Genesis Dossier */}
          <div className="border border-red-500/40 relative overflow-hidden bg-[#0A0407] shadow-[0_20px_60px_rgba(0,0,0,0.85)] group">
            {/* Atmospheric Background Backdrop */}
            <div className="absolute inset-0 pointer-events-none">
              <img
                src="/assets/hood_west.jpg"
                alt="West Side Genesis Era"
                className="w-full h-full object-cover opacity-20 brightness-75 contrast-125 filter mix-blend-luminosity scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0407] via-[#0A0407]/90 to-[#0A0407]/80" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0407] via-transparent to-[#0A0407]/90" />
              <div
                style={{
                  background:
                    'radial-gradient(circle at 85% 30%, rgba(220,38,38,0.25) 0%, rgba(10,4,7,0.95) 70%)',
                }}
                className="absolute inset-0"
              />
              <div className="absolute inset-0 bg-tactical-grid opacity-25" />
              <div className="absolute inset-0 bg-film-grain opacity-40" />

              {/* Glowing 3D Crest Watermark */}
              <div className="absolute -right-12 -bottom-16 w-96 h-96 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
                <img
                  src="/assets/generated/crest_v1_3d.webp"
                  alt="3D Crest Watermark"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-pulse"
                />
              </div>
            </div>

            {/* Top Tactical Status Bar */}
            <div className="relative z-10 px-6 sm:px-10 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                </span>
                <span className="text-[11px] font-mono-tech font-bold uppercase tracking-[0.25em] text-red-500">
                  DOSSIER ARCHIVE // CLASSIFIED ORIGIN #001
                </span>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-mono-tech text-zinc-400 uppercase">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10">
                  <Clock className="w-3 h-3 text-red-400" />
                  EST. 23 JUNI 2025
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10">
                  <MapPin className="w-3 h-3 text-red-400" />
                  WEST SIDE LOS SANTOS
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-600/20 text-red-400 border border-red-500/30 font-bold">
                  <Shield className="w-3 h-3" />
                  SUMPAH DARAH ABADI
                </span>
              </div>
            </div>

            {/* Dossier Content Body */}
            <div className="relative z-10 p-6 sm:p-10 lg:p-14 space-y-8 max-w-5xl">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-mono-tech font-bold tracking-[0.25em] uppercase">
                  <Flame className="w-3.5 h-3.5 text-red-500" />
                  <span>BABAK AWAL // 23 JUNI 2025</span>
                </div>
                <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl text-white tracking-wider uppercase leading-[0.95]">
                  {originData.title}
                </h2>
                <p className="text-sm sm:text-base font-mono-tech text-zinc-400 max-w-3xl">
                  {originData.subtitle}
                </p>
              </div>

              {/* Illuminated Blood Oath Shrine Card */}
              <div className="relative p-6 sm:p-8 border-y-2 sm:border sm:rounded-xs border-red-500/70 bg-gradient-to-r from-red-950/70 via-black/85 to-red-950/50 shadow-[0_0_50px_rgba(220,38,38,0.22)] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-amber-400 to-transparent" />
                <div className="absolute -left-2 -bottom-4 text-red-600/10 pointer-events-none">
                  <Quote className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-mono-tech text-red-400 font-bold tracking-widest uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>SACRED BLOOD OATH // DOKTRIN PERDANA</span>
                  </div>
                  <blockquote className="font-script text-2xl sm:text-4xl text-red-400 tracking-wide leading-tight drop-shadow-[0_2px_15px_rgba(239,68,68,0.4)]">
                    &ldquo;{originData.oath}&rdquo;
                  </blockquote>
                  <p className="text-xs font-mono-tech text-zinc-400 pt-1 border-t border-white/10 flex items-center justify-between">
                    <span>— Sumpah Darah 4 Pendiri di Sudut Sepi Los Santos (Target 30 Miliar Pertama)</span>
                    <span className="hidden sm:inline-block text-red-500 font-bold uppercase tracking-widest text-[10px]">
                      BLOOD IN, BLOOD OUT
                    </span>
                  </p>
                </div>
              </div>

              {/* Synopsis & Lore Story */}
              <div className="space-y-4 text-sm sm:text-base font-mono-tech leading-relaxed text-zinc-300 bg-black/40 p-6 sm:p-8 border border-white/10">
                <p className="text-white font-medium border-l-2 border-red-500 pl-4 py-0.5">
                  {originData.synopsis}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs sm:text-sm text-zinc-400 border-t border-white/10">
                  {originData.paragraphs.map((p, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="font-mono-tech text-red-500 font-bold text-xs pt-0.5">
                        [0{idx + 1}]
                      </span>
                      <p className="leading-relaxed">{p}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Genesis Milestones Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="p-4 border border-white/10 bg-black/50 space-y-2 hover:border-red-500/50 transition-colors">
                  <div className="text-[10px] font-mono-tech text-red-500 font-bold tracking-widest uppercase">
                    TAHAP 01 // UP-N-ATOM
                  </div>
                  <h4 className="font-display text-lg text-white tracking-wide">BURUH PENGANTAR BURGER</h4>
                  <p className="text-xs font-mono-tech text-zinc-400 leading-relaxed">
                    Menghadapi kerasnya kota Los Santos, upah minim, dan ancaman pemecatan dari atasan Up-n-Atom.
                  </p>
                </div>

                <div className="p-4 border border-red-500/30 bg-gradient-to-br from-red-950/40 to-black/60 space-y-2 hover:border-red-500 transition-colors">
                  <div className="text-[10px] font-mono-tech text-amber-400 font-bold tracking-widest uppercase">
                    TAHAP 02 // SUMPAH 30 MILIAR
                  </div>
                  <h4 className="font-display text-lg text-white tracking-wide">IKATAN SATU DARAH</h4>
                  <p className="text-xs font-mono-tech text-zinc-400 leading-relaxed">
                    Menolak terpisah, 4 sekawan mengikat janji suci dan mencanangkan target kas Rp 30 Miliar untuk kebebasan keluarga.
                  </p>
                </div>

                <div className="p-4 border border-white/10 bg-black/50 space-y-2 hover:border-red-500/50 transition-colors">
                  <div className="text-[10px] font-mono-tech text-red-500 font-bold tracking-widest uppercase">
                    TAHAP 03 // BENDERA MERAH
                  </div>
                  <h4 className="font-display text-lg text-white tracking-wide">BENDERA WEST SIDE DIKIBARKAN</h4>
                  <p className="text-xs font-mono-tech text-zinc-400 leading-relaxed">
                    Merah resmi dipilih sebagai simbol hidup, pengorbanan, dan doktrin abadi “Blood In, Blood Out”.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Founders Showcase */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-2xl sm:text-3xl tracking-wide uppercase">
                EMPAT PILAR PENDIRI (FOUNDING FATHERS)
              </h3>
              <span className="text-xs font-mono-tech text-red-500 font-bold uppercase tracking-widest">
                TIER 01 // ORIGINAL GANGSTERS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {originData.founders.map((founder, idx) => (
                <div
                  key={idx}
                  className={`border p-6 space-y-4 ${
                    isDark ? 'bg-[#0E070A] border-white/10 hover:border-red-500/50' : 'bg-white border-zinc-200 shadow-sm'
                  } transition-all duration-300 group`}
                >
                  <div className="relative aspect-square overflow-hidden bg-black/60 border border-white/10">
                    <img
                      src={founder.avatar}
                      alt={founder.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-red-600 text-white text-[9px] font-mono-tech font-bold uppercase">
                      OG FOUNDER
                    </div>
                  </div>
                  <div>
                    <h4 className="font-display text-xl text-white tracking-wider group-hover:text-red-500 transition-colors">
                      {founder.name}
                    </h4>
                    <p className="text-[11px] font-mono-tech text-red-400 font-bold">
                      {founder.streamer}
                    </p>
                    <p className="text-[10px] font-mono-tech text-zinc-400 uppercase tracking-wider mt-0.5">
                      {founder.title}
                    </p>
                  </div>
                  <p className="text-xs font-mono-tech text-zinc-400 border-t border-white/10 pt-3">
                    {founder.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tab 02: The 3 Chapters & Territories */}
      {activeTab === 'chapters' && (
        <section className="max-w-[1520px] mx-auto px-4 sm:px-8 py-14 space-y-12">
          {/* Chapter Selector Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chaptersData.map((chap: any, idx: number) => {
              const isSelected = activeChapterIdx === idx;
              return (
                <button
                  key={chap.id}
                  onClick={() => setActiveChapterIdx(idx)}
                  className={`p-6 border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-600/20 border-red-500 shadow-[0_0_25px_rgba(220,38,38,0.3)]'
                      : isDark
                        ? 'bg-[#0E070A] border-white/10 hover:border-red-500/40'
                        : 'bg-white border-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-tech text-red-500 font-bold">{chap.roman}</span>
                    <span className="text-[10px] font-mono-tech text-zinc-400 uppercase">{chap.era}</span>
                  </div>
                  <h4 className="font-display text-2xl text-white tracking-wider uppercase mt-2">
                    {chap.title}
                  </h4>
                  <p className="text-xs font-mono-tech text-zinc-400 mt-1 line-clamp-2">
                    {chap.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Chapter Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="relative aspect-video overflow-hidden border border-white/15 bg-black">
                <img
                  src={currentChapter.mapImage}
                  alt={currentChapter.turfName}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() =>
                    setLightboxImage({
                      src: currentChapter.mapImage,
                      title: currentChapter.turfName,
                      subtitle: currentChapter.postalCode,
                    })
                  }
                  className="absolute bottom-4 right-4 p-2 bg-black/80 hover:bg-red-600 text-white border border-white/20 text-xs font-mono-tech flex items-center gap-1.5"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>ZOOM MAP</span>
                </button>
              </div>

              <div className="p-6 border border-white/10 bg-[#0E070A] space-y-3">
                <div className="text-[10px] font-mono-tech text-red-500 font-bold uppercase tracking-widest">
                  WARNA ATRIBUT KHAS BABAK INI
                </div>
                <p className="text-xs font-mono-tech text-zinc-300">
                  {currentChapter.colorsRule}
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-mono-tech text-red-500 font-bold uppercase tracking-widest">
                  {currentChapter.postalCode}
                </span>
                <h3 className="font-display text-3xl sm:text-4xl text-white tracking-wider uppercase mt-1">
                  {currentChapter.turfName}
                </h3>
                <p className="font-script text-2xl text-red-400 mt-2">
                  &ldquo;{currentChapter.quote}&rdquo;
                </p>
              </div>

              <div className="text-xs sm:text-sm font-mono-tech leading-relaxed text-zinc-300 space-y-3">
                <p>{currentChapter.summary}</p>
                {currentChapter.paragraphs?.map((p: string, i: number) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {/* Milestones */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="text-[10px] font-mono-tech text-red-500 font-bold uppercase tracking-widest">
                  PENCAPAIAN PENTING ERA INI
                </div>
                <div className="space-y-2">
                  {currentChapter.milestones?.map((m: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white/[0.03] border border-white/10">
                      <div className="text-xs font-mono-tech font-bold text-white uppercase">{m.label}</div>
                      <div className="text-[11px] font-mono-tech text-zinc-400 mt-0.5">{m.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 03: Hierarchy & Syndicate */}
      {activeTab === 'hierarchy' && (
        <section className="max-w-[1520px] mx-auto px-4 sm:px-8 py-14 space-y-10">
          <div className="max-w-2xl">
            <h3 className="font-display text-4xl text-white tracking-wider uppercase">
              STRUKTUR & TIER KEPANGKATAN
            </h3>
            <p className="text-xs font-mono-tech text-zinc-400 mt-2">
              Sistem hierarki 6 tingkat yang menjaga komando taktis di medan tempur serta keteraturan operasional di hood Roxwood.
            </p>
          </div>

          <div className="space-y-4">
            {hierarchyData.map((tier: any) => (
              <div
                key={tier.tier}
                className={`p-6 border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                  isDark ? 'bg-[#0E070A] border-white/10 hover:border-red-500/40' : 'bg-white border-zinc-200 shadow-sm'
                } transition-all`}
              >
                <div className="flex items-center gap-6">
                  <div
                    className="w-14 h-14 flex items-center justify-center font-display text-2xl font-bold border shrink-0"
                    style={{ borderColor: tier.badgeColor, color: tier.badgeColor }}
                  >
                    {tier.tier}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-2xl text-white tracking-wider">{tier.name}</span>
                      <span
                        className="px-2 py-0.5 text-[9px] font-mono-tech font-bold uppercase"
                        style={{ backgroundColor: tier.badgeColor, color: '#FFFFFF' }}
                      >
                        {tier.code}
                      </span>
                    </div>
                    <div className="text-xs font-mono-tech text-red-400 font-bold mt-1">
                      {tier.role}
                    </div>
                  </div>
                </div>

                <p className="text-xs font-mono-tech text-zinc-400 max-w-xl md:text-right">
                  {tier.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab 04: Doctrine & Colors */}
      {activeTab === 'doctrine' && (
        <section className="max-w-[1520px] mx-auto px-4 sm:px-8 py-14 space-y-12">
          {/* Rules List */}
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h3 className="font-display text-4xl text-white tracking-wider uppercase">
                {doctrineData.title}
              </h3>
              <p className="text-xs font-mono-tech text-zinc-400 mt-1">
                {doctrineData.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctrineData.rules.map((rule: any) => (
                <div
                  key={rule.code}
                  className={`p-6 border space-y-3 ${
                    isDark ? 'bg-[#0E070A] border-white/10' : 'bg-white border-zinc-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-tech text-red-500 font-bold">{rule.code}</span>
                    <span className="text-[10px] font-mono-tech text-zinc-500 uppercase">PRINSIP MUTLAK</span>
                  </div>
                  <h4 className="font-display text-2xl text-white tracking-wider uppercase">
                    {rule.name}
                  </h4>
                  <p className="text-xs font-mono-tech text-red-400 font-bold">
                    {rule.summary}
                  </p>
                  <p className="text-xs font-mono-tech text-zinc-400 leading-relaxed pt-2 border-t border-white/10">
                    {rule.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="space-y-6 pt-6 border-t border-white/10">
            <h4 className="font-display text-2xl text-white tracking-wider uppercase">
              EMPAT WARNA RESMI IDENTITAS 4BLOODS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {doctrineData.colorsPalette.map((col: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 border border-white/10 bg-[#0E070A] space-y-3"
                >
                  <div
                    className="w-full h-16 border border-white/20 shadow-inner"
                    style={{ backgroundColor: col.hex }}
                  />
                  <div>
                    <div className="font-display text-lg text-white tracking-wider">{col.name}</div>
                    <div className="text-[10px] font-mono-tech text-red-500 font-bold">{col.hex}</div>
                  </div>
                  <p className="text-[11px] font-mono-tech text-zinc-400 leading-relaxed">
                    {col.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tab 05: War Chronicles */}
      {activeTab === 'wars' && (
        <section className="max-w-[1520px] mx-auto px-4 sm:px-8 py-14 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-4xl text-white tracking-wider uppercase">
                ARSIP PERANG & OPERASI LAPANGAN
              </h3>
              <p className="text-xs font-mono-tech text-zinc-400 mt-1">
                Koleksi rekaman pertempuran resmi: Defend Hood Roxwood, Liga Perang, Cayo Perico, dan rekaman POV pimpinan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['ALL', 'WAR', 'LORE'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setWarFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-mono-tech font-bold uppercase border cursor-pointer ${
                    warFilter === filter
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-black/40 text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Active Featured Video */}
          <div className="border border-white/15 p-6 bg-[#0E070A] space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono-tech text-red-500 font-bold uppercase tracking-widest">
                  {activeWarTape.category} // {activeWarTape.tag}
                </span>
                <h4 className="font-display text-2xl sm:text-3xl text-white tracking-wider uppercase mt-1">
                  {activeWarTape.title}
                </h4>
                <p className="text-xs font-mono-tech text-zinc-400 mt-1">
                  POV: <strong className="text-white">{activeWarTape.streamer}</strong> ({activeWarTape.rank})
                </p>
              </div>

              <button
                onClick={() =>
                  setVideoModal({
                    videoId: activeWarTape.videoId,
                    title: activeWarTape.title,
                    streamer: activeWarTape.streamer,
                  })
                }
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>PUTAR REKAMAN HD</span>
              </button>
            </div>

            <div className="aspect-video w-full bg-black relative overflow-hidden border border-white/10">
              <iframe
                src={`https://www.youtube.com/embed/${activeWarTape.videoId}?rel=0`}
                title={activeWarTape.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>

          {/* War Grid List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWars.map((war: any) => {
              const isSelected = war.id === selectedWarId;
              return (
                <div
                  key={war.id}
                  onClick={() => setSelectedWarId(war.id)}
                  className={`border p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-600/15 border-red-500'
                      : 'bg-[#0E070A] border-white/10 hover:border-red-500/40'
                  }`}
                >
                  <div className="relative aspect-video overflow-hidden bg-black mb-3">
                    <img src={war.thumb} alt={war.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 text-[9px] font-mono-tech text-red-400 font-bold uppercase">
                      {war.tag}
                    </div>
                  </div>
                  <h5 className="font-display text-lg text-white line-clamp-1">{war.title}</h5>
                  <p className="text-[11px] font-mono-tech text-zinc-400 mt-1">
                    {war.streamer} // {war.rank}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tab 06: Glossary */}
      {activeTab === 'glossary' && (
        <section className="max-w-[1520px] mx-auto px-4 sm:px-8 py-14 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-4xl text-white tracking-wider uppercase">
                KAMUS & ISTILAH FACTION (GLOSSARY)
              </h3>
              <p className="text-xs font-mono-tech text-zinc-400 mt-1">
                Panduan memahami terminologi khas komunitas 4Bloods di dunia roleplay IME RP.
              </p>
            </div>

            <input
              type="text"
              placeholder="Cari istilah..."
              value={glossarySearch}
              onChange={(e) => setGlossarySearch(e.target.value)}
              className="px-4 py-2 bg-black/50 border border-white/15 text-xs font-mono-tech text-white placeholder-zinc-500 w-full sm:w-64 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGlossary.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-5 border border-white/10 bg-[#0E070A] space-y-2 hover:border-red-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-xl text-white tracking-wider">{item.term}</h4>
                  <span className="px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-500/30 text-[9px] font-mono-tech font-bold uppercase">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs font-mono-tech text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
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
