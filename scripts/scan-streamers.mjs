import fs from 'fs';
import path from 'path';

const ROSTER_PATH = path.resolve(process.cwd(), 'src/data/roster.json');
const SNAPSHOT_PATH = path.resolve(process.cwd(), 'src/data/live_snapshot.json');
const FIREBASE_URL = 'https://blood-186bd-default-rtdb.firebaseio.com/streamers.json';

const streamers = JSON.parse(fs.readFileSync(ROSTER_PATH, 'utf8'));

console.log(`[4Bloods Scanner] Loaded ${streamers.length} streamers from roster.`);

async function checkChannel(streamer) {
  const { channelId, name } = streamer;
  try {
    const res = await fetch(`https://www.youtube.com/channel/${channelId}/live`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(4500),
    });

    if (!res.ok) return { ...streamer, isLive: false, videoId: null };

    const html = await res.text();
    const canMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
    const canUrl = canMatch ? canMatch[1] : '';
    const vidMatch = canUrl.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
    const videoId = vidMatch ? vidMatch[1] : null;

    if (!videoId) return { ...streamer, isLive: false, videoId: null };

    const watchRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(4500),
    });

    if (!watchRes.ok) return { ...streamer, isLive: false, videoId: null };

    const watchHtml = await watchRes.text();
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

  // Sync to Firebase RTDB
  const fbPayload = {};
  for (const r of results) {
    fbPayload[r.channelId] = {
      channelId: r.channelId,
      name: r.name,
      isLive: Boolean(r.isLive),
      videoId: r.videoId || null,
      title: r.title || null,
      actualStartTime: r.actualStartTime || null,
      viewerCount: r.viewerCount || null,
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
