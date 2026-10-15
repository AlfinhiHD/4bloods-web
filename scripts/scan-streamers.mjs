import fs from 'fs';
import path from 'path';

const ROSTER_PATH = path.resolve(process.cwd(), 'src/data/roster.json');
const SNAPSHOT_PATH = path.resolve(process.cwd(), 'src/data/live_snapshot.json');
const FIREBASE_URL = 'https://blood-186bd-default-rtdb.firebaseio.com/streamers.json';

const streamers = JSON.parse(fs.readFileSync(ROSTER_PATH, 'utf8'));

console.log(`[4Bloods Scanner] Loaded ${streamers.length} streamers from roster.`);

const YT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Cookie: 'SOCS=CAESEwgDEgk2MTc3ODU0MjQaAmVuIAEaBgiA_LyaBg; CONSENT=PENDING+999',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function checkChannel(streamer) {
  const { channelId, name } = streamer;
  try {
    let videoId = null;

    // 1. Try canonical /live page
    try {
      const res = await fetch(`https://www.youtube.com/channel/${channelId}/live`, {
        headers: YT_HEADERS,
        redirect: 'follow',
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const html = await res.text();
        const canMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
        const canUrl = canMatch ? canMatch[1] : '';
        const vidMatch = canUrl.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
        if (vidMatch) {
          videoId = vidMatch[1];
        }
      }
    } catch {}

    // 2. Infallible RSS Fallback: Never blocked by consent/bot captcha on cloud/datacenter IPs
    if (!videoId) {
      try {
        const rssRes = await fetch(
          `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (rssRes.ok) {
          const xml = await rssRes.text();
          const rssVidMatch = xml.match(/<yt:videoId>([a-zA-Z0-9_-]{11})<\/yt:videoId>/);
          if (rssVidMatch) {
            videoId = rssVidMatch[1];
          }
        }
      } catch {}
    }

    if (!videoId) {
      return { ...streamer, isLive: false, videoId: null, unverified: true };
    }

    const watchRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: YT_HEADERS,
      signal: AbortSignal.timeout(4500),
    });

    if (!watchRes.ok) {
      return { ...streamer, isLive: false, videoId: null, unverified: true };
    }

    const watchHtml = await watchRes.text();
    const isBotChallenge =
      watchHtml.includes('consent.youtube.com') ||
      watchHtml.includes('google.com/sorry') ||
      watchHtml.includes('unusual traffic') ||
      !watchHtml.includes('<title>');

    if (isBotChallenge) {
      return { ...streamer, isLive: false, videoId: null, botChallenged: true };
    }

    const isOffline =
      watchHtml.includes('LIVE_STREAM_OFFLINE') ||
      watchHtml.includes('"isLiveNow":false') ||
      watchHtml.includes('"endTimestamp":"') ||
      watchHtml.includes('This live stream has ended') ||
      watchHtml.includes('Siaran langsung telah berakhir') ||
      watchHtml.includes('Stream telah berakhir');

    const isLiveNow =
      !isOffline &&
      (watchHtml.includes('"liveBroadcastDetails":{"isLiveNow":true') ||
        watchHtml.includes('"isLiveNow":true'));

    const titleMatch =
      watchHtml.match(/<meta name="title" content="([^"]+)"/) ||
      watchHtml.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : null;

    const startMatch = watchHtml.match(/"startTimestamp":"([^"]+)"/);
    const actualStartTime = startMatch ? startMatch[1] : null;

    const viewerMatch =
      watchHtml.match(/"originalViewCount":"(\d+)"/) ||
      watchHtml.match(/"viewCount":\{"runs":\[\{"text":"([\d,.]+)"\}/) ||
      watchHtml.match(/([0-9,.]+)\s*(?:watching now|menonton sekarang)/i);
    let viewerCount = null;
    if (viewerMatch) {
      const parsed = parseInt(viewerMatch[1].replace(/[,.]/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) viewerCount = parsed;
    }

    return {
      ...streamer,
      isLive: isLiveNow,
      videoId: isLiveNow ? videoId : null,
      title: isLiveNow ? title : null,
      actualStartTime: isLiveNow ? actualStartTime : null,
      viewerCount: isLiveNow ? viewerCount : null,
      verifiedOffline: isOffline,
      lastChecked: new Date().toISOString(),
    };
  } catch (err) {
    return { ...streamer, isLive: false, videoId: null, error: err.message };
  }
}

async function main() {
  const t0 = Date.now();
  const chunkSize = 8;
  const results = [];

  for (let i = 0; i < streamers.length; i += chunkSize) {
    const chunk = streamers.slice(i, i + chunkSize);
    console.log(`[Scanning] ${i + 1} to ${Math.min(i + chunkSize, streamers.length)} of ${streamers.length}...`);
    const chunkRes = await Promise.all(chunk.map(checkChannel));
    results.push(...chunkRes);
  }

  const live = results.filter((r) => r.isLive);
  console.log(`\n=== SCAN COMPLETE in ${Math.round((Date.now() - t0) / 1000)}s ===`);
  console.log(`Found ${live.length} LIVE streamers:`);
  live.forEach((l) =>
    console.log(`- ${l.name} (${l.channelId}): "${l.title}" [${l.videoId}] viewers: ${l.viewerCount || 0}`)
  );

  // 1. Fetch current existing Firebase state
  let existingFbData = {};
  try {
    const existingRes = await fetch(FIREBASE_URL, { signal: AbortSignal.timeout(5000) });
    if (existingRes.ok) {
      existingFbData = (await existingRes.json()) || {};
    }
  } catch (e) {
    console.warn('[Safety] Failed to read current Firebase state:', e.message);
  }

  const existingLiveCount = Object.values(existingFbData).filter((s) => s?.isLive).length;

  // 2. Safety Circuit Breaker:
  // If scan found 0 live streams while Firebase has confirmed live streams,
  // it means the runner is likely blocked by YouTube. DO NOT wipe legitimate live data!
  if (live.length === 0 && existingLiveCount > 0) {
    console.warn(
      `[Safety Shield] Scanner detected 0 live streams while Firebase currently has ${existingLiveCount} live streams. Possible bot challenge/rate-limiting. SKIPPING Firebase wipe to protect legitimate data!`
    );
    return;
  }

  // 3. Build smart delta payload
  const fbPayload = {};
  for (const r of results) {
    const prev = existingFbData[r.channelId];

    // If channel was live, but current check was inconclusive (unverified / bot challenge / timeout),
    // PRESERVE the previous live state so transient network glitches do not mark streamers offline!
    if (prev?.isLive && (r.unverified || r.botChallenged || r.error)) {
      fbPayload[r.channelId] = {
        ...prev,
        lastChecked: new Date().toISOString(),
      };
      continue;
    }

    fbPayload[r.channelId] = {
      channelId: r.channelId,
      name: r.name,
      isLive: Boolean(r.isLive),
      videoId: r.isLive ? r.videoId : null,
      title: r.isLive ? r.title : null,
      actualStartTime: r.isLive ? r.actualStartTime : null,
      viewerCount: r.isLive ? r.viewerCount : null,
      lastChecked: new Date().toISOString(),
    };
  }

  try {
    const fbRes = await fetch(FIREBASE_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fbPayload),
    });
    console.log(`Synced to Firebase RTDB (Status: ${fbRes.status})`);
  } catch (err) {
    console.error('Failed to sync to Firebase:', err.message);
  }

  // Update live_snapshot.json
  try {
    if (fs.existsSync(SNAPSHOT_PATH)) {
      const snapshotList = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
      for (const item of snapshotList) {
        const fresh = fbPayload[item.channelId];
        if (fresh) {
          item.isLive = fresh.isLive;
          item.videoId = fresh.videoId;
          item.streamTitle = fresh.title;
          item.viewerCount = fresh.viewerCount;
          item.startTimestamp = fresh.actualStartTime;
          item.viewerCount = fresh.viewerCount;
        }
      }
      fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshotList, null, 2), 'utf8');
      console.log('Synced to live_snapshot.json');
    }
  } catch (err) {
    console.error('Failed to update live_snapshot.json:', err.message);
  }
}

main();
