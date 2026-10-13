'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Tv,
  Search,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Users,
  Check,
  Radio,
  Star,
  Plus,
  Columns,
  ArrowUpRight,
  Sun,
  Moon,
  Calendar,
  HelpCircle,
  GripVertical,
  RotateCcw,
} from 'lucide-react';
import { STREAMER_ROSTER, StreamerMember } from '@/data/4bloods-data';

type EnrichedStreamer = StreamerMember & {
  handle?: string;
  avatar?: string;
  isLive: boolean;
  videoId: string | null;
  streamTitle?: string | null;
  startTimestamp?: string | null;
  isUpcoming?: boolean;
  upcomingVideoId?: string | null;
  upcomingTitle?: string | null;
  scheduledStartTime?: string | null;
  thumbnail: string;
  lastChecked?: string;
};

const RANK_BADGE_STYLE: Record<string, string> = {
  OG: 'bg-red-600/20 text-red-400 border-red-500/40',
  'Under OG': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'Young Bloods': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  Member: 'bg-zinc-800 text-zinc-400 border-zinc-700',
};

function formatUptime(startTimestamp?: string | null, nowMs?: number): string | null {
  if (!startTimestamp || !nowMs) return null;
  const start = new Date(startTimestamp).getTime();
  if (isNaN(start)) return null;
  const diffSec = Math.max(0, Math.floor((nowMs - start) / 1000));
  const hrs = Math.floor(diffSec / 3600);
  const mins = Math.floor((diffSec % 3600) / 60);
  if (hrs > 0) return `${hrs}j ${mins}m`;
  return `${mins}m`;
}

function formatUpcomingTime(scheduledIso?: string | null, nowMs?: number): {
  countdown: string;
  dateLabel: string;
  timeLabel: string;
} {
  if (!scheduledIso) {
    return { countdown: 'UPCOMING', dateLabel: 'TERJADWAL', timeLabel: '--:-- WIB' };
  }
  const targetMs = new Date(scheduledIso).getTime();
  const current = nowMs || Date.now();
  const diffSec = Math.max(0, Math.floor((targetMs - current) / 1000));
  const days = Math.floor(diffSec / 86400);
  const hrs = Math.floor((diffSec % 86400) / 3600);
  const mins = Math.floor((diffSec % 3600) / 60);

  const countdown =
    days > 0
      ? `Dalam ${days}h ${hrs}j`
      : hrs > 0
        ? `Dalam ${hrs}j ${mins}m`
        : `Dalam ${mins} menit`;

  const d = new Date(targetMs);
  const dateLabel = d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const timeLabel =
    d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';

  return { countdown, dateLabel, timeLabel };
}

