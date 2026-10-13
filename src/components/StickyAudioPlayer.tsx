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

export default function StickyAudioPlayer({ isDark = true }: PullOutAudioDrawerProps) {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0); // Default: THIS IS 4BLOODS
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const playerRef = useRef<any>(null);
  const currentTrack = OFFICIAL_MEDIA_TRACKS[currentTrackIdx] || OFFICIAL_MEDIA_TRACKS[0];

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
            event.target.setVolume(80);
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              setIsPlaying(true);
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
      setIsPlaying(true);
    }
  }, [currentTrackIdx]);

  const togglePlay = () => {
    if (!playerReady || !playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
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
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  return (
    <>
      {/* Hidden 1x1 YouTube Audio Engine */}
      <div className="w-px h-px opacity-0 pointer-events-none fixed -top-10 -left-10 overflow-hidden">
        <div id="yt-sticky-audio-mount" />
      </div>

      {/* =====================================================================
          RIGHT-EDGE PULL-OUT SONG LIST DRAWER (Dedicated 100% to Music)
      ===================================================================== */}
      <div
        className={`fixed top-1/2 -translate-y-1/2 right-0 z-50 flex items-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] select-none ${
          drawerOpen ? 'translate-x-0' : 'translate-x-[320px] sm:translate-x-[350px]'
        }`}
      >
        {/* Left Pull-Out Handle Tabs (Always visible on the right edge of screen) */}
        <div className="flex flex-col gap-1.5 -mr-px">
          {/* Pull-Out Song List / Audio Tab */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={`w-11 py-4 border border-r-0 flex flex-col items-center justify-center gap-2.5 shadow-2xl cursor-pointer transition-colors ${
              drawerOpen
                ? 'bg-red-600 text-white border-red-500'
                : isDark
                  ? 'bg-[#110A0D]/95 hover:bg-red-600 text-white border-red-500/40'
                  : 'bg-white/95 hover:bg-red-600 hover:text-white text-zinc-900 border-zinc-300'
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

        {/* Pull-Out Drawer Body (320px / 350px wide) */}
        <div
          className={`w-[320px] sm:w-[350px] border-l border-y shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden ${
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
            <span className="font-gothic text-lg text-red-500">4BG</span>
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
        </div>
      </div>
    </>
  );
}
