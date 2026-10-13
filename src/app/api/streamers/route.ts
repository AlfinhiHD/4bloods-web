import { NextResponse } from 'next/server';
import { STREAMER_ROSTER } from '@/data/4bloods-data';
import liveSnapshot from '@/data/live_snapshot.json';

// Server-side in-memory cache so auto-polling from clients doesn't spam YouTube
let lastScanTimestamp = 0;
let liveStatusMemory: Record<string, any> = {};
const SCAN_TTL_MS = 45_000; // 45 seconds TTL

/**
 * Helper: Get the exact UNIX timestamp (ms) for the END of TODAY in WIB (UTC+7).
 * Any upcoming stream MUST have scheduledStartTime > endOfTodayMs ("minimal lebih dari hari ini").
 */
function getEndOfTodayWibMs(nowMs = Date.now()): number {
  const wibOffsetMs = 7 * 60 * 60 * 1000;
  const wibDate = new Date(nowMs + wibOffsetMs);
  wibDate.setUTCHours(23, 59, 59, 999);
  return wibDate.getTime() - wibOffsetMs;
}

/**
 * 2-Step Strict YouTube Live & Real Upcoming Schedule Verification (100% Real YouTube Data, Zero Dummy):
 * 1. Fetch /channel/{id}/live to see if YouTube canonical redirects to /watch?v={videoId}
 * 2. If a videoId exists, fetch /watch?v={videoId} and check:
 *    - Mode A (LIVE NOW): `"liveBroadcastDetails":{"isLiveNow":true`
 *    - Mode B (REAL UPCOMING SCHEDULE): `"isLiveNow":false` (without `endTimestamp`) AND
 *      real YouTube scheduled start time (`upcomingEventData.startTime` or `startTimestamp`) is
 *      STRICTLY GREATER THAN TODAY (`scheduledMs > getEndOfTodayWibMs()`).
 */