export default function FourBloodsCamPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('4bg_theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('4bg_theme', next);
  };

  const isDark = theme === 'dark';

  // Streamers list (uniquely identified by channelId)
  const [streamers, setStreamers] = useState<EnrichedStreamer[]>(() =>
    STREAMER_ROSTER.map((m) => ({
      ...m,
      avatar: '/assets/logo_v2.png',
      isLive: false,
      videoId: null,
      streamTitle: null,
      startTimestamp: null,
      isUpcoming: false,
      upcomingVideoId: null,
      upcomingTitle: null,
      scheduledStartTime: null,
      thumbnail: m.featuredThumb || '/assets/yt_this_is_4bloods.jpg',
    }))
  );

  // Active channelIds
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'LIVE' | 'UPCOMING' | 'FAV' | 'OG'>('ALL');

  // Height View & Grid Preset: Fit full viewport height without vertical scrolling
  const [fitHeightView, setFitHeightView] = useState<boolean>(true);
  const [gridColsPreset, setGridColsPreset] = useState<'auto' | '1' | '2' | '3' | '4'>('auto');
  const [cardWidths, setCardWidths] = useState<Record<string, number>>({});
  const [resizingChannelId, setResizingChannelId] = useState<string | null>(null);

  // Drag & drop reorder state with live drop position preview
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Audio Solo
  const [unmutedId, setUnmutedId] = useState<string | null>(null);

  // Multi-Live Chat & Resizable Chat Dock
  const [showChat, setShowChat] = useState(true);
  const [chatSplitMode, setChatSplitMode] = useState<'SINGLE' | 'SPLIT'>('SINGLE');
  const [activeChatIds, setActiveChatIds] = useState<string[]>([]);
  const [chatWidthPx, setChatWidthPx] = useState<number>(360);
  const [isResizingChat, setIsResizingChat] = useState<boolean>(false);

  // Sidebar & Fullscreen state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fullscreenCardId, setFullscreenCardId] = useState<string | null>(null);

  // Loading & Sync
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(true);
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [autoSync, setAutoSync] = useState(true);
  const [lastScannerTime, setLastScannerTime] = useState<string>('--:--:--');
  const [embedDomain, setEmbedDomain] = useState<string>('localhost');
  const [nowMs, setNowMs] = useState<number>(0);

  // Panduan Modal
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [dontShowGuideAgain, setDontShowGuideAgain] = useState(false);

  // DOM Refs
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const cardElementRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const cardBadgeRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  useEffect(() => {
    setEmbedDomain(window.location.hostname);
    setNowMs(Date.now());

    try {
      const savedFavs = localStorage.getItem('4bg_fav_streamers');
      if (savedFavs) setFavoriteIds(JSON.parse(savedFavs));

      const savedWidths = localStorage.getItem('4bg_card_widths');
      if (savedWidths) setCardWidths(JSON.parse(savedWidths));

      const savedChatW = localStorage.getItem('4bg_chat_width');
      if (savedChatW) setChatWidthPx(Number(savedChatW));

      const hideTutorial = localStorage.getItem('hide4BSTutorial');
      if (!hideTutorial) {
        setShowGuideModal(true);
      }
    } catch {
      // ignore
    }

    const clockInterval = setInterval(() => {
      setNowMs(Date.now());
    }, 30_000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('4bg_card_widths', JSON.stringify(cardWidths));
    } catch {
      // ignore
    }
  }, [cardWidths]);

  useEffect(() => {
    try {
      localStorage.setItem('4bg_chat_width', String(chatWidthPx));
    } catch {
      // ignore
    }
  }, [chatWidthPx]);

  const closeGuideModal = () => {
    if (dontShowGuideAgain) {
      try {
        localStorage.setItem('hide4BSTutorial', 'true');
      } catch {
        // ignore
      }
    }
    setShowGuideModal(false);
  };

  const toggleFavorite = (channelId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteIds((prev) => {
      const next = prev.includes(channelId)
        ? prev.filter((item) => item !== channelId)
        : [...prev, channelId];
      try {
        localStorage.setItem('4bg_fav_streamers', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const fetchLiveStatus = useCallback(async (forceRefresh = false) => {
    setIsScanning(true);
    try {
      const res = await fetch(
        `/api/streamers${forceRefresh ? '?refresh=true' : ''}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      if (data?.streamers) {
        setStreamers(data.streamers);
        setLastScannerTime(
          new Date(data.lastScannerTime || Date.now()).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );

        const liveOnes = (data.streamers as EnrichedStreamer[]).filter((s) => s.isLive);
        setSelectedIds((prev) => {
          if (prev.length === 0 && liveOnes.length > 0) {
            return liveOnes.map((s) => s.channelId);
          }
          return prev;
        });
        setActiveChatIds((prev) => {
          if (prev.length === 0 && liveOnes.length > 0) {
            return liveOnes.slice(0, 2).map((s) => s.channelId);
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Failed to scan live status:', err);
    } finally {
      setIsScanning(false);
      setIsInitialLoading(false);
    }
  }, []);

  const handleManualRefresh = () => {
    if (isScanning || refreshCooldown > 0) return;
    fetchLiveStatus(true);
    setRefreshCooldown(10);
    const timer = setInterval(() => {
      setRefreshCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    fetchLiveStatus(false);
    if (!autoSync) return;
    const interval = setInterval(() => {
      fetchLiveStatus(false);
    }, 45_000);
    return () => clearInterval(interval);
  }, [fetchLiveStatus, autoSync]);

  const liveStreamers = useMemo(() => streamers.filter((s) => s.isLive), [streamers]);

  const upcomingStreamers = useMemo(
    () =>
      streamers
        .filter((s) => s.isUpcoming && s.scheduledStartTime && s.upcomingVideoId)
        .sort(
          (a, b) =>
            new Date(a.scheduledStartTime!).getTime() -
            new Date(b.scheduledStartTime!).getTime()
        ),
    [streamers]
  );

  const filteredRoster = useMemo(() => {
    return streamers.filter((member) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        member.name.toLowerCase().includes(q) ||
        (member.handle && member.handle.toLowerCase().includes(q)) ||
        member.rank.toLowerCase().includes(q);

      if (filterMode === 'LIVE') return matchesSearch && member.isLive;
      if (filterMode === 'UPCOMING') return matchesSearch && Boolean(member.isUpcoming);
      if (filterMode === 'FAV') return matchesSearch && favoriteIds.includes(member.channelId);
      if (filterMode === 'OG')
        return matchesSearch && (member.rank === 'OG' || member.rank === 'Under OG');
      return matchesSearch;
    });
  }, [streamers, searchQuery, filterMode, favoriteIds]);

  const activePovMembers = useMemo(() => {
    return selectedIds
      .map((cid) => streamers.find((s) => s.channelId === cid))
      .filter((s): s is EnrichedStreamer => Boolean(s));
  }, [selectedIds, streamers]);

  // AUTO-SPLIT LIVE CHAT: Auto 1 chat if 1 stream, auto 2 split chats if 2+ streams
  useEffect(() => {
    if (activePovMembers.length <= 1) {
      setChatSplitMode('SINGLE');
      if (activePovMembers[0]) {
        setActiveChatIds([activePovMembers[0].channelId]);
      }
    } else {
      setChatSplitMode('SPLIT');
      setActiveChatIds((prev) => {
        const first = activePovMembers[0]?.channelId;
        const second = activePovMembers[1]?.channelId;
        if (prev.length >= 2 && prev.every((id) => activePovMembers.some((m) => m.channelId === id))) {
          return prev;
        }
        return [first, second].filter(Boolean) as string[];
      });
    }
  }, [activePovMembers.length]);

  const activeChatMembers = useMemo(() => {
    const valid = activeChatIds
      .map((cid) => activePovMembers.find((m) => m.channelId === cid))
      .filter((m): m is EnrichedStreamer => Boolean(m));
    if (valid.length > 0) {
      return chatSplitMode === 'SINGLE' ? [valid[0]] : valid.slice(0, 2);
    }
    if (activePovMembers.length > 0) {
      return chatSplitMode === 'SINGLE'
        ? [activePovMembers[0]]
        : activePovMembers.slice(0, 2);
    }
    return [];
  }, [activeChatIds, activePovMembers, chatSplitMode]);

  const toggleStreamer = (channelId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(channelId)) {
        const next = prev.filter((item) => item !== channelId);
        if (unmutedId === channelId) setUnmutedId(null);
        setActiveChatIds((cPrev) => cPrev.filter((cId) => cId !== channelId));
        return next;
      } else {
        const next = [...prev, channelId];
        if (next.length === 1) {
          setUnmutedId(channelId);
          setActiveChatIds([channelId]);
        }
        return next;
      }
    });
  };

  const selectChatStream = (channelId: string) => {
    if (chatSplitMode === 'SINGLE') {
      setActiveChatIds([channelId]);
    } else {
      setActiveChatIds((prev) => {
        if (prev.includes(channelId)) {
          return prev.length > 1 ? prev.filter((item) => item !== channelId) : prev;
        }
        if (prev.length >= 2) {
          return [prev[1], channelId];
        }
        return [...prev, channelId];
      });
    }
  };

  const watchAllLive = () => {
    const liveIds = liveStreamers.map((s) => s.channelId);
    if (liveIds.length > 0) {
      setSelectedIds(liveIds);
      setUnmutedId(liveIds[0]);
      setActiveChatIds(liveIds.slice(0, 2));
    }
  };

  // DYNAMIC GRID DIMENSIONS (OPTIMIZED FOR HEIGHT VIEW)
  const gridDimensions = useMemo(() => {
    const count = activePovMembers.length;
    if (count <= 0) return { cols: 1, rows: 1 };

    if (gridColsPreset === '1') {
      return { cols: 1, rows: Math.min(count, 3) };
    }
    if (gridColsPreset === '2') {
      return { cols: 2, rows: Math.max(1, Math.ceil(count / 2)) };
    }
    if (gridColsPreset === '3') {
      return { cols: 3, rows: Math.max(1, Math.ceil(count / 3)) };
    }
    if (gridColsPreset === '4') {
      return { cols: 4, rows: Math.max(1, Math.ceil(count / 4)) };
    }

    // AUTO PRESET: Fits 100% of viewport height without scrolling
    if (count === 1) return { cols: 1, rows: 1 };
    if (count === 2) return { cols: 2, rows: 1 }; // 2 streams side-by-side: full stage height!
    if (count <= 4) return { cols: 2, rows: 2 }; // 3-4 streams: 2x2 grid
    if (count <= 6) return { cols: 3, rows: 2 }; // 5-6 streams: 3x2 grid
    if (count <= 9) return { cols: 3, rows: 3 }; // 7-9 streams: 3x3 grid
    if (count <= 12) return { cols: 4, rows: 3 }; // 10-12 streams: 4x3 grid
    return { cols: 4, rows: Math.max(1, Math.ceil(count / 4)) }; // 13+ streams: 4x4 grid
  }, [activePovMembers.length, gridColsPreset]);

  // FALLBACK WIDTH PERCENTAGE FOR FREE-SCROLL MODE
  const getAutoWidthPct = useCallback(
    (count: number): number => {
      if (gridColsPreset === '1') return 100;
      if (gridColsPreset === '2') return 49.3;
      if (gridColsPreset === '3') return 32.6;
      if (gridColsPreset === '4') return 24.3;

      // Auto mode
      if (count <= 1) return 100;
      if (count === 2) return 49.3;
      if (count <= 4) return 49.3; // 2x2
      if (count <= 9) return 32.6; // 3x3
      return 24.3; // 4x4 (10+ streams)
    },
    [gridColsPreset]
  );

  const toggleFitHeightView = () => {
    const next = !fitHeightView;
    setFitHeightView(next);
    if (next) {
      setCardWidths({});
    }
  };

  const handleSelectColsPreset = (preset: 'auto' | '1' | '2' | '3' | '4') => {
    setGridColsPreset(preset);
    setCardWidths({});
    setFitHeightView(true);
  };

  const resetAllCardSizes = () => {
    setGridColsPreset('auto');
    setCardWidths({});
    setFitHeightView(true);
  };

  const resetSingleCardSize = (channelId: string) => {
    setCardWidths((prev) => {
      const next = { ...prev };
      delete next[channelId];
      if (Object.keys(next).length === 0) {
        setFitHeightView(true);
      }
      return next;
    });
  };

  // ZERO-LAG LEFT & RIGHT EDGE RESIZER (WITH POINTER CAPTURE)
  const handleEdgePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    channelId: string,
    side: 'left' | 'right'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // If currently in Height View, smoothly switch to custom resize mode
    if (fitHeightView) {
      setFitHeightView(false);
    }

    const handleEl = e.currentTarget;
    handleEl.setPointerCapture(e.pointerId);

    const stageEl = stageContainerRef.current;
    const cardEl = cardElementRefs.current[channelId];
    if (!stageEl || !cardEl) return;

    const startX = e.clientX;
    const startWidthPx = cardEl.getBoundingClientRect().width;
    const stageWidthPx = Math.max(300, stageEl.clientWidth - 24);

    setResizingChannelId(channelId);
    cardEl.style.transition = 'none';

    let currentPct =
      cardWidths[channelId] ?? getAutoWidthPct(activePovMembers.length);

    const onPointerMove = (moveEvt: PointerEvent) => {
      const rawDeltaX = moveEvt.clientX - startX;
      const signedDelta = side === 'right' ? rawDeltaX : -rawDeltaX;
      const newWidthPx = Math.max(260, Math.min(stageWidthPx, startWidthPx + signedDelta));
      const pct = Math.max(20, Math.min(100, (newWidthPx / stageWidthPx) * 100));
      currentPct = Number(pct.toFixed(1));

      cardEl.style.width = `calc(${currentPct}% - 6px)`;
      const badgeEl = cardBadgeRefs.current[channelId];
      if (badgeEl) {
        badgeEl.textContent = `${Math.round(currentPct)}%`;
      }
    };

    const onPointerUp = (upEvt: PointerEvent) => {
      try {
        handleEl.releasePointerCapture(upEvt.pointerId);
      } catch {
        // ignore
      }
      handleEl.removeEventListener('pointermove', onPointerMove);
      handleEl.removeEventListener('pointerup', onPointerUp);
      handleEl.removeEventListener('pointercancel', onPointerUp);

      setResizingChannelId(null);
      setCardWidths((prev) => ({
        ...prev,
        [channelId]: currentPct,
      }));
    };

    handleEl.addEventListener('pointermove', onPointerMove);
    handleEl.addEventListener('pointerup', onPointerUp);
    handleEl.addEventListener('pointercancel', onPointerUp);
  };

  // RESIZABLE CHAT DOCK (DRAGGABLE FROM LEFT BORDER)
  const handleChatResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const handleEl = e.currentTarget;
    handleEl.setPointerCapture(e.pointerId);
    setIsResizingChat(true);

    const onPointerMove = (moveEvt: PointerEvent) => {
      const newWidth = window.innerWidth - moveEvt.clientX;
      setChatWidthPx(Math.max(280, Math.min(650, newWidth)));
    };

    const onPointerUp = (upEvt: PointerEvent) => {
      try {
        handleEl.releasePointerCapture(upEvt.pointerId);
      } catch {
        // ignore
      }
      handleEl.removeEventListener('pointermove', onPointerMove);
      handleEl.removeEventListener('pointerup', onPointerUp);
      handleEl.removeEventListener('pointercancel', onPointerUp);
      setIsResizingChat(false);
    };

    handleEl.addEventListener('pointermove', onPointerMove);
    handleEl.addEventListener('pointerup', onPointerUp);
    handleEl.addEventListener('pointercancel', onPointerUp);
  };

  return (
    <div
      className={`h-screen h-[100dvh] w-screen w-[100dvw] overflow-hidden flex flex-col select-none transition-colors duration-200 ${
        isDark ? 'bg-[#070506] text-[#F4F4F6]' : 'bg-[#F4F1EA] text-[#120D0E]'
      }`}
    >
      {/* INITIAL LOADING */}
      {isInitialLoading && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${
            isDark ? 'bg-[#070506]' : 'bg-[#F4F1EA]'
          }`}
        >
          <div className="relative flex items-center justify-center mb-5">
            <div className="w-24 h-24 rounded-full border-2 border-red-600/30 border-t-red-600 animate-spin" />
            <img
              src="/assets/logo_v2.png"
              alt="4BLOODS GANG"
              className="w-14 h-14 object-contain absolute drop-shadow-[0_0_12px_rgba(220,38,38,0.6)]"
            />
          </div>
          <h2
            className={`font-display text-2xl tracking-wider uppercase mb-1 ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}
          >
            4BLOODS GANG
          </h2>
          <p className="text-[10px] font-mono-tech text-red-500 font-bold tracking-[0.2em] uppercase">
            MEMINDAI 54 KANAL STREAMER...
          </p>
        </div>
      )}

      {/* TOP SCANNING BAR */}
      {isScanning && !isInitialLoading && (
        <div className="h-0.5 w-full bg-red-600/20 overflow-hidden shrink-0 z-50">
          <div className="h-full bg-red-600 w-1/3 animate-pulse" />
        </div>
      )}

      {/* TOP COMMAND BAR */}
      <header
        className={`h-14 border-b px-3 sm:px-5 flex items-center justify-between gap-2 shrink-0 z-30 ${
          isDark ? 'bg-[#0C080A] border-white/10' : 'bg-white border-zinc-300 shadow-xs'
        }`}
      >
        {/* Left: Sidebar Toggle + 4B Logo + Simple Title + Live Counter */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 border transition-all cursor-pointer shrink-0 rounded-sm ${
              sidebarOpen
                ? 'bg-red-600/15 border-red-500/40 text-red-500'
                : isDark
                  ? 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
                  : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-zinc-950'
            }`}
            title={sidebarOpen ? 'Sembunyikan Sidebar' : 'Buka Sidebar'}
          >
            <Users className="w-4 h-4" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/assets/logo_v2.png"
              alt="4BLOODS GANG"
              className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]"
            />
            <div className="flex flex-col">
              <span
                className={`font-display text-lg tracking-wider uppercase leading-none ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}
              >
                4BLOODS GANG
              </span>
              <span className="text-[9px] font-mono-tech text-red-500 font-bold tracking-[0.18em] uppercase mt-0.5">
                MULTIVIEW HUB
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-[11px] font-mono-tech font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              <strong>{liveStreamers.length}</strong> / {streamers.length} LIVE
            </span>
          </div>
        </div>

        {/* Center: Grid Presets & Height View Toggle */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleFitHeightView}
            className={`px-2.5 py-1 text-[10px] font-mono-tech font-bold uppercase rounded-sm border transition-all flex items-center gap-1.5 cursor-pointer ${
              fitHeightView
                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                : isDark
                  ? 'bg-[#120C0E] border-white/10 text-zinc-400 hover:text-white'
                  : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-zinc-950'
            }`}
            title={
              fitHeightView
                ? 'Mode Height View Aktif (Semua stream otomatis pas dengan tinggi layar tanpa scroll)'
                : 'Mode Free Scroll Aktif (Klik untuk aktifkan Height View)'
            }
          >
            <Maximize2 className="w-3 h-3 text-white" />
            <span>HEIGHT VIEW</span>
            {fitHeightView && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </button>

          <div
            className={`flex items-center border p-0.5 rounded-sm ${
              isDark ? 'bg-[#120C0E] border-white/10' : 'bg-zinc-100 border-zinc-300'
            }`}
          >
            <span
              className={`px-2 text-[10px] font-mono-tech font-bold uppercase flex items-center gap-1 ${
                isDark ? 'text-zinc-400' : 'text-zinc-700'
              }`}
            >
              <Columns className="w-3 h-3 text-red-500" />
              Grid:
            </span>
            {(
              [
                { id: 'auto', label: 'Auto' },
                { id: '1', label: '1x1' },
                { id: '2', label: '2x2' },
                { id: '3', label: '3x3' },
                { id: '4', label: '4x4' },
              ] as const
            ).map((preset) => {
              const active =
                gridColsPreset === preset.id && Object.keys(cardWidths).length === 0;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectColsPreset(preset.id)}
                  className={`px-2 py-1 text-[10px] font-mono-tech font-bold uppercase cursor-pointer rounded-sm ${
                    active
                      ? 'bg-red-600 text-white'
                      : isDark
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-zinc-700 hover:text-zinc-950'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}

            {Object.keys(cardWidths).length > 0 && (
              <button
                onClick={resetAllCardSizes}
                className="ml-1 px-2 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono-tech font-bold uppercase flex items-center gap-1 cursor-pointer hover:bg-amber-500 hover:text-black transition-colors"
                title="Reset ukuran custom video ke Auto Height View"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Right: Audio Toggle, Panduan, Refresh, Chat Toggle, Theme, Profile */}
        <div className="flex items-center gap-1.5 shrink-0">
          {selectedIds.length > 0 && (
            <button
              onClick={() =>
                setUnmutedId(unmutedId ? null : selectedIds[0] || null)
              }
              className={`px-2.5 py-1.5 text-[11px] font-mono-tech font-bold uppercase border transition-colors flex items-center gap-1.5 cursor-pointer rounded-sm ${
                unmutedId
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : isDark
                    ? 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
                    : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-zinc-950'
              }`}
            >
              {unmutedId ? (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Audio On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Mute All</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setShowGuideModal(true)}
            className={`px-2.5 py-1.5 text-[11px] font-mono-tech font-bold uppercase border transition-colors flex items-center gap-1.5 cursor-pointer rounded-sm ${
              isDark
                ? 'bg-zinc-900 border-white/15 text-zinc-200 hover:border-red-500 hover:text-white'
                : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:border-red-500 hover:text-red-600'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-red-500" />
            <span>PANDUAN</span>
          </button>

          <button
            onClick={handleManualRefresh}
            disabled={isScanning || refreshCooldown > 0}
            className={`px-3 py-1.5 text-[11px] font-mono-tech font-bold uppercase rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer ${
              isScanning || refreshCooldown > 0
                ? 'bg-red-600/50 text-white/80 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_12px_rgba(220,38,38,0.35)]'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>
              {isScanning
                ? 'SCAN...'
                : refreshCooldown > 0
                  ? `${refreshCooldown}s`
                  : 'REFRESH'}
            </span>
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-2.5 py-1.5 text-[11px] font-mono-tech font-bold uppercase border transition-colors flex items-center gap-1.5 cursor-pointer rounded-sm ${
              showChat
                ? 'bg-red-600/15 border-red-500/50 text-red-500'
                : isDark
                  ? 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
                  : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-zinc-950'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden md:inline">CHAT</span>
          </button>

          <button
            onClick={toggleTheme}
            className={`p-1.5 border transition-colors cursor-pointer rounded-sm ${
              isDark
                ? 'bg-zinc-900 border-white/10 text-amber-400 hover:border-amber-400/40'
                : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:border-zinc-400'
            }`}
            title={isDark ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            href="/"
            className={`hidden sm:flex px-2.5 py-1.5 border text-[11px] font-mono-tech font-bold uppercase transition-colors items-center gap-1 cursor-pointer rounded-sm ${
              isDark
                ? 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-white'
                : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'
            }`}
          >
            <span>PROFIL</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
          </Link>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex-1 min-h-0 w-full flex flex-row overflow-hidden relative">
        {/* LEFT ROSTER SIDEBAR */}
        {sidebarOpen && (
          <aside
            className={`w-72 sm:w-80 h-full border-r flex flex-col shrink-0 z-20 ${
              isDark ? 'bg-[#0A0708] border-white/10' : 'bg-white border-zinc-300'
            }`}
          >
            <div
              className={`p-3 border-b space-y-2.5 ${
                isDark ? 'border-white/10' : 'border-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono-tech font-bold uppercase tracking-wider ${
                    isDark ? 'text-zinc-400' : 'text-zinc-600'
                  }`}
                >
                  MEMBERS ({filteredRoster.length})
                </span>
                {liveStreamers.length > 0 && (
                  <button
                    onClick={watchAllLive}
                    className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white text-[9px] font-mono-tech font-bold uppercase rounded-sm cursor-pointer transition-colors"
                  >
                    + ALL LIVE ({liveStreamers.length})
                  </button>
                )}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari member / @handle..."
                  className={`w-full border pl-8 pr-7 py-1.5 text-xs focus:outline-none focus:border-red-500 rounded-sm ${
                    isDark
                      ? 'bg-[#120D0F] border-white/10 text-white placeholder:text-zinc-600'
                      : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder:text-zinc-500'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-5 gap-1">
                {(
                  [
                    { id: 'ALL', label: `ALL` },
                    { id: 'LIVE', label: `LIVE (${liveStreamers.length})` },
                    { id: 'UPCOMING', label: `JADWAL` },
                    { id: 'FAV', label: `★ (${favoriteIds.length})` },
                    { id: 'OG', label: 'OG' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterMode(tab.id)}
                    className={`py-1.5 text-[9px] font-mono-tech font-bold uppercase border transition-colors cursor-pointer truncate px-1 rounded-sm ${
                      filterMode === tab.id
                        ? 'bg-red-600 text-white border-red-500'
                        : isDark
                          ? 'bg-[#120C0E] text-zinc-400 border-white/5 hover:text-white'
                          : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:text-zinc-950'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto cam-scroll p-2 space-y-1">
              {filteredRoster.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <Calendar className="w-6 h-6 text-red-500/60 mx-auto" />
                  <p
                    className={`text-xs font-mono-tech uppercase ${
                      isDark ? 'text-zinc-400' : 'text-zinc-600'
                    }`}
                  >
                    {filterMode === 'UPCOMING'
                      ? 'Belum ada jadwal upcoming (> hari ini) dari YouTube.'
                      : 'Tidak ada streamer yang cocok.'}
                  </p>
                </div>
              ) : (
                filteredRoster.map((member) => {
                  const isSelected = selectedIds.includes(member.channelId);
                  const isFav = favoriteIds.includes(member.channelId);
                  const uptime = member.isLive
                    ? formatUptime(member.startTimestamp, nowMs)
                    : null;
                  const upcomingInfo = member.isUpcoming
                    ? formatUpcomingTime(member.scheduledStartTime, nowMs)
                    : null;

                  return (
                    <div
                      key={member.channelId}
                      onClick={() => toggleStreamer(member.channelId)}
                      className={`w-full text-left p-2 border transition-colors flex items-center justify-between gap-2 group cursor-pointer rounded-sm ${
                        isSelected
                          ? 'bg-red-600/15 border-red-500/60'
                          : member.isLive
                            ? isDark
                              ? 'bg-[#130C0F] border-emerald-500/30 hover:border-emerald-500/60'
                              : 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-500'
                            : isDark
                              ? 'bg-[#0D090B] border-white/5 hover:border-white/15'
                              : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={member.avatar || '/assets/logo_v2.png'}
                            alt={member.name}
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                '/assets/logo_v2.png';
                            }}
                            className={`w-8 h-8 rounded-sm object-cover border ${
                              member.isLive
                                ? 'border-emerald-500'
                                : member.isUpcoming
                                  ? 'border-amber-500'
                                  : 'border-zinc-700 opacity-75'
                            }`}
                          />
                          {member.isLive && (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black absolute -bottom-0.5 -right-0.5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-bold truncate ${
                                isSelected
                                  ? 'text-red-500'
                                  : isDark
                                    ? 'text-white'
                                    : 'text-zinc-900'
                              }`}
                            >
                              {member.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`text-[8px] font-mono-tech px-1 py-0.2 border uppercase rounded-sm ${
                                RANK_BADGE_STYLE[member.rank]
                              }`}
                            >
                              {member.rank}
                            </span>
                            {member.isLive ? (
                              <span className="text-[9px] font-mono-tech text-emerald-400 font-bold flex items-center gap-1">
                                ● LIVE {uptime ? `(${uptime})` : ''}
                              </span>
                            ) : member.isUpcoming && upcomingInfo ? (
                              <span className="text-[9px] font-mono-tech text-amber-400 font-bold truncate">
                                ⏳ {upcomingInfo.dateLabel}
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono-tech text-zinc-500">
                                OFFLINE
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => toggleFavorite(member.channelId, e)}
                          className={`p-1 transition-colors cursor-pointer ${
                            isFav
                              ? 'text-amber-400'
                              : 'text-zinc-600 hover:text-zinc-400'
                          }`}
                          title="Simpan ke Favorit"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`}
                          />
                        </button>
                        <div
                          className={`w-5 h-5 rounded-sm flex items-center justify-center border text-[10px] font-mono-tech ${
                            isSelected
                              ? 'bg-red-600 border-red-500 text-white'
                              : isDark
                                ? 'border-white/10 text-zinc-500 group-hover:text-white'
                                : 'border-zinc-300 text-zinc-600 group-hover:text-zinc-950'
                          }`}
                        >
                          {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}

        {/* CENTER STAGE: MULTI-POV WITH AUTO GRID & LIVE DROP PREVIEW */}
        <main className="flex-1 min-h-0 h-full flex flex-col overflow-hidden relative">
          {activePovMembers.length === 0 ? (
            <div className="flex-1 overflow-y-auto cam-scroll p-6 flex flex-col items-center justify-center">
              <div
                className={`max-w-lg w-full p-8 border text-center rounded-lg ${
                  isDark
                    ? 'bg-[#0E090B] border-white/10 shadow-2xl'
                    : 'bg-white border-zinc-300 shadow-md'
                }`}
              >
                <img
                  src="/assets/logo_v2.png"
                  alt="4BLOODS GANG"
                  className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                />
                <h2
                  className={`font-display text-3xl tracking-wider uppercase mb-2 ${
                    isDark ? 'text-white' : 'text-zinc-900'
                  }`}
                >
                  COMMAND CENTER
                </h2>
                <p
                  className={`text-xs mb-6 leading-relaxed ${
                    isDark ? 'text-zinc-400' : 'text-zinc-600'
                  }`}
                >
                  {isScanning
                    ? 'Mengambil data siaran langsung terbaru...'
                    : 'Pilih member di sidebar kiri untuk mulai menonton siaran langsung secara bersamaan.'}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  {liveStreamers.length > 0 && (
                    <button
                      onClick={watchAllLive}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-mono-tech font-bold tracking-widest uppercase rounded cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all"
                    >
                      TAMPILKAN SEMUA STREAM LIVE ({liveStreamers.length})
                    </button>
                  )}
                  <button
                    onClick={() => setShowGuideModal(true)}
                    className={`px-4 py-2.5 border text-xs font-mono-tech font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 ${
                      isDark
                        ? 'bg-zinc-900 border-white/15 text-zinc-200 hover:border-red-500'
                        : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:border-red-500'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-red-500" />
                    <span>BACA PANDUAN</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              ref={stageContainerRef}
              className={`flex-1 min-h-0 h-full w-full p-2 sm:p-2.5 ${
                fitHeightView
                  ? 'grid gap-2 sm:gap-2.5 overflow-hidden'
                  : 'overflow-y-auto cam-scroll p-3 flex flex-wrap justify-center items-start content-start gap-3'
              }`}
              style={
                fitHeightView
                  ? {
                      gridTemplateColumns: `repeat(${gridDimensions.cols}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${gridDimensions.rows}, minmax(0, 1fr))`,
                    }
                  : undefined
              }
            >
              {activePovMembers.map((member, idx) => {
                const isAudioActive = unmutedId === member.channelId;
                const isCardFullscreen = fullscreenCardId === member.channelId;
                const isChatSelected = activeChatMembers.some(
                  (m) => m.channelId === member.channelId
                );
                const uptime = member.isLive
                  ? formatUptime(member.startTimestamp, nowMs)
                  : null;
                const upcomingInfo = member.isUpcoming
                  ? formatUpcomingTime(member.scheduledStartTime, nowMs)
                  : null;
                const activeEmbedVideoId = member.isLive
                  ? member.videoId
                  : member.isUpcoming
                    ? member.upcomingVideoId
                    : null;

                const widthPct =
                  cardWidths[member.channelId] ??
                  getAutoWidthPct(activePovMembers.length);
                const isBeingResized = resizingChannelId === member.channelId;
                const isBeingDragged = draggedIndex === idx;
                const isDropTarget = dragOverIndex === idx && draggedIndex !== idx;

                return (
                  <React.Fragment key={member.channelId}>
                    {/* Live Position Drop Preview Bar (in free scroll mode) */}
                    {isDropTarget && !fitHeightView && (
                      <div className="w-1.5 self-stretch min-h-[180px] bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,1)] animate-pulse shrink-0" />
                    )}

                    <div
                      ref={(el) => {
                        cardElementRefs.current[member.channelId] = el;
                      }}
                      draggable={!resizingChannelId}
                      onDragStart={(e) => {
                        setDraggedIndex(idx);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverIndex !== idx) setDragOverIndex(idx);
                      }}
                      onDragLeave={() => {
                        if (dragOverIndex === idx) setDragOverIndex(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedIndex === null || draggedIndex === idx) {
                          setDraggedIndex(null);
                          setDragOverIndex(null);
                          return;
                        }
                        const next = [...selectedIds];
                        const [moved] = next.splice(draggedIndex, 1);
                        next.splice(idx, 0, moved);
                        setSelectedIds(next);
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      style={
                        isCardFullscreen
                          ? undefined
                          : fitHeightView
                            ? { width: '100%', height: '100%', contain: 'layout style' }
                            : {
                                width: `calc(${widthPct}% - 6px)`,
                                minWidth: '280px',
                                maxWidth: '100%',
                                contain: 'layout style',
                              }
                      }
                      className={`relative flex flex-col border rounded-sm overflow-hidden group/card transition-all ${
                        isCardFullscreen ? 'fixed inset-3 z-50 !w-auto !h-auto' : ''
                      } ${fitHeightView ? 'w-full h-full min-h-0 min-w-0' : ''} ${
                        isBeingDragged ? 'opacity-40 scale-[0.98] border-dashed border-red-500' : ''
                      } ${
                        isDropTarget && fitHeightView
                          ? 'ring-2 ring-red-500 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.8)]'
                          : ''
                      } ${
                        isBeingResized
                          ? 'border-red-500 ring-2 ring-red-500/50 z-30'
                          : isAudioActive
                            ? 'border-red-500/80 shadow-[0_0_15px_rgba(220,38,38,0.25)]'
                            : isDark
                              ? 'border-white/15 bg-[#0C080A]'
                              : 'border-zinc-300 bg-white shadow-xs'
                      }`}
                    >
                      {/* LEFT EDGE RESIZE HANDLE */}
                      {!isCardFullscreen && (
                        <div
                          onPointerDown={(e) =>
                            handleEdgePointerDown(e, member.channelId, 'left')
                          }
                          onDoubleClick={() => resetSingleCardSize(member.channelId)}
                          title="Tarik untuk atur ukuran (Klik 2x untuk reset)"
                          className="absolute left-0 top-9 bottom-0 w-3 z-30 cursor-ew-resize flex items-center justify-start group/lhandle"
                        >
                          <div
                            className={`w-1 h-14 rounded-r transition-all ${
                              isBeingResized
                                ? 'bg-red-500 h-24 shadow-[0_0_10px_rgba(220,38,38,0.9)]'
                                : 'bg-white/20 group-hover/card:bg-red-500/70 group-hover/lhandle:!bg-red-500 group-hover/lhandle:h-20'
                            }`}
                          />
                        </div>
                      )}

                      {/* RIGHT EDGE RESIZE HANDLE */}
                      {!isCardFullscreen && (
                        <div
                          onPointerDown={(e) =>
                            handleEdgePointerDown(e, member.channelId, 'right')
                          }
                          onDoubleClick={() => resetSingleCardSize(member.channelId)}
                          title="Tarik untuk atur ukuran (Klik 2x untuk reset)"
                          className="absolute right-0 top-9 bottom-0 w-3 z-30 cursor-ew-resize flex items-center justify-end group/rhandle"
                        >
                          <div
                            className={`w-1 h-14 rounded-l transition-all ${
                              isBeingResized
                                ? 'bg-red-500 h-24 shadow-[0_0_10px_rgba(220,38,38,0.9)]'
                                : 'bg-white/20 group-hover/card:bg-red-500/70 group-hover/rhandle:!bg-red-500 group-hover/rhandle:h-20'
                            }`}
                          />
                        </div>
                      )}

                      {/* Card Top Control Bar */}
                      <div
                        className={`h-8 sm:h-9 px-2 sm:px-2.5 border-b flex items-center justify-between gap-1.5 shrink-0 ${
                          isDark
                            ? 'bg-[#120C0E] border-white/10'
                            : 'bg-zinc-100 border-zinc-200'
                        }`}
                      >
                        <div
                          className="flex items-center gap-1.5 min-w-0 cursor-grab active:cursor-grabbing"
                          title="Geser kartu untuk mengatur urutan posisi"
                        >
                          <GripVertical className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          {member.isLive ? (
                            <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-mono-tech font-bold uppercase rounded-sm shrink-0">
                              LIVE
                            </span>
                          ) : member.isUpcoming ? (
                            <span className="px-1.5 py-0.5 bg-amber-500 text-black text-[9px] font-mono-tech font-bold uppercase rounded-sm shrink-0">
                              UPCOMING
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-zinc-700 text-zinc-300 text-[9px] font-mono-tech font-bold uppercase rounded-sm shrink-0">
                              OFF
                            </span>
                          )}
                          <span
                            className={`text-xs font-bold truncate ${
                              isDark ? 'text-white' : 'text-zinc-900'
                            }`}
                          >
                            {member.name}
                          </span>
                          {uptime && (
                            <span className="hidden sm:inline text-[9px] font-mono-tech text-emerald-400">
                              ({uptime})
                            </span>
                          )}
                        </div>

                        {/* Card Controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            ref={(el) => {
                              cardBadgeRefs.current[member.channelId] = el;
                            }}
                            onClick={() => resetSingleCardSize(member.channelId)}
                            title="Klik untuk reset ke ukuran Auto"
                            className={`px-1.5 py-0.5 text-[9px] font-mono-tech rounded-sm cursor-pointer ${
                              isBeingResized
                                ? 'bg-red-600 text-white font-bold'
                                : isDark
                                  ? 'bg-zinc-800 text-zinc-400 hover:text-white'
                                  : 'bg-zinc-200 text-zinc-700 hover:text-black'
                            }`}
                          >
                            {fitHeightView ? 'FIT' : `${Math.round(widthPct)}%`}
                          </span>

                          <button
                            onClick={() =>
                              setUnmutedId(isAudioActive ? null : member.channelId)
                            }
                            className={`px-2 py-0.5 text-[9px] font-mono-tech font-bold uppercase rounded-sm flex items-center gap-1 transition-colors cursor-pointer ${
                              isAudioActive
                                ? 'bg-emerald-600 text-white'
                                : isDark
                                  ? 'bg-zinc-800 text-zinc-400 hover:text-white'
                                  : 'bg-zinc-200 text-zinc-700 hover:text-black'
                            }`}
                            title="Solo Audio untuk POV ini"
                          >
                            {isAudioActive ? (
                              <Volume2 className="w-3 h-3" />
                            ) : (
                              <VolumeX className="w-3 h-3" />
                            )}
                            <span className="hidden md:inline">
                              {isAudioActive ? 'AUDIO' : 'MUTE'}
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              selectChatStream(member.channelId);
                              if (!showChat) setShowChat(true);
                            }}
                            className={`p-1 rounded-sm transition-colors cursor-pointer ${
                              isChatSelected && showChat
                                ? 'bg-red-600 text-white'
                                : isDark
                                  ? 'bg-zinc-800 text-zinc-400 hover:text-white'
                                  : 'bg-zinc-200 text-zinc-700 hover:text-black'
                            }`}
                            title="Tampilkan Live Chat Streamer Ini"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() =>
                              setFullscreenCardId(
                                isCardFullscreen ? null : member.channelId
                              )
                            }
                            className={`p-1 rounded-sm transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-zinc-800 text-zinc-400 hover:text-white'
                                : 'bg-zinc-200 text-zinc-700 hover:text-black'
                            }`}
                            title="Fullscreen POV"
                          >
                            {isCardFullscreen ? (
                              <Minimize2 className="w-3 h-3" />
                            ) : (
                              <Maximize2 className="w-3 h-3" />
                            )}
                          </button>

                          <button
                            onClick={() => toggleStreamer(member.channelId)}
                            className="p-1 bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white rounded-sm transition-colors cursor-pointer"
                            title="Tutup Stream"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Video Frame: Dynamically scales to fit the available card height & width */}
                      <div
                        className={`relative w-full bg-black overflow-hidden flex items-center justify-center ${
                          fitHeightView ? 'flex-1 min-h-0 h-full' : 'aspect-video'
                        }`}
                      >
                        {(resizingChannelId || isResizingChat) && (
                          <div className="absolute inset-0 z-20 bg-transparent cursor-ew-resize" />
                        )}

                        {activeEmbedVideoId ? (
                          <div
                            className={`relative flex items-center justify-center ${
                              fitHeightView
                                ? 'w-full h-full max-w-full max-h-full aspect-video'
                                : 'w-full h-full'
                            }`}
                          >
                            <iframe
                              src={`https://www.youtube.com/embed/${activeEmbedVideoId}?autoplay=1&mute=${
                                isAudioActive ? 0 : 1
                              }&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`}
                              title={`${member.name} Stream`}
                              className={`w-full h-full border-0 absolute inset-0 ${
                                resizingChannelId || isResizingChat
                                  ? 'pointer-events-none'
                                  : ''
                              }`}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                            {member.isUpcoming && upcomingInfo && (
                              <div className="absolute bottom-2 left-2 right-2 bg-black/85 border border-amber-500/50 px-3 py-1.5 flex items-center justify-between gap-2 pointer-events-none z-10">
                                <div className="flex items-center gap-2 text-amber-400 text-[10px] font-mono-tech font-bold uppercase">
                                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                                  <span>
                                    JADWAL: {upcomingInfo.dateLabel} • {upcomingInfo.timeLabel}
                                  </span>
                                </div>
                                <span className="px-2 py-0.5 bg-amber-500 text-black text-[9px] font-mono-tech font-bold uppercase">
                                  {upcomingInfo.countdown}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-[#090608]">
                            <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-400 border border-white/10 text-[10px] font-mono-tech font-bold uppercase rounded mb-2">
                              OFFLINE
                            </span>
                            <h3 className="font-display text-xl sm:text-2xl text-white uppercase tracking-wide mb-1">
                              {member.name}
                            </h3>
                            <p className="text-xs text-zinc-400 mb-3">
                              Streamer sedang tidak siaran langsung.
                            </p>
                            <a
                              href={`https://www.youtube.com/channel/${member.channelId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-mono-tech font-bold uppercase tracking-widest rounded transition-all flex items-center gap-1.5"
                            >
                              <span>Kunjungi Channel</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </main>

        {/* RIGHT DOCK: RESIZABLE & AUTO-SPLIT LIVE CHAT */}
        {showChat && (
          <aside
            style={{ width: `${chatWidthPx}px` }}
            className={`h-full border-l flex flex-col shrink-0 z-20 relative ${
              isDark
                ? 'bg-[#0A0708] border-white/10'
                : 'bg-white border-zinc-300 shadow-lg'
            }`}
          >
            {/* Left border drag handle to resize chat dock */}
            <div
              onPointerDown={handleChatResizeStart}
              title="Tarik ke kiri/kanan untuk memperlebar area chat"
              className="absolute -left-1.5 top-0 bottom-0 w-3 cursor-ew-resize z-30 group/chathandle flex items-center justify-center"
            >
              <div
                className={`w-1 h-12 rounded-full transition-all ${
                  isResizingChat
                    ? 'bg-red-500 h-24 shadow-[0_0_10px_rgba(220,38,38,0.9)]'
                    : 'bg-white/10 group-hover/chathandle:bg-red-500/70 group-hover/chathandle:h-20'
                }`}
              />
            </div>

            {/* Chat Top Controls */}
            <div
              className={`p-3 border-b space-y-2 shrink-0 ${
                isDark
                  ? 'border-white/10 bg-[#0E090B]'
                  : 'border-zinc-300 bg-zinc-100 text-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-red-600" />
                  <span
                    className={`text-xs font-mono-tech font-bold uppercase tracking-wider ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    LIVE CHAT {chatSplitMode === 'SPLIT' ? '(AUTO SPLIT)' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <div
                    className={`flex items-center border p-0.5 rounded-sm ${
                      isDark ? 'bg-black border-white/10' : 'bg-white border-zinc-300'
                    }`}
                  >
                    <button
                      onClick={() => setChatSplitMode('SINGLE')}
                      className={`px-2 py-0.5 text-[9px] font-mono-tech font-bold uppercase cursor-pointer rounded-sm ${
                        chatSplitMode === 'SINGLE'
                          ? 'bg-red-600 text-white'
                          : isDark
                            ? 'text-zinc-400 hover:text-white'
                            : 'text-zinc-700 hover:text-black'
                      }`}
                    >
                      1 CHAT
                    </button>
                    <button
                      onClick={() => setChatSplitMode('SPLIT')}
                      className={`px-2 py-0.5 text-[9px] font-mono-tech font-bold uppercase cursor-pointer rounded-sm ${
                        chatSplitMode === 'SPLIT'
                          ? 'bg-red-600 text-white'
                          : isDark
                            ? 'text-zinc-400 hover:text-white'
                            : 'text-zinc-700 hover:text-black'
                      }`}
                    >
                      2 SPLIT
                    </button>
                  </div>

                  <button
                    onClick={() => setShowChat(false)}
                    className={`p-1 cursor-pointer ${
                      isDark
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-zinc-700 hover:text-black'
                    }`}
                    title="Tutup Panel Chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Streamer Selector Pills */}
              {activePovMembers.length > 0 && (
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
                  {activePovMembers.map((m) => {
                    const isSelected = activeChatMembers.some(
                      (cm) => cm.channelId === m.channelId
                    );
                    return (
                      <button
                        key={m.channelId}
                        onClick={() => selectChatStream(m.channelId)}
                        className={`px-2.5 py-1 text-[10px] font-mono-tech font-bold uppercase border shrink-0 transition-colors cursor-pointer rounded-sm ${
                          isSelected
                            ? 'bg-red-600 text-white border-red-500'
                            : isDark
                              ? 'bg-[#140D10] text-zinc-300 border-white/10 hover:text-white'
                              : 'bg-white text-zinc-800 border-zinc-300 hover:border-red-500'
                        }`}
                      >
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chat Iframes */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {activeChatMembers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <MessageSquare className="w-8 h-8 text-red-500/50 mb-2" />
                  <p
                    className={`text-xs font-bold uppercase ${
                      isDark ? 'text-zinc-300' : 'text-zinc-800'
                    }`}
                  >
                    Belum Ada Kanal Chat
                  </p>
                  <p
                    className={`text-[11px] mt-1 ${
                      isDark ? 'text-zinc-500' : 'text-zinc-600'
                    }`}
                  >
                    Pilih streamer di sidebar untuk memuat Live Chat interaktif.
                  </p>
                </div>
              ) : (
                activeChatMembers.map((chatMember, idx) => {
                  const chatVideoId = chatMember.isLive
                    ? chatMember.videoId
                    : chatMember.isUpcoming
                      ? chatMember.upcomingVideoId
                      : null;

                  return (
                    <div
                      key={chatMember.channelId}
                      className={`flex-1 min-h-0 flex flex-col overflow-hidden ${
                        idx > 0
                          ? isDark
                            ? 'border-t border-white/15'
                            : 'border-t border-zinc-300'
                          : ''
                      }`}
                    >
                      <div
                        className={`px-3 py-1.5 border-b flex items-center justify-between shrink-0 ${
                          isDark
                            ? 'bg-[#120C0E] border-white/10'
                            : 'bg-zinc-200 border-zinc-300'
                        }`}
                      >
                        <span
                          className={`text-[10px] font-mono-tech font-bold uppercase truncate ${
                            isDark ? 'text-zinc-200' : 'text-zinc-900'
                          }`}
                        >
                          CHAT // {chatMember.name}
                        </span>
                        {chatVideoId && (
                          <a
                            href={`https://www.youtube.com/live_chat?v=${chatVideoId}&is_popout=1`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] font-mono-tech text-red-500 hover:underline flex items-center gap-0.5"
                            title="Buka Chat di Pop-up Window Terpisah"
                          >
                            <span>POP-OUT</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>

                      {chatVideoId ? (
                        <iframe
                          key={`${chatVideoId}-${theme}`}
                          src={`https://www.youtube.com/live_chat?v=${chatVideoId}&embed_domain=${embedDomain}&dark_theme=${
                            isDark ? '1' : '0'
                          }`}
                          title={`${chatMember.name} Live Chat`}
                          className={`w-full flex-1 border-0 ${
                            isDark ? 'bg-[#090608]' : 'bg-white'
                          }`}
                        />
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                          <p
                            className={`text-xs font-bold uppercase ${
                              isDark ? 'text-zinc-300' : 'text-zinc-800'
                            }`}
                          >
                            {chatMember.name} Offline
                          </p>
                          <p
                            className={`text-[11px] mt-1 ${
                              isDark ? 'text-zinc-500' : 'text-zinc-600'
                            }`}
                          >
                            Chat hanya aktif ketika streamer sedang siaran langsung.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}
      </div>

      {/* PANDUAN MODAL */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div
            className={`max-w-lg w-full border rounded-lg overflow-hidden shadow-2xl ${
              isDark ? 'bg-[#120C0E] border-white/15' : 'bg-white border-zinc-300'
            }`}
          >
            <div
              className={`px-5 py-4 border-b flex items-center justify-between ${
                isDark ? 'bg-[#181014] border-white/10' : 'bg-zinc-100 border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/logo_v2.png"
                  alt="4BG"
                  className="w-6 h-6 object-contain"
                />
                <h3
                  className={`font-display text-xl tracking-wider uppercase ${
                    isDark ? 'text-white' : 'text-zinc-900'
                  }`}
                >
                  PANDUAN NONTON MULTIVIEW
                </h3>
              </div>
              <button
                onClick={closeGuideModal}
                className="p-1 text-zinc-400 hover:text-red-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs leading-relaxed">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-red-600 text-white font-mono-tech font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong
                    className={`block text-sm mb-0.5 ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    Pilih Streamer (Multi-POV)
                  </strong>
                  <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                    Klik nama member bertanda{' '}
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono-tech font-bold rounded-sm">
                      LIVE
                    </span>{' '}
                    di sidebar kiri untuk membuka beberapa siaran langsung sekaligus.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-red-600 text-white font-mono-tech font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong
                    className={`block text-sm mb-0.5 ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    Atur Ukuran Video dari Pinggir Kiri & Kanan
                  </strong>
                  <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                    Tarik garis di <strong>sisi kiri atau kanan kartu video</strong> untuk
                    memperbesar atau memperkecil ukuran tiap POV secara bebas tanpa lag. Klik
                    2x garis atau klik angka <code>%</code> untuk mereset ukuran kartu.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-red-600 text-white font-mono-tech font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <strong
                    className={`block text-sm mb-0.5 ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    Grid Otomatis & Drag-and-Drop dengan Preview
                  </strong>
                  <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                    Ukuran kolom video menyesuaikan secara otomatis (1x1, 2x2, 3x3, hingga 4x4).
                    Geser bar atas kartu untuk menukar posisi video dengan indikator garis merah.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-red-600 text-white font-mono-tech font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <strong
                    className={`block text-sm mb-0.5 ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    Audio Solo & Auto-Split Live Chat (Dapat Diperlebar)
                  </strong>
                  <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                    Klik tombol <strong>AUDIO</strong> pada kartu untuk mendengar satu suara
                    tanpa bertabrakan. Panel Chat otomatis membagi 2 kolom obrolan saat memilih
                    banyak stream, dan dapat ditarik batas kirinya untuk diperlebar.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`px-5 py-3.5 border-t flex items-center justify-between ${
                isDark ? 'bg-[#181014] border-white/10' : 'bg-zinc-100 border-zinc-200'
              }`}
            >
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowGuideAgain}
                  onChange={(e) => setDontShowGuideAgain(e.target.checked)}
                  className="accent-red-600"
                />
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-700'}>
                  Jangan tampilkan otomatis lagi
                </span>
              </label>

              <button
                onClick={closeGuideModal}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono-tech font-bold uppercase tracking-wider rounded cursor-pointer transition-colors"
              >
                SAYA MENGERTI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
