'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OFFICIAL_MEDIA_TRACKS } from '@/data/4bloods-data';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Disc,
  ChevronLeft,
  ChevronRight,
  Music,
  X,
  EyeOff,
} from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface PullOutAudioDrawerProps {
  isDark?: boolean;
}

export default function StickyAudioPlayer({ isDark: propIsDark }: PullOutAudioDrawerProps) {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0); // Default: THIS IS 4BLOODS
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [internalDark, setInternalDark] = useState(true);

  const playerRef = useRef<any>(null);
  const shouldPlayOnReadyRef = useRef<boolean>(false);
  const currentTrack = OFFICIAL_MEDIA_TRACKS[currentTrackIdx] || OFFICIAL_MEDIA_TRACKS[0];

  useEffect(() => {
    try {
      const savedDismissed = localStorage.getItem('4bg_sticky_player_dismissed');
      if (savedDismissed === 'true') {
        setIsDismissed(true);
      }
    } catch {}

    const updateTheme = () => {
      const isDocDark =
        document.documentElement.classList.contains('dark') ||
        !document.documentElement.classList.contains('light');
      setInternalDark(isDocDark);
    };
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const isDark = propIsDark !== undefined ? propIsDark : internalDark;

  useEffect(() => {
    const initPlayer = () => {
      if (!document.getElementById('yt-sticky-audio-mount')) return;
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player('yt-sticky-audio-mount', {
        height: '1',
        width: '1',
        videoId: currentTrack.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            setPlayerReady(true);
            try {
              event.target.unMute();
              event.target.setVolume(80);
              setIsMuted(false);
            } catch {}
            if (shouldPlayOnReadyRef.current) {
              try {
                event.target.unMute();
              } catch {}
              event.target.playVideo();
              setIsPlaying(true);
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              setIsPlaying(true);
              try {
                if (!isMuted && typeof event.target.unMute === 'function') {
                  event.target.unMute();
                  if (typeof event.target.getVolume === 'function' && event.target.getVolume() === 0) {
                    event.target.setVolume(80);
                  }
                }
              } catch {}
            } else if (event.data === 2) {
              setIsPlaying(false);
            } else if (event.data === 0) {
              setCurrentTrackIdx((prev) => (prev + 1) % OFFICIAL_MEDIA_TRACKS.length);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.body.appendChild(tag);
      }
    }
  }, []);

  useEffect(() => {
    if (playerReady && playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.loadVideoById(currentTrack.videoId);
      try {
        if (!isMuted && typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
          playerRef.current.setVolume(80);
        }
      } catch {}
      setIsPlaying(true);
    }
  }, [currentTrackIdx]);

  useEffect(() => {
    const handlePauseMusic = () => {
      if (playerReady && playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      }
    };
    window.addEventListener('4bg-pause-music', handlePauseMusic);
    return () => window.removeEventListener('4bg-pause-music', handlePauseMusic);
  }, [playerReady]);

  const togglePlay = () => {
    if (!playerReady || !playerRef.current) {
      shouldPlayOnReadyRef.current = !shouldPlayOnReadyRef.current;
      setIsPlaying(shouldPlayOnReadyRef.current);
      return;
    }
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      try {
        if (typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
          setIsMuted(false);
        }
        if (typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(80);
        }
      } catch {}
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % OFFICIAL_MEDIA_TRACKS.length);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIdx(
      (prev) => (prev - 1 + OFFICIAL_MEDIA_TRACKS.length) % OFFICIAL_MEDIA_TRACKS.length
    );
  };

  const toggleMute = () => {
    if (!playerReady || !playerRef.current) return;
    try {
      const currentlyMuted =
        typeof playerRef.current.isMuted === 'function'
          ? playerRef.current.isMuted()
          : isMuted;

      if (currentlyMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(80);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch {}
  };

  const handleDismiss = () => {
    setDrawerOpen(false);
    setIsDismissed(true);
    try {
      localStorage.setItem('4bg_sticky_player_dismissed', 'true');
    } catch {}
  };

  const handleRestore = () => {
    setIsDismissed(false);
    setDrawerOpen(true);
    try {
      localStorage.setItem('4bg_sticky_player_dismissed', 'false');
    } catch {}
  };

  return (
    <>
      {/* Hidden 1x1 YouTube Audio Engine */}
      <div className="w-px h-px opacity-0 pointer-events-none fixed -top-10 -left-10 overflow-hidden">
        <div id="yt-sticky-audio-mount" />
      </div>

      {/* Discreet Floating Restore Button when Sticky Player is Dismissed */}
      {isDismissed && (
        <button
          onClick={handleRestore}
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 p-2 sm:px-3 sm:py-2 border shadow-[0_10px_30px_rgba(0,0,0,0.65)] flex items-center gap-2 cursor-pointer backdrop-blur-xl transition-all duration-300 hover:scale-105 select-none ${
            isPlaying
              ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'
              : isDark
                ? 'bg-[#120A0E]/95 border-red-500/40 text-white hover:border-red-500'
                : 'bg-white/95 border-zinc-300 text-zinc-900 hover:border-red-500'
          }`}
          title="Buka Musik 4Bloods Player"
        >
          <Disc
            className={`w-4 h-4 ${isPlaying ? 'animate-spin' : 'text-red-500'}`}
            style={{ animationDuration: '4s' }}
          />
          <span className="text-[10px] sm:text-xs font-mono-tech font-bold uppercase tracking-wider">
            {isPlaying ? '4BG ON AIR' : '4BG MUSIK'}
          </span>
          {isPlaying && (
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          )}
        </button>
      )}

      {/* Mobile Drawer Backdrop */}
      {!isDismissed && drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* =====================================================================
          RIGHT-EDGE PULL-OUT SONG LIST DRAWER (Dedicated 100% to Music)
      ===================================================================== */}
      {!isDismissed && (
        <div
          className={`fixed top-1/2 -translate-y-1/2 right-0 z-50 flex items-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] select-none ${
            drawerOpen ? 'translate-x-0' : 'translate-x-[290px] sm:translate-x-[350px]'
          }`}
        >
          {/* Left Pull-Out Handle Tabs (Always visible on the right edge of screen) */}
          <div className="flex flex-col gap-1.5 -mr-px shrink-0">
            {/* Dismiss / Close Sticky Tab */}
            <button
              onClick={handleDismiss}
              className={`w-11 h-7 border border-r-0 flex items-center justify-center cursor-pointer transition-colors ${
                isDark
                  ? 'bg-[#140A0D]/95 hover:bg-red-600 text-zinc-400 hover:text-white border-red-500/40'
                  : 'bg-white/95 hover:bg-red-600 hover:text-white text-zinc-600 border-zinc-300'
              }`}
              title="Tutup / Sembunyikan Sticky Widget"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Pull-Out Song List / Audio Tab */}
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className={`w-11 py-4 border border-r-0 flex flex-col items-center justify-center gap-2.5 shadow-2xl cursor-pointer transition-colors ${
                drawerOpen
                  ? 'bg-red-600 text-white border-red-500'
                  : isDark
                    ? 'bg-[#110A0D]/98 hover:bg-red-600 text-white border-red-500/40'
                    : 'bg-white/98 hover:bg-red-600 hover:text-white text-zinc-900 border-zinc-300'
              }`}
              title={drawerOpen ? 'Tutup Panel Lagu' : 'Tarik Keluar: 4Bloods Audio & Song List'}
            >
              {drawerOpen ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-red-500" />
              )}
              <Disc
                className={`w-5 h-5 ${isPlaying ? 'animate-spin text-red-400' : ''}`}
                style={{ animationDuration: '6s' }}
              />
              <span
                style={{ writingMode: 'vertical-rl' }}
                className="text-[10px] font-mono-tech font-bold tracking-[0.2em] uppercase rotate-180"
              >
                {isPlaying ? 'ON AIR • SONG LIST' : '4BG SONG LIST'}
              </span>
            </button>

            {/* Quick Play/Pause Mini Button on Edge */}
            <button
              onClick={togglePlay}
              className="w-11 h-11 bg-red-600 hover:bg-red-500 text-white border border-r-0 border-red-500 flex items-center justify-center shadow-xl cursor-pointer"
              title={isPlaying ? 'Pause Lagu' : 'Putar Lagu: ' + currentTrack.title}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>
          </div>

          {/* Pull-Out Drawer Body */}
          <div
            className={`w-[290px] sm:w-[350px] max-w-[calc(100vw-48px)] border-l border-y shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden ${
              isDark
                ? 'bg-[#0C0709]/98 border-red-500/40 text-white'
                : 'bg-white/98 border-zinc-300 text-zinc-900'
            }`}
          >
            {/* Drawer Header */}
            <div
              className={`px-4 py-3 border-b flex items-center justify-between ${
                isDark ? 'bg-[#140B0F] border-white/10' : 'bg-zinc-100 border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-red-500" />
                <span className="text-xs font-mono-tech font-bold uppercase tracking-wider">
                  4BLOODS SOUNDTRACK
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-gothic text-lg text-red-500 mr-1">4BG</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className={`p-1 rounded-xs transition-colors cursor-pointer ${
                    isDark
                      ? 'text-zinc-400 hover:text-white hover:bg-white/10'
                      : 'text-zinc-600 hover:text-black hover:bg-zinc-200'
                  }`}
                  title="Tutup Panel Lagu"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDismiss}
                  className={`p-1 rounded-xs transition-colors cursor-pointer ${
                    isDark
                      ? 'text-zinc-400 hover:text-white hover:bg-red-600'
                      : 'text-zinc-600 hover:text-white hover:bg-red-600'
                  }`}
                  title="Sembunyikan Sticky Widget Sepenuhnya"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

          {/* Active Track Vinyl Deck */}
          <div className="p-4 border-b border-current/10 space-y-3">
            <div className="flex items-center gap-3.5">
              <div
                onClick={togglePlay}
                className="relative w-14 h-14 rounded-full bg-zinc-900 border-2 border-red-600 overflow-hidden shrink-0 cursor-pointer flex items-center justify-center shadow-lg"
              >
                <img
                  src={currentTrack.thumb}
                  alt={currentTrack.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/assets/logo_v2.png';
                  }}
                  className={`w-full h-full object-cover ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '7s' }}
                />
                <div className="w-3.5 h-3.5 rounded-full bg-black border border-red-500 absolute" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 bg-red-600 text-white text-[9px] font-mono-tech font-bold uppercase">
                    {currentTrack.type}
                  </span>
                  {isPlaying && (
                    <span className="text-[9px] font-mono-tech text-emerald-500 font-bold">
                      ● PLAYING
                    </span>
                  )}
                </div>
                <div className="font-display text-xl tracking-wider truncate mt-0.5">
                  {currentTrack.title}
                </div>
                <div
                  className={`text-[10px] font-mono-tech truncate ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  {currentTrack.artist} • {currentTrack.duration}
                </div>
              </div>
            </div>

            {/* Transport Controls */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevTrack}
                  className={`p-2 border cursor-pointer ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'
                      : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800'
                  }`}
                  title="Lagu Sebelumnya"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={togglePlay}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-white" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-white" />
                  )}
                  <span>{isPlaying ? 'PAUSE' : 'PLAY ANTHEM'}</span>
                </button>

                <button
                  onClick={handleNextTrack}
                  className={`p-2 border cursor-pointer ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'
                      : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800'
                  }`}
                  title="Lagu Berikutnya"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={toggleMute}
                className={`p-2 border cursor-pointer ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                    : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-red-500" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* 5-Track Song List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-current/10">
            {OFFICIAL_MEDIA_TRACKS.map((track, idx) => {
              const active = idx === currentTrackIdx;
              return (
                <button
                  key={track.id}
                  onClick={() => {
                    setCurrentTrackIdx(idx);
                    if (!isPlaying && playerReady && playerRef.current) {
                      playerRef.current.playVideo();
                      setIsPlaying(true);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    active
                      ? 'bg-red-600/15 text-red-500'
                      : isDark
                        ? 'hover:bg-white/[0.04] text-zinc-300'
                        : 'hover:bg-zinc-100 text-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono-tech text-xs font-bold text-red-500 w-4">
                      0{idx + 1}
                    </span>
                    <img
                      src={track.thumb}
                      alt={track.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/assets/logo_v2.png';
                      }}
                      className="w-9 h-9 object-cover border border-red-500/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{track.title}</div>
                      <div className="text-[10px] font-mono-tech opacity-75 uppercase">
                        {track.type} • {track.duration}
                      </div>
                    </div>
                  </div>
                  {active && (
                    <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-mono-tech font-bold shrink-0">
                      {isPlaying ? 'ON' : 'SEL'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Options */}
          <div
            className={`p-2.5 border-t text-center ${
              isDark ? 'bg-[#0E0709] border-white/10' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <button
              onClick={handleDismiss}
              className="text-[10px] font-mono-tech uppercase text-zinc-400 hover:text-red-500 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <EyeOff className="w-3 h-3" />
              <span>Sembunyikan Sticky Widget</span>
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
