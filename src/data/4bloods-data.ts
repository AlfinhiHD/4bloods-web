export interface StreamerMember {
  name: string;
  channelId: string;
  handle?: string;
  rank: 'OG' | 'Under OG' | 'Young Bloods' | 'Member';
  role: string;
  chapter: string;
  featuredVideoId?: string;
  featuredTitle?: string;
  featuredThumb?: string;
  bio?: string;
  subscribers?: number;
  subscribersText?: string;
  banner?: string;
  avatar?: string;
}

export interface LoreChapter {
  id: string;
  number: string;
  roman: string;
  title: string;
  subtitle: string;
  era: string;
  turfName: string;
  postalCode: string;
  logoUsed: string;
  logoName: string;
  mapImage: string;
  actionImage: string;
  quote: string;
  summary: string;
  paragraphs: string[];
  milestones: { label: string; detail: string }[];
  colorsRule: string;
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: 'hoodie' | 'workshirt' | 'tee' | 'headwear' | 'bag' | string;
  categoryLabel: string;
  tier: string;
  era: string;
  frontImage: string;
  backImage?: string;
  description: string;
  specs: string[];
  badge?: string;
  badgeVariant?: 'red' | 'orange' | 'cyan' | 'slate';
  price?: string;
  priceNum?: number;
  subtitle?: string;
  tag?: string;
  flipAvailable?: boolean;
  inStock?: boolean;
  authCode?: string;
}

export interface MediaTrack {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  type: 'OFFICIAL MV' | 'OFFICIAL AUDIO' | 'ANTHEM' | 'DISS TRACK';
  target?: string;
  duration: string;
  thumb: string;
  description: string;
}

export interface WarArchive {
  id: string;
  videoId: string;
  title: string;
  streamer: string;
  rank: string;
  category: 'NAHMIER POV' | 'OG SPOTLIGHT' | 'LEAGUE WAR';
  thumb: string;
  tag: string;
}

export interface HierarchyTier {
  tier: string;
  code: string;
  name: string;
  role: string;
  desc: string;
  badgeColor: string;
}

// All data lives in JSON (src/data/wiki, src/data/community, src/data/roster.json).
// This module only adds types, so existing imports keep working.
import chapters from './wiki/chapters.json';
import hierarchy from './wiki/hierarchy.json';
import wars from './wiki/wars.json';
import roster from './roster.json';
import music from './community/music.json';
import merch from './community/merch.json';

export const LORE_CHAPTERS = chapters as LoreChapter[];
export const HIERARCHY_TIERS = hierarchy as HierarchyTier[];
export const WAR_ARCHIVES = wars as WarArchive[];
export const STREAMER_ROSTER = roster as StreamerMember[];
export const OFFICIAL_MEDIA_TRACKS = music as MediaTrack[];
export const WARDROBE_ITEMS = merch as WardrobeItem[];
