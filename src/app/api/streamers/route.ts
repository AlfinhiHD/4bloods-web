import { NextResponse } from 'next/server';
import { STREAMER_ROSTER } from '@/data/4bloods-data';
import liveSnapshot from '@/data/live_snapshot.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 10; // Vercel hobby serverless execution limit

// Server-side in-memory cache
let lastScanTimestamp = 0;
let cachedStreamersResponse: any = null;
const SCAN_TTL_MS = 25_000; // 25 seconds TTL

/**
 * Helper: Get the exact UNIX timestamp (ms) for the END of TODAY in WIB (UTC+7).
 */
function getEndOfTodayWibMs(nowMs = Date.now()): number {
  const wibOffsetMs = 7 * 60 * 60 * 1000;
  const wibDate = new Date(nowMs + wibOffsetMs);
  wibDate.setUTCHours(23, 59, 59, 999);
  return wibDate.getTime() - wibOffsetMs;
}

/**
 * Safe YouTube Live Check with strict 2-second timeout guard.
 * Prevents Vercel serverless functions from hanging and returning 504 Gateway Timeout.
 */
async function safeCheckYouTubeChannel(channelId: string) {
  try {
    const res = await fetch(`https://www.youtube.com/channel/${channelId}/live`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });

    if (!res.ok) return null;

    const html = await res.text();
    const canMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
    const canUrl = canMatch ? canMatch[1] : '';
    const vidMatch = canUrl.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
    const videoId = vidMatch ? vidMatch[1] : null;

    if (!videoId) return null;

    const watchRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });

    if (!watchRes.ok) return null;

    const watchHtml = await watchRes.text();
    const isLiveNow = watchHtml.includes('"liveBroadcastDetails":{"isLiveNow":true');
    const titleMatch = watchHtml.match(/<meta name="title" content="([^"]+)"/);
    const streamTitle = titleMatch ? titleMatch[1] : null;
    const startMatch = watchHtml.match(/"startTimestamp":"([^"]+)"/);
    const startTimestamp = startMatch ? startMatch[1] : null;

    if (isLiveNow) {
      return {
        isLive: true,
        videoId,
        streamTitle,
        startTimestamp,
        isUpcoming: false,
      };
    }

    // Check upcoming scheduled streams > end of today WIB
    const hasEnded = watchHtml.includes('"endTimestamp":"');
    if (!hasEnded) {
      const upcomingEpochMatch = watchHtml.match(/"upcomingEventData":\{"startTime":"(\d+)"/);
      let scheduledMs = 0;
      if (upcomingEpochMatch) {
        scheduledMs = Number(upcomingEpochMatch[1]) * 1000;
      } else if (startTimestamp) {
        scheduledMs = new Date(startTimestamp).getTime();
      }

      if (scheduledMs > getEndOfTodayWibMs()) {
        return {
          isLive: false,
          videoId: null,
          streamTitle: null,
          startTimestamp: null,
          isUpcoming: true,
          upcomingVideoId: videoId,
          upcomingTitle: streamTitle,
          scheduledStartTime: new Date(scheduledMs).toISOString(),
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';
  const now = Date.now();

  // Return cached result if fresh and not force-refreshing
  if (!forceRefresh && cachedStreamersResponse && now - lastScanTimestamp < SCAN_TTL_MS) {
    return NextResponse.json(cachedStreamersResponse, {
      headers: {
        'Cache-Control': 'public, s-maxage=25, stale-while-revalidate=45',
      },
    });
  }

  // Base snapshot map
  const snapshotMap: Record<string, any> = {};
  for (const item of liveSnapshot as any[]) {
    snapshotMap[item.channelId] = { ...item };
  }

  let firebaseSuccess = false;

  // 1. Fetch Real-time Scanner Data from 4Blood Firebase RTDB (Ultra-fast, ~150ms, Never Blocked on Vercel)
  try {
    const [fbStreamersRes, fbAvatarsRes] = await Promise.all([
      fetch('https://blood-186bd-default-rtdb.firebaseio.com/streamers.json', {
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      }),
      fetch('https://blood-186bd-default-rtdb.firebaseio.com/avatars.json', {
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      }),
    ]);

    if (fbStreamersRes.ok) {
      const fbStreamersText = await fbStreamersRes.text();
      let fbStreamers: any = null;
      try {
        fbStreamers = fbStreamersText ? JSON.parse(fbStreamersText) : null;
      } catch {}
      if (fbStreamers && typeof fbStreamers === 'object') {
        firebaseSuccess = true;
        for (const [cid, fbData] of Object.entries(fbStreamers) as [string, any][]) {
          if (!fbData) continue;
          const prev = snapshotMap[cid] || {};
          const isCandidateLive = Boolean(fbData.isLive && fbData.videoId);
          snapshotMap[cid] = {
            ...prev,
            isLive: isCandidateLive,
            videoId: isCandidateLive ? fbData.videoId : null,
            streamTitle: isCandidateLive ? fbData.title || prev.streamTitle || null : null,
            startTimestamp: isCandidateLive
              ? fbData.actualStartTime || prev.startTimestamp || null
              : null,
            lastChecked: fbData.lastChecked || prev.lastChecked || null,
          };
        }
      }
    }

    if (fbAvatarsRes.ok) {
      const fbAvatarsText = await fbAvatarsRes.text();
      let fbAvatars: any = null;
      try {
        fbAvatars = fbAvatarsText ? JSON.parse(fbAvatarsText) : null;
      } catch {}
      if (fbAvatars && typeof fbAvatars === 'object') {
        for (const [cid, avatarUrl] of Object.entries(fbAvatars) as [string, any][]) {
          if (typeof avatarUrl === 'string' && avatarUrl.trim()) {
            snapshotMap[cid] = {
              ...(snapshotMap[cid] || {}),
              avatar: avatarUrl,
            };
          }
        }
      }
    }
  } catch (err) {
    // Firebase failed or timed out — will fall back to static snapshot gracefully
    console.warn('[API /api/streamers] Firebase fetch warning:', err);
  }

  // 2. ACTIVE STREAM VERIFIER: Strict YouTube check to ensure ended streams never get stuck
  const activeLiveEntries = Object.entries(snapshotMap).filter(
    ([_, s]: [string, any]) => s.isLive && s.videoId
  );

  if (activeLiveEntries.length > 0) {
    await Promise.all(
      activeLiveEntries.map(async ([cid, snap]) => {
        try {
          const checkRes = await fetch(`https://www.youtube.com/watch?v=${snap.videoId}`, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            },
            cache: 'no-store',
            signal: AbortSignal.timeout(3500),
          });

          if (!checkRes.ok) {
            // Video 404/410/private on YouTube -> definitely offline
            snapshotMap[cid].isLive = false;
            snapshotMap[cid].videoId = null;
            snapshotMap[cid].streamTitle = null;
            snapshotMap[cid].viewerCount = null;
            return;
          }

          const html = await checkRes.text();
          const isBotChallenge =
            html.length < 15000 &&
            (html.includes('consent.youtube.com') ||
              html.includes('google.com/sorry') ||
              html.includes('unusual traffic') ||
              !html.includes('<title>'));

          const hasExplicitlyEnded =
            html.includes('"endTimestamp":"') ||
            html.includes('"isLiveNow":false') ||
            html.includes('"status":"LIVE_STREAM_OFFLINE"') ||
            html.includes('LIVE_STREAM_OFFLINE') ||
            html.includes('This live stream has ended') ||
            html.includes('Live stream offline') ||
            html.includes('Siaran langsung telah berakhir') ||
            html.includes('Stream telah berakhir');

          const isLiveNow =
            !hasExplicitlyEnded &&
            (html.includes('"isLiveNow":true') ||
              html.includes('"isLive":true') ||
              html.includes('"isLiveBroadcast":true'));

          if (!isBotChallenge) {
            if (hasExplicitlyEnded || !isLiveNow) {
              // Stream has finished or is offline on YouTube! Auto-clear stuck live status
              snapshotMap[cid].isLive = false;
              snapshotMap[cid].videoId = null;
              snapshotMap[cid].streamTitle = null;
              snapshotMap[cid].viewerCount = null;
            } else if (isLiveNow) {
              // Extract real concurrent live viewer count
              const viewerMatch =
                html.match(/"originalViewCount":"(\d+)"/) ||
                html.match(/"viewCount":\{"runs":\[\{"text":"([\d,.]+)"\}/) ||
                html.match(/"viewCount":\{"videoViewCountRenderer":\{"viewCount":\{"runs":\[\{"text":"([\d,.]+)"\}/) ||
                html.match(/"text":"([\d,.]+)\s*(?:watching now|menonton|viewers|serentak)"/i) ||
                html.match(/([0-9,.]+)\s*(?:watching now|menonton sekarang)/i);

              if (viewerMatch) {
                const rawNum = viewerMatch[1].replace(/[,.]/g, '');
                const parsed = parseInt(rawNum, 10);
                if (!isNaN(parsed) && parsed > 0) {
                  snapshotMap[cid].viewerCount = parsed;
                }
              }
            }
          }
        } catch {
          // If Firebase data is older than 15 mins and YouTube check timed out, clear stuck status
          const lastCheckMs = snap.lastChecked ? new Date(snap.lastChecked).getTime() : 0;
          if (lastCheckMs && now - lastCheckMs > 15 * 60 * 1000) {
            snapshotMap[cid].isLive = false;
            snapshotMap[cid].videoId = null;
            snapshotMap[cid].streamTitle = null;
            snapshotMap[cid].viewerCount = null;
          }
        }
      })
    );
  }

  // 3. Optional: YouTube Data API v3 check if user provided YOUTUBE_API_KEY in Vercel environment
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  if (apiKey) {
    try {
      // Find currently known live video IDs to verify them official-way
      const liveVideoIds = Object.values(snapshotMap)
        .filter((s: any) => s.isLive && s.videoId)
        .map((s: any) => s.videoId)
        .slice(0, 50)
        .join(',');

      if (liveVideoIds) {
        const ytRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${liveVideoIds}&key=${apiKey}`,
          { signal: AbortSignal.timeout(2500) }
        );
        if (ytRes.ok) {
          const ytData = await ytRes.json();
          if (ytData.items) {
            for (const item of ytData.items) {
              const cid = item.snippet?.channelId;
              if (cid && snapshotMap[cid]) {
                const isActuallyLive = item.snippet?.liveBroadcastContent === 'live';
                if (!isActuallyLive) {
                  // Video has ended
                  snapshotMap[cid].isLive = false;
                  snapshotMap[cid].videoId = null;
                } else {
                  snapshotMap[cid].streamTitle = item.snippet?.title || snapshotMap[cid].streamTitle;
                }
              }
            }
          }
        }
      }
    } catch {
      // Ignore API key error
    }
  }

  const endOfTodayMs = getEndOfTodayWibMs(now);

  const enrichedStreamers = STREAMER_ROSTER.map((member) => {
    const snap = snapshotMap[member.channelId] || {};
    const isActuallyLive = Boolean(snap.isLive && snap.videoId);
    const safeAvatar =
      snap.avatar && snap.avatar.trim() !== '' ? snap.avatar : '/assets/logo_v2.png';

    let isUpcoming = false;
    let upcomingVideoId: string | null = null;
    let upcomingTitle: string | null = null;
    let scheduledStartTime: string | null = null;

    if (!isActuallyLive && snap.isUpcoming && snap.scheduledStartTime && snap.upcomingVideoId) {
      const schedMs = new Date(snap.scheduledStartTime).getTime();
      if (schedMs > endOfTodayMs) {
        isUpcoming = true;
        upcomingVideoId = snap.upcomingVideoId;
        upcomingTitle = snap.upcomingTitle || `${member.name} Scheduled Live`;
        scheduledStartTime = snap.scheduledStartTime;
      }
    }

    return {
      ...member,
      handle: snap.handle || null,
      avatar: safeAvatar,
      isLive: isActuallyLive,
      videoId: isActuallyLive ? snap.videoId : null,
      viewerCount: isActuallyLive ? snap.viewerCount || null : null,
      streamTitle: isActuallyLive ? snap.streamTitle || `${member.name} Live Stream` : null,
      startTimestamp: snap.startTimestamp || null,
      isUpcoming,
      upcomingVideoId,
      upcomingTitle,
      scheduledStartTime,
      thumbnail:
        isActuallyLive && snap.videoId
          ? `https://i.ytimg.com/vi/${snap.videoId}/hqdefault.jpg`
          : upcomingVideoId
            ? `https://i.ytimg.com/vi/${upcomingVideoId}/hqdefault.jpg`
            : member.featuredThumb || '/assets/yt_this_is_4bloods.jpg',
      lastChecked: new Date(now).toISOString(),
    };
  });

  const rankWeight: Record<string, number> = {
    OG: 1,
    'Under OG': 2,
    'Young Bloods': 3,
    Member: 4,
  };

  enrichedStreamers.sort((a, b) => {
    if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
    if (a.isUpcoming !== b.isUpcoming) return a.isUpcoming ? -1 : 1;
    return (rankWeight[a.rank] || 9) - (rankWeight[b.rank] || 9);
  });

  const upcomingStreams = enrichedStreamers
    .filter((s) => s.isUpcoming && s.scheduledStartTime && s.upcomingVideoId)
    .sort(
      (a, b) =>
        new Date(a.scheduledStartTime!).getTime() - new Date(b.scheduledStartTime!).getTime()
    );

  const responseBody = {
    status: 'ok',
    lastScannerTime: new Date(now).toISOString(),
    liveCount: enrichedStreamers.filter((s) => s.isLive).length,
    upcomingCount: upcomingStreams.length,
    totalCount: enrichedStreamers.length,
    streamers: enrichedStreamers,
    upcomingStreams,
  };

  lastScanTimestamp = now;
  cachedStreamersResponse = responseBody;

  return NextResponse.json(responseBody, {
    headers: {
      'Cache-Control': 'public, s-maxage=25, stale-while-revalidate=45',
    },
  });
}