async function checkYouTubeChannelLiveOrUpcoming(channelId: string) {
  try {
    const res = await fetch(`https://www.youtube.com/channel/${channelId}/live`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      cache: 'no-store',
    });
    const html = await res.text();
    const canMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
    const canUrl = canMatch ? canMatch[1] : '';
    const vidMatch = canUrl.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
    const videoId = vidMatch ? vidMatch[1] : null;

    if (!videoId) {
      return {
        isLive: false,
        videoId: null,
        streamTitle: null,
        startTimestamp: null,
        isUpcoming: false,
        upcomingVideoId: null,
        upcomingTitle: null,
        scheduledStartTime: null,
      };
    }

    const watchRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      cache: 'no-store',
    });
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
        upcomingVideoId: null,
        upcomingTitle: null,
        scheduledStartTime: null,
      };
    }

    // Check if this is a REAL YouTube Upcoming scheduled stream strictly > TODAY
    const hasEnded = watchHtml.includes('"endTimestamp":"');
    if (!hasEnded) {
      const upcomingEpochMatch = watchHtml.match(/"upcomingEventData":\{"startTime":"(\d+)"/);

      let scheduledMs = 0;
      if (upcomingEpochMatch) {
        scheduledMs = Number(upcomingEpochMatch[1]) * 1000;
      } else if (startTimestamp) {
        scheduledMs = new Date(startTimestamp).getTime();
      }

      const endOfTodayMs = getEndOfTodayWibMs();

      // STRICT RULE: Must be a real YouTube scheduled timestamp strictly > today
      if (scheduledMs > endOfTodayMs) {
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

    return {
      isLive: false,
      videoId: null,
      streamTitle: null,
      startTimestamp: null,
      isUpcoming: false,
      upcomingVideoId: null,
      upcomingTitle: null,
      scheduledStartTime: null,
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';

  const snapshotMap: Record<string, any> = {};
  for (const item of liveSnapshot as any[]) {
    snapshotMap[item.channelId] = {
      ...item,
      ...(liveStatusMemory[item.channelId] || {}),
    };
  }

  const now = Date.now();
  const endOfTodayMs = getEndOfTodayWibMs(now);
  const shouldScanLive = forceRefresh || now - lastScanTimestamp > SCAN_TTL_MS;

  if (shouldScanLive) {
    lastScanTimestamp = now;

    // 1. Pull real-time scanner data from 4bloodmw Firebase RTDB (all 54 channels)
    try {
      const [fbStreamersRes, fbAvatarsRes] = await Promise.all([
        fetch('https://blood-186bd-default-rtdb.firebaseio.com/streamers.json', {
          cache: 'no-store',
        }),
        fetch('https://blood-186bd-default-rtdb.firebaseio.com/avatars.json', {
          cache: 'no-store',
        }),
      ]);
      const fbStreamers = fbStreamersRes.ok ? await fbStreamersRes.json() : null;
      const fbAvatars = fbAvatarsRes.ok ? await fbAvatarsRes.json() : null;

      if (fbStreamers && typeof fbStreamers === 'object') {
        for (const [cid, fbData] of Object.entries(fbStreamers) as [string, any][]) {
          if (!fbData) continue;
          const prev = snapshotMap[cid] || {};
          snapshotMap[cid] = {
            ...prev,
            isLive: Boolean(fbData.isLive && fbData.videoId) || Boolean(prev.isLive),
            videoId: fbData.isLive && fbData.videoId ? fbData.videoId : prev.videoId || null,
            startTimestamp: fbData.actualStartTime || prev.startTimestamp || null,
            lastChecked: fbData.lastChecked || prev.lastChecked || null,
          };
        }
      }
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
    } catch {
      // Fallback gracefully if Firebase is unreachable
    }

    // 2. Also run direct YouTube Live + Upcoming check on priority & currently live channels
    const currentlyLiveIds = Object.values(snapshotMap)
      .filter((s: any) => s.isLive || s.isUpcoming)
      .map((s: any) => s.channelId)
      .filter(Boolean);

    const priorityIds = Array.from(
      new Set([
        ...currentlyLiveIds,
        'UCvseheuTcY-BnPGsmfQ5K5g', // Ackai (@Ackaiii)
        'UC9LmRRwAzHkCxlgbKW3tMjA', // Jane Elisha (@Deciii08)
        'UCHi0xCfpNPut25e_jcRcC3A', // Azmi (@AzmiWildan)
        'UCI1hbc1-qfszyjNYoNgkV2w', // Asep Teriyaki (@BarevsKi)
        'UCgO8kYJBkm5jvUJkV9H9mIw', // Nahmier Davies (@NAHMIER)
        'UCzjGSL8HMCRUi1sWH5VYGjQ', // Ilham Joseph
        'UC79cKOK5rTIABhvXxeINdHw', // Louis Ven
        'UCWpOmCvUcYgjMrNW4LjvmCw', // Deja Amari
        'UC6a-XQK_U4lsMfODIbgrFAA', // Muhammad Sumbul
        'UCiAlUeYsA39S5x_nQS2aT-Q', // Joy Braxton
        'UC7KiVxdO5HiAwIrbz--RG1w', // Geo Blitz (@xGiww)
        'UC8opURjNDJhx5OtgMsekvMQ', // Grimm Jow (@9rimmJ)
        'UCCEDmX6Jl-fwm4fywtwo4pQ', // Patra (@patraaa13)
        'UCYG2Pp0MZvxyziNXO8puT-Q', // znah (@OnlyHanz_)
        'UCtjLmmgBzjtND3i7bvyjLRQ', // Flip Flop (@oxidstudios)
        'UCVbGCNvads9e5vZCfGva4-g', // Kim (@NanzSpace)
        'UCqUhn7QlVk9MJStkR5Q_59g', // Ujang Walker (@Rzgggg)
      ])
    );

    await Promise.all(
      priorityIds.map(async (cid) => {
        const fresh = await checkYouTubeChannelLiveOrUpcoming(cid);
        if (fresh) {
          liveStatusMemory[cid] = fresh;
          snapshotMap[cid] = {
            ...(snapshotMap[cid] || {}),
            ...fresh,
          };
        }
      })
    );
  }

  const enrichedStreamers = STREAMER_ROSTER.map((member) => {
    const snap = snapshotMap[member.channelId] || {};
    const isActuallyLive = Boolean(snap.isLive && snap.videoId);
    const safeAvatar =
      snap.avatar && snap.avatar.trim() !== '' ? snap.avatar : '/assets/logo_v2.png';

    // Determine REAL YouTube Upcoming Status (Strictly > Today / endOfTodayMs, ZERO dummy)
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
      lastChecked: new Date(lastScanTimestamp || now).toISOString(),
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

  return NextResponse.json(
    {
      status: 'ok',
      lastScannerTime: new Date(lastScanTimestamp || now).toISOString(),
      liveCount: enrichedStreamers.filter((s) => s.isLive).length,
      upcomingCount: upcomingStreams.length,
      totalCount: enrichedStreamers.length,
      streamers: enrichedStreamers,
      upcomingStreams,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=45, stale-while-revalidate=60',
      },
    }
  );
}
