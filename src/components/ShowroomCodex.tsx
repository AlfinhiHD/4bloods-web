'use client';

import React, { useState, useRef, useMemo } from 'react';
import { WardrobeItem, WARDROBE_ITEMS } from '@/data/4bloods-data';
import {
  Box,
  RotateCw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Layers,
} from 'lucide-react';

interface ShowroomCodexProps {
  isDark: boolean;
  onOpenLightbox?: (img: { src: string; title: string; subtitle?: string }) => void;
}

export default function ShowroomCodex({ isDark, onOpenLightbox }: ShowroomCodexProps) {
  // Category filter state
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Track flipped state per card (card ID -> boolean: true = back view)
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Active inspect modal for viewing piece details
  const [inspectItem, setInspectItem] = useState<WardrobeItem | null>(null);
  const [inspectViewMode, setInspectViewMode] = useState<'FRONT' | 'BACK'>('FRONT');

  // Carousel ref for smooth native scrolling
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  // Filtered in-game items
  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return WARDROBE_ITEMS;
    if (activeCategory === 'hoodie') return WARDROBE_ITEMS.filter((i) => i.category === 'hoodie');
    if (activeCategory === 'workshirt') return WARDROBE_ITEMS.filter((i) => i.category === 'workshirt');
    if (activeCategory === 'tee') return WARDROBE_ITEMS.filter((i) => i.category === 'tee');
    if (activeCategory === 'gear') return WARDROBE_ITEMS.filter((i) => i.category === 'headwear' || i.category === 'bag');
    return WARDROBE_ITEMS;
  }, [activeCategory]);

  // Flip toggle per card
  const toggleFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Scroll carousel left / right smoothly
  const scrollCarousel = (direction: 'prev' | 'next') => {
    if (!carouselRef.current) return;
    const cardWidth = 380; // approximate card width + gap
    const scrollAmount = direction === 'next' ? cardWidth : -cardWidth;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Update carousel scroll position tracker
  const handleScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = 380;
    const idx = Math.round(scrollLeft / cardWidth);
    setCarouselIndex(Math.min(Math.max(idx, 0), filteredItems.length - 1));
  };

  // Badge rendering helper
  const renderBadge = (badgeText?: string, variant?: 'red' | 'orange' | 'cyan' | 'slate') => {
    if (!badgeText) return null;
    let bgClass = 'bg-red-600 text-white';
    if (variant === 'orange' || badgeText.includes('WEST COAST') || badgeText.includes('LOGISTICS')) {
      bgClass = 'bg-[#D97706] text-white';
    } else if (variant === 'cyan' || badgeText.includes('DROP') || badgeText.includes('CHAPTER')) {
      bgClass = 'bg-[#0284C7] text-white';
    } else if (variant === 'slate' || badgeText.includes('STEALTH') || badgeText.includes('CONCRETE')) {
      bgClass = 'bg-zinc-700 text-zinc-100';
    }

    return (
      <span
        className={`px-2 py-0.5 text-[9px] font-mono-tech font-bold tracking-wider uppercase inline-block shadow-sm ${bgClass}`}
      >
        {badgeText}
      </span>
    );
  };

  return (
    <section
      id="wardrobe"
      className={`py-20 sm:py-28 border-b relative overflow-hidden transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-b from-[#16070D] via-[#0D0509] to-[#12060C] border-red-600/30 text-white'
          : 'bg-gradient-to-b from-[#FAF4F6] via-[#F4E9ED] to-[#FBF2F5] border-red-200 text-zinc-900'
      }`}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-blueprint-dots opacity-30" />
        <div
          style={{
            background: 'radial-gradient(circle, rgba(220,38,38,0.18) 0%, rgba(220,38,38,0) 70%)',
          }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full pointer-events-none"
        />
        <div
          className={`absolute top-10 right-8 font-sans font-black text-[120px] sm:text-[190px] leading-none select-none tracking-tighter ${
            isDark ? 'text-red-600/[0.04]' : 'text-red-950/[0.04]'
          }`}
        >
          WARDROBE
        </div>
      </div>

      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 relative z-10">
        {/* =====================================================================
            HEADER BAR: STREETWEAR APPAREL CODEX
        ===================================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 pb-6 border-b border-red-600/20 gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-tech font-bold text-red-500 tracking-[0.25em] uppercase mb-2">
              <Box className="w-3.5 h-3.5 text-red-500" />
              <span>SECTION // 03 — APPAREL CODEX</span>
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-none text-balance">
              CUSTOM DRIP ARCHIVE & <span className="text-red-600">WARDROBE</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-left sm:text-right font-mono-tech text-xs tracking-wider">
              <div className="text-amber-500 font-bold uppercase tracking-widest">
                4BLOODS OFFICIAL IN-GAME EUP
              </div>
              <div className="text-red-500/90 text-[11px] font-semibold mt-0.5">
                SOUTH SIDE ROXWOOD // POSTAL 1051–1052
              </div>
            </div>

            {/* Carousel Navigation Arrows */}
            <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
              <button
                onClick={() => scrollCarousel('prev')}
                className={`p-2.5 border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#150D12] border-white/15 hover:border-red-500 hover:bg-red-600 text-white'
                    : 'bg-white border-zinc-300 hover:border-red-500 hover:bg-red-600 hover:text-white text-zinc-800'
                }`}
                title="Slide Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCarousel('next')}
                className={`p-2.5 border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#150D12] border-white/15 hover:border-red-500 hover:bg-red-600 text-white'
                    : 'bg-white border-zinc-300 hover:border-red-500 hover:bg-red-600 hover:text-white text-zinc-800'
                }`}
                title="Slide Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================================
            CATEGORY FILTER TABS
        ===================================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: `ALL PIECES (${WARDROBE_ITEMS.length})` },
              { id: 'hoodie', label: 'HOODIES (3)' },
              { id: 'workshirt', label: 'WORKSHIRTS (2)' },
              { id: 'tee', label: 'HOOD DAYS TEES (2)' },
              { id: 'gear', label: 'HEADWEAR & GEAR (2)' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  if (carouselRef.current) carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                }}
                className={`px-4 py-2 text-xs font-mono-tech font-bold tracking-wider uppercase border cursor-pointer transition-all ${
                  activeCategory === cat.id
                    ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.35)]'
                    : isDark
                      ? 'bg-[#140D12] text-zinc-300 border-white/10 hover:border-red-500/50 hover:text-white'
                      : 'bg-white text-zinc-700 border-zinc-300 hover:border-red-500'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Carousel Progress Indicator */}
          <div className="hidden sm:flex items-center gap-2 font-mono-tech text-xs text-zinc-400">
            <span className="text-red-500 font-bold">
              {String(carouselIndex + 1).padStart(2, '0')}
            </span>
            <span>/</span>
            <span>{String(filteredItems.length).padStart(2, '0')} PIECES</span>
          </div>
        </div>

        {/* =====================================================================
            LIGHTWEIGHT CAROUSEL TRACK (HARDWARE-ACCELERATED, 60FPS)
        ===================================================================== */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-2 scroll-smooth select-none focus:outline-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filteredItems.map((item, idx) => {
            const isFlipped = Boolean(flippedCards[item.id]);
            const displayImage = isFlipped && item.backImage ? item.backImage : item.frontImage;

            return (
              <div
                key={item.id}
                onClick={() => {
                  setInspectItem(item);
                  setInspectViewMode(isFlipped ? 'BACK' : 'FRONT');
                }}
                className={`w-[85vw] sm:w-[350px] md:w-[370px] shrink-0 snap-start border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                  isDark
                    ? 'bg-[#110A0E] border-white/10 hover:border-red-500/80 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_15px_40px_rgba(220,38,38,0.2)]'
                    : 'bg-white border-zinc-300 hover:border-red-500 shadow-md hover:shadow-xl'
                }`}
              >
                {/* Visual Area: Studio Stage Photo */}
                <div
                  className={`relative aspect-[4/4.5] flex items-center justify-center p-4 overflow-hidden ${
                    isDark
                      ? 'bg-gradient-to-b from-[#1C1218] via-[#0F080C] to-[#0A0608]'
                      : 'bg-gradient-to-b from-[#F2EDF0] via-[#E8E2E6] to-[#DDD5DC]'
                  }`}
                >
                  <div className="absolute inset-0 bg-tactical-grid opacity-20 pointer-events-none" />

                  {/* Top-Left Rank / Category Badge */}
                  <div className="absolute top-3 left-3 z-20">
                    {renderBadge(item.badge || item.tier, item.badgeVariant)}
                  </div>

                  {/* Top-Right Index Counter */}
                  <span className="absolute top-3 right-3 z-20 text-[10px] font-mono-tech font-bold text-zinc-400">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Garment Image */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={displayImage}
                      alt={item.name}
                      loading="lazy"
                      className="max-h-[82%] max-w-[85%] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Bottom-Right "FLIP VIEW =" Toggle (for items with back images) */}
                  {item.backImage && (
                    <button
                      onClick={(e) => toggleFlip(item.id, e)}
                      className="absolute bottom-3 right-3 z-20 px-2.5 py-1 bg-black/85 hover:bg-red-600 border border-white/20 text-[9px] font-mono-tech font-extrabold uppercase tracking-wider text-white transition-colors cursor-pointer flex items-center gap-1 shadow-md"
                      title="Balik Tampilan Depan / Belakang"
                    >
                      <RotateCw className="w-2.5 h-2.5" />
                      <span>{isFlipped ? 'DEPAN' : 'BELAKANG'}</span>
                      <span className="text-red-400 font-bold">=</span>
                    </button>
                  )}
                </div>

                {/* Card Body Info */}
                <div className="p-4 flex flex-col justify-between flex-1 border-t border-white/5">
                  <div>
                    <h3
                      className={`font-sans font-black text-sm sm:text-base tracking-wide uppercase leading-tight truncate ${
                        isDark ? 'text-white group-hover:text-red-400' : 'text-zinc-900 group-hover:text-red-600'
                      }`}
                    >
                      {item.name}
                    </h3>

                    <div className="text-[11px] font-mono-tech font-bold text-amber-500 uppercase tracking-wider mt-1 truncate">
                      {item.subtitle || item.categoryLabel}
                    </div>

                    <p className="text-[11px] font-sans text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Card Footer: Spec Tag & Zoom Action */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10">
                    <span
                      className={`text-[9px] font-mono-tech font-extrabold uppercase tracking-wider px-2 py-0.5 border ${
                        isDark ? 'bg-black/40 border-white/10 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                      }`}
                    >
                      {item.tag || item.era}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectItem(item);
                        setInspectViewMode(isFlipped ? 'BACK' : 'FRONT');
                      }}
                      className="px-2.5 py-1 text-[10px] font-mono-tech font-bold uppercase tracking-wider border border-white/15 hover:border-red-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-2.5 h-2.5 text-red-500" />
                      <span>DETAIL</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Bottom Drag / Swipe Hint */}
        <div className="flex items-center justify-between mt-4 text-[11px] font-mono-tech text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>GESER / SWIPE UNTUK MELIHAT SEMUA SET PAKAIAN 4BLOODS</span>
          </div>
          <span className="hidden sm:inline">KLIK KARTU UNTUK INSPEKSI HD LENGKAP</span>
        </div>
      </div>

      {/* =====================================================================
          LIGHTWEIGHT DETAIL MODAL (INSPECT PIECE ZOOM & SPECS)
      ===================================================================== */}
      {inspectItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setInspectItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative max-w-2xl w-full border my-auto overflow-hidden shadow-2xl ${
              isDark ? 'bg-[#100B0E] border-red-500/50 text-white' : 'bg-white border-zinc-300 text-zinc-900'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`px-5 py-3.5 border-b flex items-center justify-between ${
                isDark ? 'bg-[#160E14] border-white/10' : 'bg-zinc-100 border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-mono-tech font-bold uppercase">
                  4BG APPAREL ARCHIVE
                </span>
                <span className="text-xs font-mono-tech text-amber-500 font-bold uppercase">
                  {inspectItem.categoryLabel}
                </span>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="p-1 hover:bg-red-600 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Product Image Area */}
              <div
                className={`relative aspect-[4/3] flex items-center justify-center p-6 border mb-4 ${
                  isDark
                    ? 'bg-gradient-to-b from-[#1C1218] to-[#0A0608] border-white/10'
                    : 'bg-gradient-to-b from-zinc-100 to-zinc-200 border-zinc-300'
                }`}
              >
                <img
                  src={
                    inspectViewMode === 'BACK' && inspectItem.backImage
                      ? inspectItem.backImage
                      : inspectItem.frontImage
                  }
                  alt={inspectItem.name}
                  className="max-h-[88%] max-w-[88%] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.85)]"
                />

                {inspectItem.backImage && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/80 p-1 border border-white/20">
                    <button
                      onClick={() => setInspectViewMode('FRONT')}
                      className={`px-2.5 py-1 text-[10px] font-mono-tech font-bold uppercase cursor-pointer ${
                        inspectViewMode === 'FRONT' ? 'bg-red-600 text-white' : 'text-zinc-400'
                      }`}
                    >
                      TAMPAK DEPAN
                    </button>
                    <button
                      onClick={() => setInspectViewMode('BACK')}
                      className={`px-2.5 py-1 text-[10px] font-mono-tech font-bold uppercase cursor-pointer ${
                        inspectViewMode === 'BACK' ? 'bg-red-600 text-white' : 'text-zinc-400'
                      }`}
                    >
                      TAMPAK BELAKANG
                    </button>
                  </div>
                )}
              </div>

              {/* Title & Specs */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {renderBadge(inspectItem.badge || inspectItem.tier, inspectItem.badgeVariant)}
                  <span className="text-[10px] font-mono-tech text-zinc-400 uppercase">
                    {inspectItem.era}
                  </span>
                </div>

                <h3 className="font-sans font-black text-2xl uppercase tracking-wide">
                  {inspectItem.name}
                </h3>

                <p className="text-xs font-sans text-zinc-300 leading-relaxed mt-2 mb-4">
                  {inspectItem.description}
                </p>

                {/* Specs List */}
                <div className="pt-3 border-t border-white/10">
                  <span className="text-[10px] font-mono-tech font-bold text-zinc-400 uppercase block mb-1.5">
                    SPESIFIKASI IN-GAME MESH & MATERIAL:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {inspectItem.specs.map((sp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs font-mono-tech bg-black/40 border border-white/10 text-zinc-300"
                      >
                        • {sp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
